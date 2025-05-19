// UMD Events Platform - Main JavaScript File
// This file contains general utilities and functions for the UMD Events Platform

// Utility function to format dates in a readable format
function formatDisplayDate(dateString) {
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
  
  // Utility function to format time only
  function formatTime(dateString) {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  }
  
  // Utility function to check if a date is today
  function isToday(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }
  
  // Toggle visibility of an element
  function toggleVisibility(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.toggle('hidden');
    }
  }
  
  // Helper function for creating modals
  function createModal(title, content, actions) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Add close button
    const closeButton = document.createElement('span');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => modal.style.display = 'none';
    
    // Add title
    const titleElement = document.createElement('h2');
    titleElement.textContent = title;
    
    // Add content
    const contentElement = document.createElement('div');
    contentElement.innerHTML = content;
    
    // Add actions
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'modal-actions';
    
    // Add everything to the DOM
    modalContent.appendChild(closeButton);
    modalContent.appendChild(titleElement);
    modalContent.appendChild(contentElement);
    
    // Add action buttons if provided
    if (actions && actions.length) {
      actions.forEach(action => {
        const button = document.createElement('button');
        button.textContent = action.text;
        button.className = action.primary ? 'primary-button' : '';
        button.onclick = action.handler;
        actionsContainer.appendChild(button);
      });
      modalContent.appendChild(actionsContainer);
    }
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Show the modal
    modal.style.display = 'block';
    
    // Close when clicking outside the modal content
    modal.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    };
    
    // Return the modal for further manipulation
    return modal;
  }
  
  // Function to show notifications
  function showNotification(message, type = 'info', duration = 3000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to the DOM
    document.body.appendChild(notification);
    
    // Show animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Hide and remove after duration
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, duration);
  }
  
  // Function to validate form fields
  function validateFormField(field, errorMessage) {
    if (!field.value.trim()) {
      field.classList.add('error');
      const errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      errorElement.textContent = errorMessage;
      field.parentNode.appendChild(errorElement);
      return false;
    }
    return true;
  }
  
  // Listen for document ready
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize any page components here
    
    // Example: Set up modal close buttons
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      const closeBtn = modal.querySelector('.close-button');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          modal.style.display = 'none';
        });
      }
      
      // Close when clicking outside modal content
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    });
    
    // Example: Initialize date fields with current date
    const dateFields = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    dateFields.forEach(field => {
      if (!field.value) {
        field.value = today;
      }
    });
  });