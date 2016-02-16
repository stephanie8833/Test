/********************************************************************************
 *  Overview:   The file conatins the client specific implemenation of the
 *              the Upstart Load object.
 *              
 * Created:     January 27, 2016
 * Creator:     Manuel Perez
 ********************************************************************************/

////////////////////////////////////////////////////////////////
// Constructor
////////////////////////////////////////////////////////////////
/**
 * Creates an instance of a load.
 *
 * @constructor
 */
var UpstartLoadClient = function () {
    // Call the base constructor
    UpstartLoad.call(this);
}
inheritsFrom(UpstartLoadClient, UpstartLoad);

////////////////////////////////////////////////////////////////
// Static Methods
////////////////////////////////////////////////////////////////
/**
 * Creates an instance of a load from JSON.
 *
 * @param {object} oJSON Object in JSON format.
 * @param {number} nToValidate The validation flags to check
 * @param {object} oResult Receives the result in oResult[strResult];
 * @param {string} strResult Used to populate the result value in object;
 * @return {UpstartLoad} New load object or null.
 */
UpstartLoadClient.CreateLoadFromJSON = function (oJSON, nToValidate, oResult, strResult) {
	return UpstartLoad.CreateLoadFromJSON(function () { return new UpstartLoadClient(); },
		oJSON, nToValidate, oResult, strResult);
}

/**
 * SYSTEM: Attempts to retrieve all loads.
 * 
 * @param {function} fnCallack Callback function which receives the result.
 * @param {boolean} bConvertToObjects Converts the result to objects.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartLoadClient.GetAllLoads = function (fnCallback, bConvertToObjects, strHostURL) {
	//Fill in the default parameters
	bConvertToObjects = assignDefaultValue(bConvertToObjects, true);
	strHostURL = assignDefaultValue(strHostURL, null);

	// Okay we should be good to send the request
	UpstartSendRequest("GET", strHostURL, "api/loads", null, function (oResult) {	
		if (bConvertToObjects && oResult != null && oResult._result == 0) {
			// Create an empty array to return
			var arrLoads = [];
			
			for (var i = 0; i < oResult.loads.length; i++) {
				// Create a new load
				var oLoad = UpstartLoadClient.CreateLoadFromJSON(oResult.loads[i]);
				
				// Add the newly created load
				if (oLoad != null) arrLoads.push(oLoad);
			}
			
			// Call the callback with our array
			fnCallback(arrLoads);
		}
		else if (bConvertToObjects) {
			// Call the callback with nothing
			fnCallback(null);
		}
		else {
			// Call the callback directly
			fnCallback(oResult);
		}
	});
	
	// We at least attempted successfully
	return true;
}

/**
 * Attempts to retrieve a load with specific id.
 * 
 * @param {object} oID Load identifier.
 * @param {function} fnCallack Callback function which receives the result.
 * @param {boolean} bConvertToObjects Converts the result to objects.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartLoadClient.GetLoad = function (oID, fnCallback, bConvertToObjects, strHostURL) {
	//Fill in the default parameters
	bConvertToObjects = assignDefaultValue(bConvertToObjects, true);
	strHostURL = assignDefaultValue(strHostURL, null);
	
	// Create a full api string with
	var strAPIFull = UPSTART_LOAD_ROUTE_GET.replace(":id", oID);
	
	// Okay we should be good to send the request
	UpstartSendRequest("GET", strHostURL, strAPIFull, null, function (oResult) {
		if (bConvertToObjects && oResult != null && oResult._result == 0) {
			// Create a new load
			var oLoad = UpstartLoadClient.CreateLoadFromJSON(oResult.load);
			
			// Add the newly created load
			fnCallback(oLoad);
		}
		else if (bConvertToObjects) {
			// Call the callback with nothing
			fnCallback(null);
		}
		else {
			// Call the callback directly
			fnCallback(oResult);
		}
	});
	
	// We at least attempted successfully
	return true;
}

////////////////////////////////////////////////////////////////
// Action Helper Methods
////////////////////////////////////////////////////////////////
/**
 * Attempts to chnage the state of a load. The state of a long can only
 * be changed under certain conditions as specified in the call.
 * 
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @param {string} strAPI The API portion of the URL.
 * @param {array} arrAllowed Allowed states for the transition.
 * @return {boolean} True if successful, else false.
 */
