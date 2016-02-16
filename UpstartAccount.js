/********************************************************************************
 * Overview:	The file contains the Upstart Account object. It stores the
 *				account information for admins, shipper, drivers, and users.
 *              
 * Created:     Februray 5, 2016
 * Creator:     Manuel Perez
 ********************************************************************************/

////////////////////////////////////////////////////////////////
// Definitions
/////////////////////////////////////////////////////////////////
// Account Value Flag Definitions
var UPSTART_ACCOUNT_ID								= 0x00000001;
var UPSTART_ACCOUNT_TYPE							= 0x00000002;
var UPSTART_ACCOUNT_STATUS							= 0x00000004;
var UPSTART_ACCOUNT_NAME							= 0x00000008;
var UPSTART_ACCOUNT_EMAIL							= 0x00000010;
var UPSTART_ACCOUNT_PASSWORD						= 0x00000020;
var UPSTART_ACCOUNT_ADDRESS							= 0x00000040;
var UPSTART_ACCOUNT_OWNER_ID						= 0x00000080;

var UPSTART_ACCOUNT_LOADS							= 0x00010000;	// Not an actual property of an account, used for errors

// Account Type Flags
var UPSTART_ACCOUNT_TYPE_MASTER						= 0x00000001;	// This is a master account. A master account has no owner and can have children.
var UPSTART_ACCOUNT_TYPE_SYSTEM						= 0x00000002;	// This is a system account. A sysetm account has full access to system.
var UPSTART_ACCOUNT_TYPE_SHIPPER					= 0x00000004;	// This is a shipper account. A shipper account can create and post loads.
var UPSTART_ACCOUNT_TYPE_DRIVER						= 0x00000008;	// This is a driver account. A driver account can search, accept, and transport loads.

var UPSTART_ACCOUNT_TYPE_ALL						= UPSTART_ACCOUNT_TYPE_MASTER | UPSTART_ACCOUNT_TYPE_SYSTEM | UPSTART_ACCOUNT_TYPE_SHIPPER | UPSTART_ACCOUNT_TYPE_DRIVER;
var UPSTART_ACCOUNT_TYPE_INVALID					= ~UPSTART_ACCOUNT_TYPE_ALL;

// Account Status Definitions
var UPSTART_ACCOUNT_STATUS_CREATED					= 0x00000000;	// The account has been created, but has not been verified.
var UPSTART_ACCOUNT_STATUS_VERIFIED					= 0x00000001;	// The account has been verified, but has not been activated.
var UPSTART_ACCOUNT_STATUS_ACTIVATED				= 0x00000002;	// The account is active. An active account can perform actions associated with the account type.
var UPSTART_ACCOUNT_STATUS_DEACTIVATED				= 0x00000003;	// The account has been deactivated and is longer in use.
var UPSTART_ACCOUNT_STATUS_SUSPENDED				= 0x00000004;	// The account has been suspended and can not be used without admin interaction.

var UPSTART_ACCOUNT_STATUS_MIN						= UPSTART_ACCOUNT_STATUS_CREATED;
var UPSTART_ACCOUNT_STATUS_MAX						= UPSTART_ACCOUNT_STATUS_SUSPENDED;
var UPSTART_ACCOUNT_STATUS_INVALID					= -1;

// Get All Definitions
var UPSTART_ACCOUNT_ROUTE_TYPE_ALL					= "all";		// All accounts
//var UPSTART_ACCOUNT_ROUTE_TYPE_ACTIVE				= "active";		// All accounts that are active

// Route Definitions
var UPSTART_ACCOUNT_ROUTE_GET_ALL					= "/api/accounts";
var UPSTART_ACCOUNT_ROUTE_GET_ALL_CHILDREN			= "/api/accounts/:id/:type";

var UPSTART_ACCOUNT_ROUTE_GET						= "/api/account/:id";
var UPSTART_ACCOUNT_ROUTE_CREATE					= "/api/account/create";
var UPSTART_ACCOUNT_ROUTE_VERIFY					= "/api/account/:id/verify/:code";
var UPSTART_ACCOUNT_ROUTE_ACTIVATE					= "/api/account/:id/activate";
var UPSTART_ACCOUNT_ROUTE_DEACTIVATE				= "/api/account/:id/deactivate";
var UPSTART_ACCOUNT_ROUTE_REACTIVATE				= "/api/account/:id/reactivate";
var UPSTART_ACCOUNT_ROUTE_SUSPEND					= "/api/account/:id/suspend";
var UPSTART_ACCOUNT_ROUTE_UNSUSPEND					= "/api/account/:id/unsuspend";

