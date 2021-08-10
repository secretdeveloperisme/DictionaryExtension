chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if(msg === "getSelection")
    sendResponse(document.getSelection().toString())
});