/********************************************************************************
 *  Overview:   The file conatins the client specific implemenation of the
 *              the Upstart Account object.
 *              
 * Created:     February 6, 2016
 * Creator:     Manuel Perez
 ********************************************************************************/

////////////////////////////////////////////////////////////////
// Constructor
////////////////////////////////////////////////////////////////
/**
 * Creates an instance of a account.
 *
 * @constructor
 * @param {object} oData Account specific information.
 */
var UpstartAccountClient = function (oData) {
	// Call the base constructor
	UpstartAccount.call(this, oData);
}
inheritsFrom(UpstartAccountClient, UpstartAccount);

////////////////////////////////////////////////////////////////
// Static Methods
////////////////////////////////////////////////////////////////
/**
 * Creates an instance of an account from JSON.
 *
 * @param {object} oJSON Object in JSON format.
 * @param {number} nToValidate The validation flags to check
 * @param {object} oResult Receives the result in oResult[strResult];
 * @param {string} strResult Used to populate the result value in object;
 * @return {UpstartLoad} New load object or null.
 */
UpstartAccountClient.CreateAccountFromJSON = function (oJSON, nToValidate, oResult, strResult) {
	// By default we will not validate the password
	nToValidate = assignDefaultValue(nToValidate, ~UPSTART_ACCOUNT_PASSWORD);

	return UpstartAccount.CreateAccountFromJSON(function (oData) { return new UpstartAccountClient(oData); },
		oJSON, nToValidate, oResult, strResult);
}

////////////////////////////////////////////////////////////////
// Action Helper Methods
////////////////////////////////////////////////////////////////
/**
 * Attempts to chnage the status of an account. The status of an account
 * can only be changed under certain conditions as specified in the call.
 * 
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @param {string} strAPI The API portion of the URL.
 * @param {array} arrAllowed Allowed states for the transition.
 * @return {boolean} True if successful, else false.
 */