////////////////////////////////////////////////////////////////
// Constructor
////////////////////////////////////////////////////////////////
/**
 * Creates an instance of a location.
 *
 * @constructor
 * @param {object} oData Account specific information.
 */
var UpstartAccount = function (oData) {
	// Set the unqiue identifier to invalid
	this.m_oID = "";

	// Initialize the type of account and status to invalid
	this.m_nType = UPSTART_ACCOUNT_TYPE_INVALID;
	this.m_nStatus = UPSTART_ACCOUNT_STATUS_INVALID;

	// Initialize the name to empty/invalid
	this.m_strFirstName = "";
	this.m_strLastName = "";

	// Initialize the email and password information to empty/invalid
	this.m_strEmailAddress = "";
	this.m_strPassword = "";
	
	// Initialize the contact information to empty/invalid
	this.m_oAddress = new UpstartAddress(true);
	
	// Initilize the owner id to invalid
	this.m_oOwnerID = null;

	// Assign the data
	this.m_oData = oData;

	// Map Functions for our data variable
	if (oData != null) {
		// Iterate through our data
		for (var oMethod in oData) {
			// Check for functions
			if (typeof oData[oMethod] == "function") {
				var strMethod = oMethod.toString();
				// We ignore certain methods
				if (strMethod != "validate" && strMethod != "readJSON" && strMethod != "writeJSON") {
					// Create a pass through function with up to three parameters
					this[strMethod] = new Function("a", "b", "c", 'return this.m_oData["' + strMethod + '"](a, b, c);');
				}	
			}
		}
	}
}

////////////////////////////////////////////////////////////////
// Static Methods
////////////////////////////////////////////////////////////////
/**
 * Creates an instance of an account  from JSON.
 *
 * @param {function} fnCreate Function used to create the object
 * @param {object} oJSON Object in JSON format.
 * @param {number} nToValidate The validation flags to check
 * @param {object} oResult Receives the result in oResult[strResult];
 * @param {string} strResult Used to populate the result value in object;
 * @return {UpstartLoad} New load object or null.
 */
UpstartAccount.CreateAccountFromJSON = function (fnCreate, oJSON, nToValidate, oResult, strResult) {
	// Assign all refault parameters
	nToValidate = assignDefaultValue(nToValidate, -1);
	oResult = assignDefaultValue(oResult, null);
	strResult = assignDefaultValue(strResult, "");
	
	// We need to peek into the type to create proper data
	var oData = null;
	
	// If we have a type...and we should...we can assign account specific data
	if ("type" in oJSON) {
		// We must be a master to have additional data
		if ((oJSON.type & UPSTART_ACCOUNT_TYPE_MASTER) != 0) {
			// Check to see if we should create new shipper data
			if ((oJSON.type & UPSTART_ACCOUNT_TYPE_SHIPPER) != 0) oData = new UpstartShipper();
			else if((oJSON.type & UPSTART_ACCOUNT_TYPE_DRIVER) != 0) oData = new UpstartDriver();
		}
	}

	// Create a new load
	var oAccount = fnCreate(oData);
	
	// Populate the load from the JSON, this call will populate
	// and check entries in the JSON for validity. It does not
	// check to see if a parameter is required or not. This is
	// handled in the following validate call.
	var nResult = oAccount.readJSON(oJSON);
	
	// Check to see if we succeeeded
	if (nResult == 0) {
		// Validate the the object
		nResult = oAccount.validate(nToValidate);
	}
	
	// Assign the result
	if (oResult != null && strResult != "") {
		oResult[strResult] = nResult;
	}
	
	// We should always be valid
	if (nResult != 0) oAccount = null;
	
	// Return the account
	return oAccount;
}

////////////////////////////////////////////////////////////////
// Identifier Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the identifier of the account.
 *
 * @return {object} Unique identifier for the account.
 */
UpstartAccount.prototype.getID = function () {
	return this.m_oID;
}

/**
 * Retrieves the owner identifier of the account.
 *
 * @return {object} Unique owner identifier for the account.
 */
UpstartAccount.prototype.getOwnerID = function () {
	return this.m_oOwnerID;
}

/**
 * Sets the unqiue identifier for the account.
 *
 * @param {object} oID New unqiue identifier for the account.
 * @return {boolean} True if successful, else false.
 */
UpstartAccount.prototype.setID = function (oID) {
	if (isIDValid(oID) == false) return false;

	this.m_oID = oID;
	return true;
}

/**
 * Sets the owner unqiue identifier for the account.
 *
 * @param {object} oID New unqiue owner identifier for the account.
 * @return {boolean} True if successful, else false.
 */
