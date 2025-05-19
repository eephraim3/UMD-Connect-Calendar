// Events page JavaScript

// Function to format dates for display
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
  
  // Function to format just the time
  function formatTime(dateString) {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  }
  
  // Check if a date is today
  function isToday(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }
  
  // Get all events from localStorage
  function getAllEvents() {
    return JSON.parse(localStorage.getItem("events") || "[]");
  }
  
  // Filter events based on search and filter criteria
  function filterEvents(events, searchTerm, category, location, dateFilter) {
    return events.filter(event => {
      // Search term filtering
      if (searchTerm && !event.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !event.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Category filtering
      if (category && event.category !== category) {
        return false;
      }
      
      // Location filtering
      if (location && event.location !== location) {
        return false;
      }
      
      // Date filtering
      if (dateFilter) {
        const eventDate = new Date(event.datetime);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Check if the event matches the date filter
        switch (dateFilter) {
          case 'today':
            if (eventDate.getDate() !== today.getDate() ||
                eventDate.getMonth() !== today.getMonth() ||
                eventDate.getFullYear() !== today.getFullYear()) {
              return false;
            }
            break;
          case 'tomorrow':
            if (eventDate.getDate() !== tomorrow.getDate() ||
                eventDate.getMonth() !== tomorrow.getMonth() ||
                eventDate.getFullYear() !== tomorrow.getFullYear()) {
              return false;
            }
            break;
          case 'thisWeek':
            const endOfWeek = new Date(today);
            endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
            if (eventDate < today || eventDate > endOfWeek) {
              return false;
            }
            break;
          case 'nextWeek':
            const startOfNextWeek = new Date(today);
            startOfNextWeek.setDate(today.getDate() + (7 - today.getDay() + 1));
            const endOfNextWeek = new Date(startOfNextWeek);
            endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
            if (eventDate < startOfNextWeek || eventDate > endOfNextWeek) {
              return false;
            }
            break;
          case 'thisMonth':
            if (eventDate.getMonth() !== today.getMonth() ||
                eventDate.getFullYear() !== today.getFullYear()) {
              return false;
            }
            break;
        }
      }
      
      return true;
    });
  }
  
  // Display events in grid view
  function displayEventsGrid(events) {
    const container = document.getElementById('eventsContainer');
    container.innerHTML = '';
    
    // Show "no events" message if no events match
    if (events.length === 0) {
      document.getElementById('noEventsMessage').classList.remove('hidden');
      container.appendChild(document.getElementById('noEventsMessage'));
      return;
    }
    
    document.getElementById('noEventsMessage').classList.add('hidden');
    
    // Sort events by date (earliest first)
    events.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    
    // Create event cards
    events.forEach(event => {
      const eventCard = document.createElement('div');
      eventCard.className = 'event-card';
      
      // Add "today" badge if the event is today
      if (isToday(event.datetime)) {
        eventCard.classList.add('today-event');
      }
      
      // Create event category tag
      const categoryTag = document.createElement('span');
      categoryTag.className = 'event-category-tag';
      categoryTag.textContent = event.category || 'Uncategorized';
      
      // Create event header
      const eventHeader = document.createElement('div');
      eventHeader.className = 'event-header';
      
      const eventTitle = document.createElement('h3');
      eventTitle.textContent = event.name;
      
      eventHeader.appendChild(eventTitle);
      
      // Event details
      const eventDate = document.createElement('p');
      eventDate.className = 'event-date';
      eventDate.textContent = formatDate(event.datetime);
      
      const eventLocation = document.createElement('p');
      eventLocation.className = 'event-location';
      eventLocation.textContent = event.location || 'Location not specified';
      
      const eventDesc = document.createElement('p');
      eventDesc.className = 'event-description-preview';
      eventDesc.textContent = event.description ? (event.description.length > 100 ? 
        event.description.substring(0, 100) + '...' : event.description) : 'No description available';
      
      // View details button
      const viewDetailsBtn = document.createElement('button');
      viewDetailsBtn.className = 'view-details-button';
      viewDetailsBtn.textContent = 'View Details';
      viewDetailsBtn.addEventListener('click', () => showEventDetails(event));
      
      // Assemble card
      eventCard.appendChild(categoryTag);
      eventCard.appendChild(eventHeader);
      eventCard.appendChild(eventDate);
      eventCard.appendChild(eventLocation);
      eventCard.appendChild(eventDesc);
      eventCard.appendChild(viewDetailsBtn);
      
      container.appendChild(eventCard);
    });
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
  
  // Display events in list view
  function displayEventsList(events) {
    const container = document.getElementById('eventsContainer');
    container.innerHTML = '';
    
    if (events.length === 0) {
      document.getElementById('noEventsMessage').classList.remove('hidden');
      container.appendChild(document.getElementById('noEventsMessage'));
      return;
    }
    
    document.getElementById('noEventsMessage').classList.add('hidden');
    
    // Sort events by date
    events.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    
    // Group events by date
    const eventsByDate = {};
    events.forEach(event => {
      const eventDate = new Date(event.datetime);
      const dateKey = `${eventDate.getFullYear()}-${eventDate.getMonth()}-${eventDate.getDate()}`;
      
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      
      eventsByDate[dateKey].push(event);
    });
    
    // Create list items for each date group
    for (const dateKey in eventsByDate) {
      const eventsForDate = eventsByDate[dateKey];
      const firstEvent = eventsForDate[0];
      const eventDate = new Date(firstEvent.datetime);
      
      // Create date header
      const dateHeader = document.createElement('div');
      dateHeader.className = 'date-header';
      
      // Format date for header
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      dateHeader.textContent = eventDate.toLocaleDateString(undefined, options);
      
      container.appendChild(dateHeader);
      
      // Create list items for this date
      eventsForDate.forEach(event => {
        const listItem = document.createElement('div');
        listItem.className = 'event-list-item';
        
        // Check if the event is today
        if (isToday(event.datetime)) {
          listItem.classList.add('today-event');
        }
        
        // Time column
        const timeCol = document.createElement('div');
        timeCol.className = 'event-time';
        timeCol.textContent = formatTime(event.datetime);
        
        // Details column
        const detailsCol = document.createElement('div');
        detailsCol.className = 'event-details';
        
        const eventTitle = document.createElement('h3');
        eventTitle.textContent = event.name;
        
        const eventLocation = document.createElement('p');
        eventLocation.className = 'event-location';
        eventLocation.textContent = event.location || 'Location not specified';
        
        const eventOrganizer = document.createElement('p');
        eventOrganizer.className = 'event-organizer';
        eventOrganizer.textContent = `Organized by: ${event.organizer || 'Unknown'}`;
        
        detailsCol.appendChild(eventTitle);
        detailsCol.appendChild(eventLocation);
        detailsCol.appendChild(eventOrganizer);
        
        // Category column
        const categoryCol = document.createElement('div');
        categoryCol.className = 'event-category';
        
        const categoryTag = document.createElement('span');
        categoryTag.className = 'event-category-tag';
        categoryTag.textContent = event.category || 'Uncategorized';
        
        categoryCol.appendChild(categoryTag);
        
        // Button column
        const buttonCol = document.createElement('div');
        
        const detailsButton = document.createElement('button');
        detailsButton.className = 'primary-button';
        detailsButton.textContent = 'Details';
        detailsButton.addEventListener('click', () => showEventDetails(event));
        
        buttonCol.appendChild(detailsButton);
        
        // Assemble list item
        listItem.appendChild(timeCol);
        listItem.appendChild(detailsCol);
        listItem.appendChild(categoryCol);
        listItem.appendChild(buttonCol);
        
        container.appendChild(listItem);
      });
    }
  }
  
  // Show event details modal
  function showEventDetails(event) {
    // Get the modal
    const modal = document.getElementById('eventModal');
    
    // Get the modal content container
    const eventDetails = document.getElementById('eventDetails');
    
    // Populate event details
    eventDetails.innerHTML = `
      <h2>${event.name}</h2>
      <p class="event-date">${formatDate(event.datetime)}</p>
      <p class="event-location"><strong>Location:</strong> ${event.location || 'Not specified'}</p>
      <p class="event-organizer"><strong>Organized by:</strong> ${event.organizer || 'Not specified'}</p>
      <div class="event-description-full">
        <p>${event.description || 'No description available.'}</p>
      </div>
      <div class="event-contact">
        ${event.contactEmail ? `<p><strong>Contact:</strong> ${event.contactEmail}</p>` : ''}
        ${event.contactPhone ? `<p><strong>Phone:</strong> ${event.contactPhone}</p>` : ''}
        ${event.registrationLink ? `<p><strong>Registration:</strong> <a href="${event.registrationLink}" target="_blank">Register Here</a></p>` : ''}
      </div>
      <div class="modal-actions">
        <button id="addCalendarBtn" class="primary-button">Add to Calendar</button>
        <button id="shareEventBtn">Share Event</button>
      </div>
    `;
    
    // Show the modal
    modal.style.display = 'block';
    
    // Add to calendar button
    const addCalendarBtn = document.getElementById('addCalendarBtn');
    addCalendarBtn.onclick = function() {
      // Use the simplified calendar approach
      const calendarUrl = createGoogleCalendarLink(event);
      window.open(calendarUrl, '_blank');
    };
    
    // Share event button
    const shareEventBtn = document.getElementById('shareEventBtn');
    shareEventBtn.onclick = function() {
      if (navigator.share) {
        navigator.share({
          title: event.name,
          text: `Check out this event: ${event.name} on ${formatDate(event.datetime)}`,
          url: window.location.href
        })
        .catch(err => {
          console.error('Share failed:', err);
        });
      } else {
        // Fallback - copy to clipboard
        const shareText = `Check out this event: ${event.name} on ${formatDate(event.datetime)} at ${event.location || 'UMD'}`;
        navigator.clipboard.writeText(shareText)
          .then(() => {
            alert('Event info copied to clipboard!');
          })
          .catch(err => {
            console.error('Could not copy text:', err);
          });
      }
    };
    
    // Close button
    const closeButton = modal.querySelector('.close-button');
    closeButton.onclick = function() {
      modal.style.display = 'none';
    };
    
    // Close when clicking outside the modal content
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = 'none';
      }
    };
  }
  
  // Build and display calendar view
  function displayCalendarView(events) {
    // Show calendar container, hide events container
    document.getElementById('eventsContainer').classList.add('hidden');
    document.getElementById('calendarView').classList.remove('hidden');
  
    // Current date for calendar
    const calendar = {
      currentDate: new Date(),
      year: new Date().getFullYear(),
      month: new Date().getMonth()
    };
  
    // Initial calendar build
    buildCalendar(calendar, events);
  
    // Setup month navigation
    document.getElementById('prevMonth').onclick = function() {
      calendar.month--;
      if (calendar.month < 0) {
        calendar.month = 11;
        calendar.year--;
      }
      buildCalendar(calendar, events);
    };
  
    document.getElementById('nextMonth').onclick = function() {
      calendar.month++;
      if (calendar.month > 11) {
        calendar.month = 0;
        calendar.year++;
      }
      buildCalendar(calendar, events);
    };
  }
  
  // Build calendar with events
  function buildCalendar(calendar, events) {
    // Update header
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    document.getElementById('currentMonth').textContent = `${monthNames[calendar.month]} ${calendar.year}`;
  
    // Get the first day of the month and the number of days
    const firstDay = new Date(calendar.year, calendar.month, 1).getDay();
    const daysInMonth = new Date(calendar.year, calendar.month + 1, 0).getDate();
  
    // Get today's date for highlighting
    const today = new Date();
    const isCurrentMonth = today.getMonth() === calendar.month && today.getFullYear() === calendar.year;
  
    // Get calendar grid
    const calendarGrid = document.querySelector('.calendar-grid');
  
    // Clear existing calendar days (excluding headers)
    const headers = calendarGrid.querySelectorAll('.calendar-day-header');
    calendarGrid.innerHTML = '';
    headers.forEach(header => calendarGrid.appendChild(header));
  
    // Create blank spaces for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      const blankDay = document.createElement('div');
      blankDay.className = 'calendar-day empty';
      calendarGrid.appendChild(blankDay);
    }
  
    // Create day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement('div');
      dayCell.className = 'calendar-day';
  
      // Check if this day is today
      if (isCurrentMonth && day === today.getDate()) {
        dayCell.classList.add('today');
      }
  
      // Day number
      const dayNumber = document.createElement('div');
      dayNumber.className = 'day-number';
      dayNumber.textContent = day;
      dayCell.appendChild(dayNumber);
  
      // Find events for this day
      const dayDate = new Date(calendar.year, calendar.month, day);
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.datetime);
        return eventDate.getDate() === day && 
               eventDate.getMonth() === calendar.month && 
               eventDate.getFullYear() === calendar.year;
      });
  
      // Add events to the day cell
      if (dayEvents.length > 0) {
        dayCell.classList.add('has-events');
        
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'day-events';
        
        // Sort events by time
        dayEvents.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        
        // Add up to 3 events, with a "+X more" indicator if needed
        const displayLimit = 3;
        const displayEvents = dayEvents.slice(0, displayLimit);
        
        displayEvents.forEach(event => {
          const eventDiv = document.createElement('div');
          eventDiv.className = 'calendar-event';
          eventDiv.dataset.eventId = event.id;
          
          eventDiv.innerHTML = `
            <span class="event-time">${formatTime(event.datetime)}</span>
            <span class="event-title">${event.name}</span>
          `;
          
          eventDiv.addEventListener('click', () => {
            showEventDetails(event);
          });
          
          eventsContainer.appendChild(eventDiv);
        });
        
        // Add "more" indicator if needed
        if (dayEvents.length > displayLimit) {
          const moreDiv = document.createElement('div');
          moreDiv.className = 'more-events';
          moreDiv.textContent = `+ ${dayEvents.length - displayLimit} more`;
          
          moreDiv.addEventListener('click', () => {
            // Filter to show just this day's events
            document.getElementById('dateFilter').value = 'custom';
            document.getElementById('calendarView').classList.add('hidden');
            document.getElementById('eventsContainer').classList.remove('hidden');
            
            // Switch to list view for better display
            setViewMode('list');
            
            // Apply custom date filter for this day
            const filteredEvents = events.filter(event => {
              const eventDate = new Date(event.datetime);
              return eventDate.getDate() === day && 
                    eventDate.getMonth() === calendar.month && 
                    eventDate.getFullYear() === calendar.year;
            });
            
            displayEventsList(filteredEvents);
          });
          
          eventsContainer.appendChild(moreDiv);
        }
        
        dayCell.appendChild(eventsContainer);
      }
  
      calendarGrid.appendChild(dayCell);
    }
  }
  
  // Set active view mode
  function setViewMode(mode) {
    // Update active button
    document.querySelectorAll('.view-toggle button').forEach(btn => {
      btn.classList.remove('active');
    });
  
    // Reset containers
    document.getElementById('eventsContainer').classList.remove('hidden');
    document.getElementById('calendarView').classList.add('hidden');
  
    // Apply view mode
    switch (mode) {
      case 'grid':
        document.getElementById('gridViewBtn').classList.add('active');
        document.getElementById('eventsContainer').className = 'events-grid';
        break;
      case 'list':
        document.getElementById('listViewBtn').classList.add('active');
        document.getElementById('eventsContainer').className = 'events-list';
        break;
      case 'calendar':
        document.getElementById('calendarViewBtn').classList.add('active');
        // Calendar view handled separately
        break;
    }
  }
  
  // Apply filters and update display
  function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value;
    const category = document.getElementById('categoryFilter').value;
    const location = document.getElementById('locationFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
  
    const allEvents = getAllEvents();
    const filteredEvents = filterEvents(allEvents, searchTerm, category, location, dateFilter);
  
    // Determine active view
    const activeView = document.querySelector('.view-toggle button.active').id;
  
    if (activeView === 'gridViewBtn') {
      document.getElementById('eventsContainer').className = 'events-grid';
      displayEventsGrid(filteredEvents);
    } else if (activeView === 'listViewBtn') {
      displayEventsList(filteredEvents);
    } else if (activeView === 'calendarViewBtn') {
      displayCalendarView(filteredEvents);
    }
  }
  
  // Initialize the page
  document.addEventListener('DOMContentLoaded', () => {
    // Initial events display
    const allEvents = getAllEvents();
    displayEventsGrid(allEvents);
  
    // Set up search and filters
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('locationFilter').addEventListener('change', applyFilters);
    document.getElementById('dateFilter').addEventListener('change', applyFilters);
  
    // Set up view toggles
    document.getElementById('gridViewBtn').addEventListener('click', () => {
      setViewMode('grid');
      applyFilters();
    });
  
    document.getElementById('listViewBtn').addEventListener('click', () => {
      setViewMode('list');
      applyFilters();
    });
  
    document.getElementById('calendarViewBtn').addEventListener('click', () => {
      setViewMode('calendar');
      applyFilters();
    });
  });