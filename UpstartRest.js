/********************************************************************************
 *  Overview:   The file contains some simple functions for REST development.
 *              This may later be replaced with a more robust 3rd party library.
 *              
 *				Note: This may not compatiable with IE10 or eariler.
 *              
 * Created:     January 27, 2016
 * Creator:     Manuel Perez
 ********************************************************************************/

////////////////////////////////////////////////////////////////
// REST Functions
////////////////////////////////////////////////////////////////
/**
 * Formats the API URL.
 *
 * @param {string} strHostURL The host URL to use. Can be null. When null is used the current location will be used.
 * @param {string} strAPI The API portion of the URL.
 * @return {string} formatted API URL.
 */
function UpstartFormatAPIURL(strHostURL, strAPI) {
	// We will construct a full URL
	var strURL = "";
	
	// If we have a host URL then use this to start
	if (strHostURL != null) {
		strURL = strHostURL;
	}
    // Else we will parse the host from our current location
	else {
		var strHREF = window.location.href;
		var nStartHost = strHREF.indexOf("://") + 3;
		var nEndHost = strHREF.indexOf("/", nStartHost);
		strURL = strHREF.substr(0, nEndHost);
	}
	
	// Append a seperator if we need it
	if (strURL.charAt(strURL.length - 1) != "/") strURL += "/";
	
	// Append the API
	if (strAPI.charAt(0) != "/") {
		strURL += strAPI;
	}
	else {
		strURL += strAPI.substr(1, strAPI.length - 1);
	}

	return strURL;
}

/**
 * Sends a http request to the server and calls the callback when a
 * response is received. 
 * 
 * @param {string} strMethod The method to use "GET", "POST", "PUT", etc.
 * @param {string} strHostURL The host URL to use. Can be null. When null is used the current location will be used.
 * @param {string} strAPI The API portion of the URL.
 * @param {object} oBody The body to send, can be null.
 * @param {function} fnCallback The callback function call when a result is obtained.
 */
function UpstartSendRequest(strMethod, strHostURL, strAPI, oBody, fnCallback) {
    // Create the HTTP Request
    var xmlhttp = new XMLHttpRequest();
    
	// Format the API URL
	var strURL = UpstartFormatAPIURL(strHostURL, strAPI);
    
    // Setup the response handler
	xmlhttp.onreadystatechange = function () {
		// Check for completed
		if (xmlhttp.readyState == 4) {
			// Check for success
			if (xmlhttp.status == 200) {
				var oResponse = JSON.parse(xmlhttp.responseText);
				fnCallback(oResponse);
			}
			else {
				fnCallback(null);
			}
        }
	};
	
    // Open the request
	xmlhttp.open(strMethod, strURL, true);
	
	// Send the content type if we have a body
	if (oBody != null) {
		if (typeof oBody == "string") {
			xmlhttp.setRequestHeader("Content-type", "application/json");
		}
		else {
			xmlhttp.setRequestHeader("Content-type", "application/octet-stream");
		}
	}
	
	// Send the request
    xmlhttp.send(oBody);
}