UpstartAccount.prototype.setOwnerID = function (oID) {
	if (isIDValid(oID) == false) return false;
	
	this.m_oOwnerID = oID;
	return true;
}

////////////////////////////////////////////////////////////////
// Type and Status Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the type of the account.
 *
 * @return {number} Type of the account.
 */
UpstartAccount.prototype.getType = function () {
	return this.m_nType;
}

/**
 * Sets the status for the account.
 *
 * @param {number} nType New type for the account.
 * @return {boolean} True if successful, else false.
 */
UpstartAccount.prototype.setType = function (nType) {
	if ((nType & UPSTART_ACCOUNT_TYPE_INVALID) != 0) return false;

	this.m_nType = nType;
	return true;
}

/**
 * Retrieves the status of the account.
 *
 * @return {number} Current status of the account.
 */
UpstartAccount.prototype.getStatus = function () {
	return this.m_nStatus;
}

/**
 * Sets the status for the account.
 *
 * @param {number} nStatus New state for the account.
 * @return {boolean} True if successful, else false.
 */
UpstartAccount.prototype.setStatus = function (nStatus) {
	if (nStatus < UPSTART_ACCOUNT_STATUS_MIN) return false;
	if (nStatus > UPSTART_ACCOUNT_STATUS_MAX) return false;

	this.m_nStatus = nStatus;
	return true;
}

////////////////////////////////////////////////////////////////
// Name Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the first name of the account.
 *
 * @return {string} First name of the account.
 */
UpstartAccount.prototype.getFirstName = function () {
	return this.m_strFirstName;
}

/**
 * Retrieves the last name of the account.
 *
 * @return {string} Last name of the account.
 */
UpstartAccount.prototype.getLastName = function () {
	return this.m_strLastName;
}

/**
 * Retrieves the full name of the account.
 *
 * @return {string} Full name of the account.
 */
UpstartAccount.prototype.getFullName = function () {
	return this.m_strFirstName + " " + this.m_strLastName;
}

/**
 * Sets the first name for the account.
 *
 * @param {string} strName New first name for the account.
 * @return {boolean} True if successful, else false.
 */
UpstartAccount.prototype.setFirstName = function (strName) {
	if (strName == "") return false;
	
	this.m_strFirstName = strName;
	return true;
}

/**
 * Sets the last name for the account.
 *
 * @param {string} strName New last name for the account.
 * @return {boolean} True if successful, else false.
 */
UpstartAccount.prototype.setLastName = function (strName) {
	if (strName == "") return false;
	
	this.m_strLastName = strName;
	return true;
}

/**
 * Sets the name for the account.
 *
 * @param {string} strFirstName New first name for the account.
 * @param {string} strLastName New last name for the account.
 * @return {boolean} True if successful, else false.
 */
UpstartAccount.prototype.setName = function (strFirstName, strLastName) {
	if (strFirstName == "") return false;
	if (strLastName == "") return false;
	
	this.m_strFirstName = strFirstName;
	this.m_strLastName = strLastName;
	return true;
}

////////////////////////////////////////////////////////////////
// Email and Password Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the email address of the account.
 *
 * @return {string} Email address for the account.
 */
UpstartAccount.prototype.getEmailAddress = function () {
	return this.m_strEmailAddress;
}

/**
 * Sets the email address for the account.
 *
 * @param {string} strEmailAddress New email address for the account.
 * @return {boolean} True if successful, else false.
 */
UpstartAccount.prototype.setEmailAddress = function (strEmailAddress) {
	// An email address can not be empty
	if (strEmailAddress == "") return false;
	
	// An email address should not contain empty spaces
	if (strEmailAddress.indexOf(" ") != -1) return false;

	// An email address must contain one and only one @ symbol
	var nFirstIndex = strEmailAddress.indexOf("@");
	var nLastIndex = strEmailAddress.lastIndexOf("@");
	if ((nFirstIndex == -1) || (nFirstIndex != nLastIndex)) return false;
	var atIndex = nFirstIndex;
	
	// Next we split the email address into its components (name@domain)
	var strName = strEmailAddress.substring(0, atIndex);
	var strDomain = strEmailAddress.substring(atIndex + 1, strEmailAddress.length);

	// The name and domain each have a minium length
	if (strName.length == 0) return false;
	if (strDomain.length < 3) return false;
	
	// For the domain we must also conatin at least one dot
	var nDotIndex = strDomain.indexOf(".");
	if (nDotIndex == -1) return false;
	
	// Before and after each dot we must have some text that is
	// not a dot itself
	while (nDotIndex != -1) {
		if (nDotIndex == 0) return false;
		if (nDotIndex == strDomain.length - 1) return false;
		if (strDomain.charAt(nDotIndex + 1) == ".") return false;
		
		// Get the remaining text
		strDomain = strDomain.substr(nDotIndex + 1, strDomain.length);

		// Get the next dot index
		nDotIndex = strDomain.indexOf(".");
	}
	
	// Assign the email address
	this.m_strEmailAddress = strEmailAddress;
	return true;
}

