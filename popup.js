// popup.js

document.addEventListener('DOMContentLoaded', function() {
    var initializeChatButton = document.getElementById('initializeChatButton');
    var askQuestionButton = document.getElementById('askQuestionButton');
    var questionInput = document.getElementById('questionInput');
    var responseDiv = document.getElementById('response');
    
    initializeChatButton.addEventListener('click', function() {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var url = tabs[0].url;
        chrome.runtime.sendMessage({ type: 'initializeChat', url: url });
      });
    });
    
    askQuestionButton.addEventListener('click', function() {
      var question = questionInput.value.trim();
      if (question !== '') {
        chrome.runtime.sendMessage({ type: 'askQuestion', question: question }, function(response) {
          responseDiv.innerText = response.answer || 'Error: Unable to get answer.';
        });
      }
    });
  });
  