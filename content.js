// content.js

// Function to extract current URL
function getCurrentTabUrl(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      var url = tabs[0].url;
      callback(url);
    });
  }
  
  // Example: Listen for clicks on a specific button and send URL to background
  document.addEventListener('DOMContentLoaded', function() {
    var button = document.getElementById('initializeChatButton');
    button.addEventListener('click', function() {
      getCurrentTabUrl(function(url) {
        chrome.runtime.sendMessage({ type: 'initializeChat', url: url });
      });
    });
  });
  