/**
 * Retrieves the password of the account.
 *
 * @return {string} Email address for the account.
 */
UpstartAccount.prototype.getPassword = function () {
	return this.m_strPassword;
}

/**
 * Sets the password for the account.
 *
 * @param {string} strPassword New password for the account.
 * @param {boolean} bIsEncrypted True if the password is encrypted. This is true by default.
 * @return {boolean} True if successful, else false.
 */
UpstartAccount.prototype.setPassword = function (strPassword, bIsEncrypted) {
	// Assign all refault parameters
	bIsEncrypted = assignDefaultValue(bIsEncrypted, true);

	// A password can not be empty
	if (strPassword == "") return false;

	// A password should not contain empty spaces
	if (strPassword.indexOf(" ") != -1) return false;
	
	// A password should be at least one character long
	if (strPassword.length < 1) return false;

	// Assign the password
	this.m_strPassword = strPassword;
	return true;
};

////////////////////////////////////////////////////////////////
// Address Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the address of the account. This will be a simple
 * address that does not have a name or a location. Keep this
 * in mind when validating.
 *
 * @return {UpstrtAddress} Address of the account.
 */
UpstartAccount.prototype.getAddress = function () {
	return this.m_oAddress;
}

////////////////////////////////////////////////////////////////
// Account Type Specific Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the account specific data of the account. This
 * call should not be required as the methods are directly 
 * exposed during creation.
 *
 * @return {object} The account specific data
 */
UpstartAccount.prototype.getData = function () {
	return this.m_oData;
}

////////////////////////////////////////////////////////////////
// Validation Methods
////////////////////////////////////////////////////////////////
/**
 * Checks to see if the object is valid and returns the items
 * that are invalid.
 *
 * @param {number} nToValidate The validation flags to check
 * @return {number} Zero for success, else invalid items.
 */
UpstartAccount.prototype.validate = function (nToValidate) {
	// We always validate all if unspecified
	nToValidate = assignDefaultValue(nToValidate, -1);
	
	// Setup the invalid return falgs
	var nInvalid = 0;

	// Check the id
	if ((nToValidate & UPSTART_ACCOUNT_ID) != 0) {
		if (this.m_oID == "") {
			nInvalid |= UPSTART_ACCOUNT_ID;
		}
	}
	
	
	// Check the type
	if ((nToValidate & UPSTART_ACCOUNT_TYPE) != 0) {
		if (this.m_nType == UPSTART_ACCOUNT_TYPE_INVALID) {
			nInvalid |= UPSTART_ACCOUNT_TYPE;
		}
	}
	
	// Check the status
	if ((nToValidate & UPSTART_ACCOUNT_STATUS) != 0) {
		if (this.m_nStatus == UPSTART_ACCOUNT_STATUS_INVALID) {
			nInvalid |= UPSTART_ACCOUNT_STATUS;
		}
	}
	
	// Check the name
	if ((nToValidate & UPSTART_ACCOUNT_NAME) != 0) {
		if ((this.m_strFirstName == "") || (this.m_strLastName == "")) {
			nInvalid |= UPSTART_ACCOUNT_NAME;
		}
	}
	
	// Check the email
	if ((nToValidate & UPSTART_ACCOUNT_EMAIL) != 0) {
		if (this.m_strEmailAddress == "") {
			nInvalid |= UPSTART_ACCOUNT_EMAIL;
		}
	}
	
	// Check the password
	if ((nToValidate & UPSTART_ACCOUNT_PASSWORD) != 0) {
		if (this.m_strPassword == "") {
			nInvalid |= UPSTART_ACCOUNT_PASSWORD;
		}
	}
	
	// Check the address
	if ((nToValidate & UPSTART_ACCOUNT_ADDRESS) != 0) {
		// We do not check the name or location
		if (this.m_oAddress.validate(~(UPSTART_ADDRESS_NAME| UPSTART_ADDRESS_LOCATION)) != 0) {
			nInvalid |= UPSTART_ACCOUNT_ADDRESS;
		}
	}

	// Check the owner id
	if ((nToValidate & UPSTART_ACCOUNT_OWNER_ID) != 0) {
		// We only need to validate the owner if we are a child,
		// so we must have a valid type
		if (this.m_nType == UPSTART_ACCOUNT_TYPE_INVALID) {
			nInvalid |= UPSTART_ACCOUNT_OWNER_ID;
		}
		else {
			if ((this.m_nType & UPSTART_ACCOUNT_TYPE_MASTER) == 0) {
				if (this.m_oOwnerID == null) {
					// We are a child so we need an owner
					nInvalid |= UPSTART_ACCOUNT_OWNER_ID;
				}
			}
			else {
				if (this.m_oOwnerID != null) {
					// We are a master we should never have an owner
					nInvalid |= UPSTART_ACCOUNT_OWNER_ID;
				}
			}
		}
	}
	
	// If we have account specific data then we will try and validate it
	if (this.m_oData != null) nInvalid |= this.m_oData.validate(nToValidate);

	return nInvalid;
}