UpstartLoadClient.prototype.change = function (fnCallback, strHostURL, strAPI, arrAllowed) {
	// Fill in the default parameters
	strHostURL = assignDefaultValue(strHostURL, null);
	
	// We need a valid id
	if (this.m_oID == "") return false;
	
	// We need to be in a valid state
	var bValidState = false;
	for (var i = 0; i < arrAllowed.length; i++) {
		if (this.m_nState == arrAllowed[i]) {
			bValidState = true;
			break;
		}
	}
	
	if (!bValidState) return false;
	
	// Create a full api string with
	var strAPIFull = strAPI.replace(":id", this.m_oID);
	
	// Okay we should be good to send the request
	UpstartSendRequest("PUT", strHostURL, strAPIFull, null, fnCallback);
	
	// We at least attempted successfully
	return true;
}

/**
 * Attempts to upload an image and change the state.
 * 
 * @param {object} oImage Image object or a string that is Base64 encoded with type "image/jpg".
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @param {string} strAPI The API portion of the URL.
 * @param {array} arrAllowed Allowed states for the transition.
 * @return {boolean} True if successful, else false.
 */
UpstartLoadClient.prototype.upload = function (oImage, fnCallback, strHostURL, strAPI, arrAllowed) {
	// Fill in the default parameters
	strHostURL = assignDefaultValue(strHostURL, null);
	
	// We need a valid id
	if (this.m_oID == "") return false;
	
	// We need to be in a valid state
	var bValidState = false;
	for (var i = 0; i < arrAllowed.length; i++) {
		if (this.m_nState == arrAllowed[i]) {
			bValidState = true;
			break;
		}
	}
	
	if (!bValidState) return false;
	
	// Encode the image if has not already been encoded
	if (typeof oImage != "string") {
		oImage = encodeImageBase64(oImage, "image/jpg");
	}
	
	// Create a full api string with
	var strAPIFull = strAPI.replace(":id", this.m_oID);
	
	// Create a JSON object for the body
	var oJSON = { image: oImage, format: "image/jpg" };
	
	// Okay we should be good to send the request
	UpstartSendRequest("PUT", strHostURL, strAPIFull, JSON.stringify(oJSON), fnCallback);
	
	// We at least attempted successfully
	return true;
}

