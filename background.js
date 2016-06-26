// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function(details) {
  // Replace all rules ...
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    // With a new rule ...
    chrome.declarativeContent.onPageChanged.addRules([
      {
        // That fires when a page's URL contains a 'g' ...
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlContains: 'steamcommunity.com/tradeoffer/' },
          }),
		  new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlContains: 'steamcommunity.com/' , pathContains : '/inventory'},
          })
        ],
        // And shows the extension's page action.
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
  
  
if(details.reason == "install"){
	var default_PP= {"730":{"providers":[{"request":"https://csg0.com/api/dbskins.php"}]}};
	chrome.storage.sync.set({"PriceProviders": default_PP });
}else if(details.reason == "update"){
	var thisVersion = chrome.runtime.getManifest().version;
	console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
}
  
  
});