////////////////////////////////////////////////////////////////
// JSON Methods
////////////////////////////////////////////////////////////////
/**
 * Writes a cleanly formatted JSON representation of the object
 * to the input object.
 *
 * @param {object} oJSON Object to write to.
 * @param {number} nToWrite The properties to write.
 * @return {object} Input object.
 */
UpstartAccount.prototype.writeJSON = function (oJSON, nToWrite) {
	// We always write all if unspecified
	nToWrite = assignDefaultValue(nToWrite, -1);
	
	// Copy the requested properties
	if ((nToWrite & UPSTART_ACCOUNT_ID) != 0) oJSON["_id"] = this.m_oID;
	if ((nToWrite & UPSTART_ACCOUNT_TYPE) != 0) oJSON["type"] = this.m_nType;
	if ((nToWrite & UPSTART_ACCOUNT_STATUS) != 0) oJSON["status"] = this.m_nStatus;

	if ((nToWrite & UPSTART_ACCOUNT_NAME) != 0) {
		oJSON["firstname"] = this.m_strFirstName;
		oJSON["lastname"] = this.m_strLastName;
	}

	if ((nToWrite & UPSTART_ACCOUNT_EMAIL) != 0) oJSON["email"] = this.m_strEmailAddress;
	if ((nToWrite & UPSTART_ACCOUNT_PASSWORD) != 0) oJSON["password"] = this.m_strPassword;
	if ((nToWrite & UPSTART_ACCOUNT_ADDRESS) != 0) {
		// We do not write the name or location
		oJSON["address"] = this.m_oAddress.writeJSON({}, ~(UPSTART_ADDRESS_NAME | UPSTART_ADDRESS_LOCATION));
	}

	if ((nToWrite & UPSTART_ACCOUNT_OWNER_ID) != 0) {
		if (this.m_oOwnerID != null) {
			oJSON["ownerid"] = this.m_oOwnerID;
		}
	}
	
	// If we have account specific data then we will try and write it
	if (this.m_oData != null) this.m_oData.writeJSON(oJSON, nToWrite);
	
	return oJSON;
}

/**
 * Populates the object from a cleanly formatted JSON reprsentation.
 *
 * @param {object} oJSON Object in JSON format.
 * @return {number} Zero for success, else invalid items.
 */
UpstartAccount.prototype.readJSON = function (oJSON) {
	// Setup the invalid return falgs
	var nInvalid = 0;
	
	// Check for the values and set them
	if (("_id" in oJSON) && !this.setID(oJSON._id)) nInvalid |= UPSTART_ACCOUNT_ID;
	if (("type" in oJSON) && !this.setType(oJSON.type)) nInvalid |= UPSTART_ACCOUNT_TYPE;
	if (("status" in oJSON) && !this.setStatus(oJSON.status)) nInvalid |= UPSTART_ACCOUNT_STATUS;
	if (("firstname" in oJSON) && ("lastname" in oJSON) && !this.setName(oJSON.firstname, oJSON.lastname)) nInvalid |= UPSTART_ACCOUNT_NAME;
	if (("email" in oJSON) && !this.setEmailAddress(oJSON.email)) nInvalid |= UPSTART_ACCOUNT_EMAIL;
	if (("password" in oJSON) && !this.setPassword(oJSON.password)) nInvalid |= UPSTART_ACCOUNT_PASSWORD;
	if (("address" in oJSON) && (this.m_oAddress.readJSON(oJSON.address) != 0)) nInvalid |= UPSTART_ACCOUNT_ADDRESS;
	if (("ownerid" in oJSON) && !this.setOwnerID(oJSON.ownerid)) nInvalid |= UPSTART_ACCOUNT_OWNER_ID;
	
	// If we have account specific data then we will try and read it
	if (this.m_oData != null) nInvalid |= this.m_oData.readJSON(oJSON);

	return nInvalid;
}