const responseHandlers = new Map();
let unlockedMnemonic = '';

function launchPopup(message, sender, sendResponse) {
  const searchParams = new URLSearchParams();
  searchParams.set('origin', sender.origin);
  searchParams.set('network', message.data.params.network);
  searchParams.set('request', JSON.stringify(message.data));

  responseHandlers.set(message.data.id, sendResponse);

  browser.browserAction.setPopup({popup: 'index.html#' + searchParams.toString()})
  browser.browserAction.setBadgeText({text: responseHandlers.size.toString()})
}

function handleConnect(message, sender, sendResponse) {
  chrome.storage.local.get('connectedWallets', (result) => {
    const connectedWallet = (result.connectedWallets || {})[sender.origin];
    if (!connectedWallet) {
      launchPopup(message, sender, sendResponse);
    } else {
      sendResponse({
        method: 'connected',
        params: {
          publicKey: connectedWallet.publicKey,
          autoApprove: connectedWallet.autoApprove,
        },
        id: message.data.id,
      });
    }
  });
}

function handleDisconnect(message, sender, sendResponse) {
  chrome.storage.local.get('connectedWallets', (result) => {
    delete result.connectedWallets[sender.origin];
    chrome.storage.local.set(
      { connectedWallets: result.connectedWallets },
      () => sendResponse({ method: 'disconnected', id: message.data.id }),
    );
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // reset popup state
  browser.browserAction.setPopup({popup: 'index.html' })
  browser.browserAction.setBadgeText({})

  if (message.channel === 'sollet_contentscript_background_channel') {
    if (message.data.method === 'connect') {
      handleConnect(message, sender, sendResponse);
    } else if (message.data.method === 'disconnect') {
      handleDisconnect(message, sender, sendResponse);
    } else {
      launchPopup(message, sender, sendResponse);
    }
    // keeps response channel open
    return true;
  } else if (message.channel === 'sollet_extension_background_channel') {
    const responseHandler = responseHandlers.get(message.data.id);
    responseHandlers.delete(message.data.id);
    responseHandler(message.data);
  } else if (message.channel === 'sollet_extension_mnemonic_channel') {
    if (message.method === 'set') {
      unlockedMnemonic = message.data;
    } else if (message.method === 'get') {
      sendResponse(unlockedMnemonic);
    }
  }
});
