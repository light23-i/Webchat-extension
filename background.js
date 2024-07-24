// background.js

let currentTabId = null;
let chatContext = null;

// Function to initialize chat context
function initializeChat(url) {
  fetch('http://localhost:5000/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: url })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('Chat context initialized:', data.message);
    chatContext = true;
  })
  .catch(error => {
    console.error('Error initializing chat context:', error);
  });
}

// Function to update chat context for a new URL
function updateChatContext(url) {
  fetch('http://localhost:5000/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: url })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('Chat context updated for new URL:', data.message);
    chatContext = true;
  })
  .catch(error => {
    console.error('Error updating chat context:', error);
  });
}

// Listen for tab updates (URL changes)
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (tabId === currentTabId && changeInfo.url) {
    console.log('URL changed:', changeInfo.url);
    updateChatContext(changeInfo.url);
  }
});

// Listen for tab switches (activeTab change)
chrome.tabs.onActivated.addListener(function(activeInfo) {
  currentTabId = activeInfo.tabId;
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type === 'initializeChat') {
    initializeChat(message.url);
  } else if (message.type === 'askQuestion') {
    if (chatContext) {
      fetch('http://localhost:5000/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: message.question })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Received answer:', data.answer);
        sendResponse({ answer: data.answer });
      })
      .catch(error => {
        console.error('Error asking question:', error);
        sendResponse({ error: 'Error asking question' });
      });
      return true;  // Keep the messaging channel open for sendResponse
    } else {
      sendResponse({ error: 'Chat context not initialized.' });
    }
  }
  // Keep the messaging channel open until sendResponse is called
  return true;
});