////////////////////////////////////////////////////////////////
// Action General Methods
////////////////////////////////////////////////////////////////
/**
 * SHIPPER: Attempts to create a load.
 * 
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartLoadClient.prototype.createLoad = function (fnCallback, strHostURL) {
	//Fill in the default parameters
	strHostURL = assignDefaultValue(strHostURL, null);
	
	// Both the id and state should be invalid, i.e. not set
	if ((this.m_oID != "") || (this.m_nState != UPSTART_LOAD_STATE_INVALID)) {
		return false;
	}
	
	// Convert the load to JSON
	var oJSON = this.writeJSON({}, ~(UPSTART_LOAD_ID | UPSTART_LOAD_STATE));
	
	// Check to see if the load is valid
	var nInvalid = this.validate(~(UPSTART_LOAD_ID | UPSTART_LOAD_STATE));
	
	// Make sure the load is valid before we send along
	if (nInvalid != 0) return false;
	
	// Okay we should be good to send the request
	UpstartSendRequest("POST", strHostURL, UPSTART_LOAD_ROUTE_CREATE, JSON.stringify(oJSON), fnCallback);
	
	// We at least attempted successfully
	return true;
}

/**
 * SHIPPER: Attempts to post a load. A load can only be posted if it is
 * in the created state.
 * 
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartLoadClient.prototype.post = function (fnCallback, strHostURL) {
	return this.change(fnCallback, strHostURL, UPSTART_LOAD_ROUTE_POST, 
		[UPSTART_LOAD_STATE_INVALID, UPSTART_LOAD_STATE_CREATED]);
}

/**
 * DRIVER: Attempts to accept a load. A load can only be accepted if it is
 * in the posted state.
 * 
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartLoadClient.prototype.accept = function (fnCallback, strHostURL) {
	// Fill in the default parameters
	strHostURL = assignDefaultValue(strHostURL, null);
	
	// We need a valid id and driver id
	if (this.m_oID == "" || this.m_oDriverID == "") return false;
	
	// Validate the state if we can
	if (this.m_nState != UPSTART_LOAD_STATE_INVALID && this.m_nState != UPSTART_LOAD_STATE_POSTED) {
		return false;
	}
	
	// Create a full api string with
	var strAPIFull = UPSTART_LOAD_ROUTE_ACCEPT.replace(":id", this.m_oID);
	strAPIFull = strAPIFull.replace(":driverid", this.m_oDriverID);
	
	// Okay we should be good to send the request
	UpstartSendRequest("PUT", strHostURL, strAPIFull, null, fnCallback);
	
	// We at least attempted successfully
	return true;
}

/**
 * SYSTEM: Attempts to complete a load. A load can only be completed if 
 * it is in the drop off state. This should be called after payment has
 * been processed.
 * 
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartLoadClient.prototype.complete = function (fnCallback, strHostURL) {
	return this.change(fnCallback, strHostURL, UPSTART_LOAD_ROUTE_COMPLETE, 
		[UPSTART_LOAD_STATE_INVALID, UPSTART_LOAD_STATE_DROPOFF_ACCEPTED]);
}

/**
 * SHIPPER: Attempts to cancel a load. A load can only be cancled if it is
 * in the created or posted states.
 * 
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartLoadClient.prototype.cancel = function (fnCallback, strHostURL) {
	return this.change(fnCallback, strHostURL, UPSTART_LOAD_ROUTE_CANCEL, 
		[UPSTART_LOAD_STATE_INVALID, UPSTART_LOAD_STATE_CREATED, UPSTART_LOAD_STATE_POSTED]);
}

////////////////////////////////////////////////////////////////
// Action Pickup Methods
////////////////////////////////////////////////////////////////
/**
 * DRIVER: Attempts to set the docked state of a load. A load can only be
 * docked if it is in the arrived state.
 * 
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartLoadClient.prototype.pickupDock = function (fnCallback, strHostURL) {
	return this.change(fnCallback, strHostURL, UPSTART_LOAD_ROUTE_PICKUP_DOCK, 
		[UPSTART_LOAD_STATE_INVALID, UPSTART_LOAD_STATE_PICKUP_ARRIVED]);
}

/**
 * DRIVER: Attempts to upload the billing of lading after docking.
 * 
 * @param {object} oImage Image object or a string that is Base64 encoded with type "image/jpg".
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartLoadClient.prototype.pickupUpload = function (oImage, fnCallback, strHostURL) {
	return this.upload(oImage, fnCallback, strHostURL, UPSTART_LOAD_ROUTE_PICKUP_UPLOAD,
		[UPSTART_LOAD_STATE_INVALID, UPSTART_LOAD_STATE_PICKUP_DOCKED]);
}

/**
 * SHIPPER: Attempts to accept the upload for a load at the pickup location. 
 * A load can only be accepted at the pickup location if it is in the pickup
 * uploaded state.
 * 
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartLoadClient.prototype.pickupAccept= function (fnCallback, strHostURL) {
	return this.change(fnCallback, strHostURL, UPSTART_LOAD_ROUTE_PICKUP_ACCEPT, 
		[UPSTART_LOAD_STATE_INVALID, UPSTART_LOAD_STATE_PICKUP_UPLOADED]);
}

/**
 * SHIPPER: Attempts to reject the upload for a load at the pickup location. 
 * A load can only be rejected at the pickup location if it is in the pickup
 * uploaded state.
 * 
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartLoadClient.prototype.pickupReject = function (fnCallback, strHostURL) {
	return this.change(fnCallback, strHostURL, UPSTART_LOAD_ROUTE_PICKUP_REJECT, 
		[UPSTART_LOAD_STATE_INVALID, UPSTART_LOAD_STATE_PICKUP_UPLOADED]);
}

////////////////////////////////////////////////////////////////
// Action Dropoff Methods
////////////////////////////////////////////////////////////////
/**
 * DRIVER: Attempts to set the docked state of a load. A load can only be
 * docked if it is in the arrived state.
 * 
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartLoadClient.prototype.dropoffDock = function (fnCallback, strHostURL) {
	return this.change(fnCallback, strHostURL, UPSTART_LOAD_ROUTE_DROPOFF_DOCK, 
		[UPSTART_LOAD_STATE_INVALID, UPSTART_LOAD_STATE_DROPOFF_ARRIVED]);
}

/**
 * DRIVER: Attempts to upload the billing of lading after docking.
 * 
 * @param {object} oImage Image object or a string that is Base64 encoded with type "image/jpg".
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartLoadClient.prototype.dropoffUpload = function (oImage, fnCallback, strHostURL) {
	return this.upload(oImage, fnCallback, strHostURL, UPSTART_LOAD_ROUTE_DROPOFF_UPLOAD,
		[UPSTART_LOAD_STATE_INVALID, UPSTART_LOAD_STATE_DROPOFF_DOCKED]);
}

/**
 * SHIPPER: Attempts to accept the upload for a load at the drop off location. 
 * A load can only be accepted at the drop off location if it is in the drop off
 * uploaded state.
 * 
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartLoadClient.prototype.dropoffAccept = function (fnCallback, strHostURL) {
	return this.change(fnCallback, strHostURL, UPSTART_LOAD_ROUTE_DROPOFF_ACCEPT, 
		[UPSTART_LOAD_STATE_INVALID, UPSTART_LOAD_STATE_DROPOFF_UPLOADED]);
}

/**
 * SHIPPER: Attempts to reject the upload for a load at the drop off location. 
 * A load can only be rejected at the drop off location if it is in the drop off
 * uploaded state.
 * 
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartLoadClient.prototype.dropoffReject = function (fnCallback, strHostURL) {
	return this.change(fnCallback, strHostURL, UPSTART_LOAD_ROUTE_DROPOFF_REJECT, 
		[UPSTART_LOAD_STATE_INVALID, UPSTART_LOAD_STATE_DROPOFF_UPLOADED]);
}

////////////////////////////////////////////////////////////////
// Action Location Methods
////////////////////////////////////////////////////////////////
/**
 * DRIVER: Attempts to set the location of a load. A load's location can
 * only be updated if it is in the accepted or moving states.
 * 
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartLoadClient.prototype.updateLocation = function (fnCallback, strHostURL) {
	// Fill in the default parameters
	strHostURL = assignDefaultValue(strHostURL, null);
	
	// We need a valid id and location
	if (this.m_oID == "" || this.m_oLocation.validate() != 0) return false;
	
	// Validate the state if we can
	if (this.m_nState != UPSTART_LOAD_STATE_INVALID) {
		if (this.m_nState < UPSTART_LOAD_STATE_SET_MOVING_MIN ||
			this.m_nState > UPSTART_LOAD_STATE_SET_MOVING_MAX) {
			return false;
		}
	}

	// Use the location to create a body
	var oJSON = this.m_oLocation.writeJSON({});
	
	// Create a full api string with
	var strAPIFull = UPSTART_LOAD_ROUTE_UPDATE_LOCATION.replace(":id", this.m_oID);
	
	// Okay we should be good to send the request
	UpstartSendRequest("PUT", strHostURL, strAPIFull, JSON.stringify(oJSON), fnCallback);
	
	// We at least attempted successfully
	return true;
}