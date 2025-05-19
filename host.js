// Host page JavaScript

// Format date for display
function formatDate(dateString) {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  // Generate a unique ID for events
  function generateEventId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
  }
  
  // Delete an event
  function deleteEvent(eventId) {
    if (confirm("Are you sure you want to delete this event?")) {
      const events = JSON.parse(localStorage.getItem("events") || "[]");
      const updatedEvents = events.filter(e => e.id !== eventId);
      localStorage.setItem("events", JSON.stringify(updatedEvents));
      displayOrganizerEvents(); // Refresh the display
    }
  }
  
  // Display all events for the current organizer
  function displayOrganizerEvents() {
    const organizerInput = document.getElementById("organizer");
    const organizer = organizerInput ? organizerInput.value : "";
    
    // If no organizer name entered yet, don't show anything
    if (!organizer) {
      document.getElementById("noEvents").classList.remove("hidden");
      return;
    }
    
    const allEvents = JSON.parse(localStorage.getItem("events") || "[]");
    const organizerEvents = allEvents.filter(e => e.organizer === organizer);
    const eventsContainer = document.getElementById("organizerEvents");
    
    // Clear existing content
    eventsContainer.innerHTML = "";
    
    if (organizerEvents.length === 0) {
      document.getElementById("noEvents").classList.remove("hidden");
      eventsContainer.appendChild(document.getElementById("noEvents"));
      return;
    }
    
    document.getElementById("noEvents").classList.add("hidden");
    
    // Sort events by date (newest first)
    organizerEvents.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
    
    // Create event cards
    organizerEvents.forEach(event => {
      const eventCard = document.createElement("div");
      eventCard.className = "event-card";
      eventCard.innerHTML = `
        <h3>${event.name}</h3>
        <p class="event-date">${formatDate(event.datetime)}</p>
        <p class="event-location"><strong>Location:</strong> ${event.location || 'Not specified'}</p>
        <p class="event-category"><strong>Category:</strong> ${event.category || 'Not categorized'}</p>
        <p class="event-description">${event.description}</p>
        <div class="event-actions">
          <button class="edit-button" data-id="${event.id}">Edit</button>
          <button class="delete-button" data-id="${event.id}">Delete</button>
        </div>
      `;
      eventsContainer.appendChild(eventCard);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll(".delete-button").forEach(button => {
      button.addEventListener("click", () => deleteEvent(button.dataset.id));
    });
    
    document.querySelectorAll(".edit-button").forEach(button => {
      button.addEventListener("click", () => editEvent(button.dataset.id));
    });
  }
  
  // Populate the form for editing
  function editEvent(eventId) {
    const events = JSON.parse(localStorage.getItem("events") || "[]");
    const event = events.find(e => e.id === eventId);
    
    if (event) {
      // Fill the form fields
      document.getElementById("name").value = event.name;
      document.getElementById("organizer").value = event.organizer;
      document.getElementById("datetime").value = event.datetime.substring(0, 16); // Format for datetime-local
      if (event.location) document.getElementById("location").value = event.location;
      if (event.category) document.getElementById("category").value = event.category;
      document.getElementById("description").value = event.description;
      if (event.contactEmail) document.getElementById("contactEmail").value = event.contactEmail;
      if (event.contactPhone) document.getElementById("contactPhone").value = event.contactPhone;
      if (event.registrationLink) document.getElementById("registrationLink").value = event.registrationLink;
      
      // Change form behavior to update instead of create
      const form = document.getElementById("hostEventForm");
      form.dataset.editing = eventId;
      
      // Change button text
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.textContent = "Update Event";
      
      // Scroll to form
      form.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  // Function to create a direct Google Calendar event link
  function createGoogleCalendarLink(event) {
    // Format the event data for Google Calendar URL
    const eventName = encodeURIComponent(event.name || 'UMD Event');
    const eventLocation = encodeURIComponent(event.location || 'University of Maryland');
    const eventDescription = encodeURIComponent(
      `${event.description || ''}\n\nOrganized by: ${event.organizer || 'UMD'}\n` +
      `Contact: ${event.contactEmail || ''}\n` +
      `${event.contactPhone ? 'Phone: ' + event.contactPhone + '\n' : ''}` +
      `${event.registrationLink ? 'Registration: ' + event.registrationLink : ''}`
    );
    
    // Calculate start and end time (default to 2-hour events)
    const startDate = new Date(event.datetime);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2); // Default 2-hour event
    
    // Format dates for Google Calendar URL
    const startIso = startDate.toISOString().replace(/-|:|\.\d+/g, '');
    const endIso = endDate.toISOString().replace(/-|:|\.\d+/g, '');
    
    // Create the calendar URL
    return `https://www.google.com/calendar/render?action=TEMPLATE` +
           `&text=${eventName}` +
           `&details=${eventDescription}` +
           `&location=${eventLocation}` +
           `&dates=${startIso}/${endIso}`;
  }
  
  // Add event to calendar using direct URL approach (no OAuth needed)
  function addEventToCalendar(eventData) {
    // First save the event to local storage
    saveEventToLocalStorage(eventData);
    
    // Then open the Google Calendar link in a new tab
    const calendarUrl = createGoogleCalendarLink(eventData);
    window.open(calendarUrl, '_blank');
    
    // Show success message
    alert("Event created successfully! A new tab has been opened where you can add this event to your Google Calendar.");
    
    // Reset the form
    const form = document.getElementById('hostEventForm');
    if (form.dataset.editing) {
      delete form.dataset.editing;
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.textContent = "Create Event";
    }
    form.reset();
    
    // Refresh the events display
    displayOrganizerEvents();
  }
  
  // Helper function to save event to localStorage
  function saveEventToLocalStorage(eventData) {
    // Use existing ID if editing, otherwise generate new one
    if (!eventData.id && !document.getElementById("hostEventForm").dataset.editing) {
      eventData.id = generateEventId();
      eventData.createdAt = new Date().toISOString();
    } else if (document.getElementById("hostEventForm").dataset.editing) {
      eventData.id = document.getElementById("hostEventForm").dataset.editing;
    }
    
    const events = JSON.parse(localStorage.getItem("events") || "[]");
    
    // Check if we're updating an existing event
    const existingIndex = events.findIndex(e => e.id === eventData.id);
    
    if (existingIndex !== -1) {
      // Update existing event
      eventData.updatedAt = new Date().toISOString();
      events[existingIndex] = eventData;
    } else {
      // Add new event
      eventData.createdAt = new Date().toISOString();
      events.push(eventData);
    }
    
    localStorage.setItem("events", JSON.stringify(events));
    return eventData;
  }
  
  // Initialize the page
  document.addEventListener("DOMContentLoaded", () => {
    // Set up form submission
    const form = document.getElementById("hostEventForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Collect form data
        const eventData = {
          name: document.getElementById("name").value,
          organizer: document.getElementById("organizer").value,
          datetime: document.getElementById("datetime").value,
          location: document.getElementById("location").value,
          category: document.getElementById("category").value,
          description: document.getElementById("description").value,
          contactEmail: document.getElementById("contactEmail").value,
          contactPhone: document.getElementById("contactPhone").value || null,
          registrationLink: document.getElementById("registrationLink").value || null
        };
        
        // Check if we're editing an existing event
        if (form.dataset.editing) {
          eventData.id = form.dataset.editing;
        }
        
        // Check if we need to add to Google Calendar
        const addToCalendar = document.getElementById("addToCalendar").checked;
        
        if (addToCalendar) {
          // Use the simplified calendar approach
          addEventToCalendar(eventData);
        } else {
          // Just save to local storage
          saveEventToLocalStorage(eventData);
          
          // Reset form for new events
          if (form.dataset.editing) {
            delete form.dataset.editing;
            form.querySelector('button[type="submit"]').textContent = "Create Event";
          }
          form.reset();
          
          // Show updated events
          displayOrganizerEvents();
          
          alert("Event created successfully!");
        }
      });
    }
    
    // Set up real-time filtering of events when organizer name changes
    const organizerInput = document.getElementById("organizer");
    if (organizerInput) {
      organizerInput.addEventListener("input", displayOrganizerEvents);
    }
    
    // Initial display of events
    displayOrganizerEvents();
  });