UpstartAccountClient.prototype.changeStatus = function (fnCallback, strHostURL, strAPI, arrAllowed) {
	// Fill in the default parameters
	strHostURL = assignDefaultValue(strHostURL, null);
	
	// We need a valid id
	if (this.m_oID == "") return false;
	
	// We need to be in a valid state
	var bValidState = false;
	for (var i = 0; i < arrAllowed.length; i++) {
		if (this.m_nStatus == arrAllowed[i]) {
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

////////////////////////////////////////////////////////////////
// Action General Methods
////////////////////////////////////////////////////////////////
/**
 * Attempts to create a new account.
 * 
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartAccountClient.prototype.createAccount = function (fnCallback, strHostURL) {
	//Fill in the default parameters
	strHostURL = assignDefaultValue(strHostURL, null);
	
	// Both the id and status should be invalid, i.e. not set
	if ((this.m_oID != "") || (this.m_nStatus != UPSTART_ACCOUNT_STATUS_INVALID)) {
		return false;
	}
	
	// Convert the load to JSON
	var oJSON = this.writeJSON({}, ~(UPSTART_ACCOUNT_ID | UPSTART_ACCOUNT_STATUS));
	
	// Check to see if the account is valid
	var nInvalid = this.validate(~(UPSTART_ACCOUNT_ID | UPSTART_ACCOUNT_STATUS));
	
	// Make sure the account is valid before we send along
	if (nInvalid != 0) return false;
	
	// Okay we should be good to send the request
	UpstartSendRequest("POST", strHostURL, UPSTART_ACCOUNT_ROUTE_CREATE, JSON.stringify(oJSON), fnCallback);
	
	// We at least attempted successfully
	return true;
}

/**
 * SYSTEM: Attempts to retrieve all accounts.
 * 
 * @param {function} fnCallack Callback function which receives the result.
 * @param {boolean} bConvertToObjects Converts the result to objects.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartAccountClient.GetAllAccounts = function (fnCallback, bConvertToObjects, strHostURL) {
	//Fill in the default parameters
	bConvertToObjects = assignDefaultValue(bConvertToObjects, true);
	strHostURL = assignDefaultValue(strHostURL, null);
	
	// Okay we should be good to send the request
	UpstartSendRequest("GET", strHostURL, "api/accounts", null, function (oResult) {
		if (bConvertToObjects && oResult != null && oResult._result == 0) {
			// Create an empty array to return
			var arrAccounts = [];
			
			for (var i = 0; i < oResult.accounts.length; i++) {
				// Create a new account
				var oAccount = UpstartAccountClient.CreateAccountFromJSON(oResult.accounts[i]);
				
				// Add the newly created account
				if (oAccount != null) arrAccounts.push(oAccount);
			}
			
			// Call the callback with our array
			fnCallback(arrAccounts);
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
 * CLIENT: Attempts to retrive all child accounts associated with the account.
 * 
 * @param {string} strType The type of load to retrieve.
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartAccountClient.prototype.getChildren = function (strType, fnCallback, bConvertToObjects, strHostURL) {
	//Fill in the default parameters
	bConvertToObjects = assignDefaultValue(bConvertToObjects, true);
	strHostURL = assignDefaultValue(strHostURL, null);
	
	// We need a valid id
	if (this.m_oID == "") return false;
	
	// Create a full api string with
	var strAPIFull = UPSTART_ACCOUNT_ROUTE_GET_ALL_CHILDREN.replace(":id", this.m_oID);
	strAPIFull = strAPIFull.replace(":type", strType);
	
	// Okay we should be good to send the request
	UpstartSendRequest("GET", strHostURL, strAPIFull, null, function (oResult) {
		if (bConvertToObjects && oResult != null && oResult._result == 0) {
			// Create a new account
			var oAccount = UpstartAccountClient.CreateAccountFromJSON(oResult.account);
			
			// Add the newly created account
			fnCallback(oAccount);
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
 * Attempts to retrieve an account with specific id.
 * 
 * @param {object} oID Load identifier.
 * @param {function} fnCallack Callback function which receives the result.
 * @param {boolean} bConvertToObjects Converts the result to objects.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartAccountClient.GetAccount = function (oID, fnCallback, bConvertToObjects, strHostURL) {
	//Fill in the default parameters
	bConvertToObjects = assignDefaultValue(bConvertToObjects, true);
	strHostURL = assignDefaultValue(strHostURL, null);
	
	// Create a full api string with
	var strAPIFull = UPSTART_ACCOUNT_ROUTE_GET.replace(":id", oID);
	
	// Okay we should be good to send the request
	UpstartSendRequest("GET", strHostURL, strAPIFull, null, function (oResult) {
		if (bConvertToObjects && oResult != null && oResult._result == 0) {
			// Create a new account
			var oAccount = UpstartAccountClient.CreateAccountFromJSON(oResult.account);
			
			// Add the newly created account
			fnCallback(oAccount);
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
// Action Status Methods
////////////////////////////////////////////////////////////////
/**
 * CLIENT: Attempts to verify an account
 * 
 * @param {string} strCode Validation code.
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartAccountClient.prototype.verify = function (strCode, fnCallback, strHostURL) {
	//Fill in the default parameters
	strHostURL = assignDefaultValue(strHostURL, null);
	
	// We need a valid id
	if (this.m_oID == "") return false;

	// Validate the status if we can
	if (this.m_nStatus != UPSTART_ACCOUNT_STATUS_INVALID) {
		if (this.m_nStatus != UPSTART_ACCOUNT_STATUS_CREATED) {
			return false;
		}
	}
	
	// We need a valid code (just checking for empty for now)
	if (strCode == "") return false;
	
	// Create a full api string with
	var strAPIFull = UPSTART_ACCOUNT_ROUTE_VERIFY.replace(":id", this.m_oID);
	strAPIFull = strAPIFull.replace(":code", strCode);
	
	// Okay we should be good to send the request
	UpstartSendRequest("PUT", strHostURL, strAPIFull, null, fnCallback);
	
	// We at least attempted successfully
	return true;
}

/**
 * SYSTEM: Attempts to activate an account. A account can only be activated if 
 * it is has a verified status.
 * 
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartAccountClient.prototype.activate = function (fnCallback, strHostURL) {
	return this.changeStatus(fnCallback, strHostURL, UPSTART_ACCOUNT_ROUTE_ACTIVATE, 
		[UPSTART_ACCOUNT_STATUS_INVALID, UPSTART_ACCOUNT_STATUS_VERIFIED]);
}

/**
 * CLIENT: Attempts to deactivate an account. A account can only be deactivated if 
 * it is has a activated status and has no active loads.
 * 
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartAccountClient.prototype.deactivate = function (fnCallback, strHostURL) {
	return this.changeStatus(fnCallback, strHostURL, UPSTART_ACCOUNT_ROUTE_DEACTIVATE, 
		[UPSTART_ACCOUNT_STATUS_INVALID, UPSTART_ACCOUNT_STATUS_ACTIVATED]);
}

/**
 * CLIENT: Attempts to reactivate an account. A account can only be reactivated if 
 * it is has a deactivated status.
 * 
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartAccountClient.prototype.reactivate = function (fnCallback, strHostURL) {
	return this.changeStatus(fnCallback, strHostURL, UPSTART_ACCOUNT_ROUTE_REACTIVATE, 
		[UPSTART_ACCOUNT_STATUS_INVALID, UPSTART_ACCOUNT_STATUS_DEACTIVATED]);
}

/**
 * SYSTEM: Attempts to suspend an account. A account can only be suspended if 
 * it is not already suspended.
 * 
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartAccountClient.prototype.suspend = function (fnCallback, strHostURL) {
	return this.changeStatus(fnCallback, strHostURL, UPSTART_ACCOUNT_ROUTE_SUSPEND, 
		[UPSTART_ACCOUNT_STATUS_INVALID, UPSTART_ACCOUNT_STATUS_CREATED, UPSTART_ACCOUNT_STATUS_VERIFIED, UPSTART_ACCOUNT_STATUS_ACTIVATED, UPSTART_ACCOUNT_STATUS_DEACTIVATED]);
}

/**
 * SYSTEM: Attempts to unsuspend an account. A account can only be unsuspended if 
 * it is in the suspended state.
 * 
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartAccountClient.prototype.unsuspend = function (fnCallback, strHostURL) {
	return this.changeStatus(fnCallback, strHostURL, UPSTART_ACCOUNT_ROUTE_UNSUSPEND, 
		[UPSTART_ACCOUNT_STATUS_INVALID, UPSTART_ACCOUNT_STATUS_SUSPENDED]);
}

////////////////////////////////////////////////////////////////
// Action Load Methods
////////////////////////////////////////////////////////////////
/**
 * CLIENT: Attempts to retrive all of the loads associated with the account.
 * 
 * @param {string} strType The type of load to retrieve.
 * @param {function} fnCallack Callback function which receives the result.
 * @param {function} strHostURL Host URL
 * @return {boolean} True if successful, else false.
 */
UpstartAccountClient.prototype.getLoads = function (strType, fnCallback, bConvertToObjects, strHostURL) {
	//Fill in the default parameters
	bConvertToObjects = assignDefaultValue(bConvertToObjects, true);
	strHostURL = assignDefaultValue(strHostURL, null);
	
	// We need a valid id and a valid type
	if (this.m_oID == "" || this.m_nType == UPSTART_ACCOUNT_TYPE_INVALID) return false;
	
	// Determine our API call from our type
	var strAPI = "";
	if ((this.m_nType & UPSTART_ACCOUNT_TYPE_SHIPPER) != 0) strAPI = UPSTART_LOAD_ROUTE_GET_ALL_SHIPPER;
	else if ((this.m_nType & UPSTART_ACCOUNT_TYPE_DRIVER) != 0) strAPI = UPSTART_LOAD_ROUTE_GET_ALL_DRIVER;
	else return false;
	
	// Create a full api string with
	var strAPIFull = strAPI.replace(":id", this.m_oID);
	strAPIFull = strAPIFull.replace(":type", strType);
	
	// Okay we should be good to send the request
	UpstartSendRequest("GET", strHostURL, strAPIFull, null, function (oResult) {
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