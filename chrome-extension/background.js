/**
 * QA Job Hunter - Chrome Extension Service Worker (Background)
 */

importScripts('defaultProfile.js');

// On installation, initialize default storage
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['qa_user_profile'], (result) => {
    if (!result.qa_user_profile) {
      chrome.storage.local.set({
        qa_user_profile: self.DEFAULT_USER_PROFILE,
        groq_api_key: '',
        groq_model: 'qwen/qwen3.8-27b'
      });
    }
  });

  // Create Context Menus
  chrome.contextMenus.create({
    id: 'qa-autofill-menu',
    title: '⚡ AutoFill Job Form with Groq AI',
    contexts: ['page', 'editable']
  });

  chrome.contextMenus.create({
    id: 'qa-copy-summary',
    title: '📋 Copy SDET Summary',
    contexts: ['all']
  });

  chrome.contextMenus.create({
    id: 'qa-copy-cover-letter',
    title: '✉️ Copy Cover Letter',
    contexts: ['all']
  });
});

// Handle Context Menu Clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.id) return;

  if (info.menuItemId === 'qa-autofill-menu') {
    chrome.tabs.sendMessage(tab.id, { action: 'AUTOFILL_PAGE' });
  } else if (info.menuItemId === 'qa-copy-summary') {
    chrome.storage.local.get(['qa_user_profile'], (res) => {
      const summary = res.qa_user_profile?.summary || self.DEFAULT_USER_PROFILE.summary;
      copyToClipboard(tab.id, summary);
    });
  } else if (info.menuItemId === 'qa-copy-cover-letter') {
    chrome.storage.local.get(['qa_user_profile'], (res) => {
      const cl = res.qa_user_profile?.coverLetter || self.DEFAULT_USER_PROFILE.coverLetter;
      copyToClipboard(tab.id, cl);
    });
  }
});

// Handle Keyboard Shortcuts (e.g. Alt+Shift+F)
chrome.commands.onCommand.addListener((command) => {
  if (command === 'fill_form') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'AUTOFILL_PAGE' });
      }
    });
  }
});

function copyToClipboard(tabId, text) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: (t) => {
      navigator.clipboard.writeText(t);
      alert('✓ Copied to clipboard!');
    },
    args: [text]
  });
}
