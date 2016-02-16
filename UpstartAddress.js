/********************************************************************************
 *  Overview:   The file contains the Upstart Address object. It defines a 
 *				physical address for a company or person. Primarily used for 
 *				pickup and delivery locations.
 *              
 * Created:     January 28, 2016
 * Creator:     Manuel Perez
 ********************************************************************************/

////////////////////////////////////////////////////////////////
// Definitions
////////////////////////////////////////////////////////////////
// Address State Definitions
var UPSTART_ADDRESS_STATES_FULL_LOOKUP = {
	"alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR", "california": "CA",
	"colorado": "CO", "connecticut": "CT", "delaware": "DE", "florida": "FL", "georgia": "GA",
	"hawaii": "HI", "idaho": "ID", "illinois": "IL", "indiana": "IN", "iowa": "IA",
	"kansas": "KS", "kentucky": "KY", "louisiana": "LA", "maine": "ME", "maryland": "MD",
	"massachusetts": "MA", "michigan": "MI", "minnesota": "MN", "mississippi": "MS", "missouri": "MO",
	"montana": "MT", "nebraska": "NE", "nevada": "NV", "new hampshire": "NH", "new jersey": "NJ",
	"new mexico": "NM", "new york": "NY", "north carolina": "NC", "north dakota": "ND", "ohio": "OH",
	"oklahoma": "OK", "oregon": "OR", "pennsylvania": "PA", "rhode island": "RI", "south carolina": "SC",
	"south dakota": "SD", "tennessee": "TN", "texas": "TX", "utah": "UT", "vermont": "VT",
	"virginia": "VA", "washington": "WA", "west virginia": "WV", "wisconsin": "WI", "wyoming": "WY"
};

var UPSTART_ADDRESS_STATES_SMALL_LOOKUP = {
	"al": "AL", "ak": "AK", "az": "AZ", "ar": "AR", "ca": "CA",
	"co": "CO", "ct": "CT", "de": "DE", "fl": "FL", "ga": "GA",
	"hi": "HI", "id": "ID", "il": "IL", "in": "IN", "ia": "IA",
	"ks": "KS", "ky": "KY", "la": "LA", "me": "ME", "md": "MD",
	"ma": "MA", "mi": "MI", "mn": "MN", "ms": "MS", "mo": "MO",
	"mt": "MT", "ne": "NE", "nv": "NV", "nh": "NH", "nj": "NJ",
	"nm": "NM", "ny": "NY", "nc": "NC", "nd": "ND", "oh": "OH",
	"ok": "OK", "or": "OR", "pa": "PA", "ri": "RI", "sc": "SC",
	"sd": "SD", "tn": "TN", "tx": "TX", "ut": "UT", "vt": "VT",
	"va": "VA", "wa": "WA", "wv": "WV", "wi": "WI", "wy": "WY"
};

// Address Value Flag Definitions
var UPSTART_ADDRESS_NAME			= 0x00000001;
var UPSTART_ADDRESS_STREETS			= 0x00000002;
var UPSTART_ADDRESS_CITY			= 0x00000004;
var UPSTART_ADDRESS_STATE			= 0x00000008;
var UPSTART_ADDRESS_ZIP_CODE		= 0x00000010;
var UPSTART_ADDRESS_PHONE_NUMBER	= 0x00000020;
var UPSTART_ADDRESS_LOCATION		= 0x00000040;

////////////////////////////////////////////////////////////////
// Constructor
////////////////////////////////////////////////////////////////
/**
 * Creates an instance of an address.
 *
 * @constructor
 */
var UpstartAddress = function () {
	// Set basic member variables to empty strings
	this.m_strName = "";
	this.m_strCity = "";
	this.m_strState = "";
	this.m_strZipCode = "";
	this.m_strPhoneNumber = "";

	// Set the streets to an empty array
	this.m_arrStreets = [];
	
	// Set the location to empty
	this.m_oLocation = new UpstartLocation();
}

////////////////////////////////////////////////////////////////
// Address Access Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the name of the address.
 *
 * @return {string} Address name.
 */
UpstartAddress.prototype.getName = function () {
	return this.m_strName;
}

/**
 * Retrieves the number of street elements of the address.
 *
 * @return {number} Number of street elements.
 */
UpstartAddress.prototype.getNumberOfStreets = function () {
	return this.m_arrStreets.length;
}

/**
 * Retrieves the street element of the address at a specified
 * index. 
 *
 * @param {number} nIndex Street element index
 * @return {string} Address street elemnt.
 */
UpstartAddress.prototype.getStreetAt = function (nIndex) {
	// Validate that the index is within range
	if (nIndex < 0) return "";
	if (nIndex >= this.m_arrStreets.length) return "";

	return this.m_arrStreets[nIndex];
}

/**
 * Retrieves the city of the address.
 *
 * @return {string} Address city.
 */
UpstartAddress.prototype.getCity = function () {
	return this.m_strCity;
}

/**
 * Retrieves the state of the address.
 *
 * @return {string} Address state.
 */
UpstartAddress.prototype.getState = function () {
	return this.m_strState;
}

/**
 * Retrieves the zip code of the address.
 *
 * @return {string} Address zip code.
 */
UpstartAddress.prototype.getZipCode = function () {
	return this.m_strZipCode;
}

/**
 * Retrieves the phone number of the address.
 *
 * @return {string} Address phone number.
 */
UpstartAddress.prototype.getPhoneNumber = function () {
	return this.m_strPhoneNumber;
}

////////////////////////////////////////////////////////////////
// Address Modification Methods
////////////////////////////////////////////////////////////////
/**
 * Sets a new name for the address.
 *
 * @param {string} strName New address name.
 * @return {boolean} True if successful, else false.
 */
UpstartAddress.prototype.setName = function (strName) {
	// We must not be empty
	if (strName.length == 0) return false;

	this.m_strName = strName;
	return true;
}

/**
 * Replaces the streets for the address.
 *
 * @param {array} arrStreets New address streets
 * @return {boolean} True if successful, else false.
 */
UpstartAddress.prototype.setStreets = function (arrStreets) {
	// We must have at least one street
	if (arrStreets.length == 0) return false;
	
	// None of the streets can be empty
	for (var i = 0; i < arrStreets.length; i++) {
		if(arrStreets[i].length == 0) return false;
	}

	// Remove all previous streets
	this.m_arrStreets = [];
	
	// Push the new streets.
	for (var i = 0; i < arrStreets.length; i++) {
		this.m_arrStreets.push(arrStreets[i]);
	}

	return true;
}

/**
 * Set a new city for the address.
 *
 * @param {string} strCity New address city.
 * @return {boolean} True if successful, else false.
 */
UpstartAddress.prototype.setCity = function (strCity) {
	// We must not be empty
	if (strCity.length == 0) return false;

	this.m_strCity = strCity;
	return true;
}

/**
 * Sets a new state for the address. The state should
 * contain only 2 letters and reprsent a state.
 *
 * @param {string} strState New address state.
 * @return {boolean} True if successful, else false.
 */
UpstartAddress.prototype.setState = function (strState) {
	// Convert to lowercase
	strState = strState.toLowerCase();
	
	// Lookup by both full name and small name
	if (strState in UPSTART_ADDRESS_STATES_FULL_LOOKUP) {
		strState = UPSTART_ADDRESS_STATES_FULL_LOOKUP[strState];
	}
	else if (strState in UPSTART_ADDRESS_STATES_SMALL_LOOKUP) {
		strState = UPSTART_ADDRESS_STATES_SMALL_LOOKUP[strState];
	}
	else return false;
	
	this.m_strState = strState;
	return true;
}

/**
 * Sets a new zip code for the address.
 *
 * @param {string} strZipCode New address zip code.
 * @return {boolean} True if successful, else false.
 */
UpstartAddress.prototype.setZipCode = function (strZipCode) {
	// First we need to remove any non number characters
	strZipCode = strZipCode.replace(/\D/g, "");
	
	// We must be 5 characters long
	if (strZipCode.length != 5) return false;

	this.m_strZipCode = strZipCode;
	return true;
}

/**
 * Sets a new phone number for the address.
 *
 * @param {string} strPhoneNumber New address phone number.
 * @return {boolean} True if successful, else false.
 */
UpstartAddress.prototype.setPhoneNumber = function (strPhoneNumber) {
	// First we need to remove any non number characters
	strPhoneNumber = strPhoneNumber.replace(/\D/g, "");
	
	// We must be 10 characters long
	if (strPhoneNumber.length != 10) return false;

	this.m_strPhoneNumber = strPhoneNumber;
	return true;
}

////////////////////////////////////////////////////////////////
// Address Location Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the location information for the address.
 *
 * @return {UpstartLocation} Location information.
 */
UpstartAddress.prototype.getLocation = function () {
	return this.m_oLocation;
}

/**
 * Sets the location by using the address information. For this
 * call teh address information may be incomplete.
 *
 * @param {function} fnCallback Callback function, receives true if successful, else false.
 */
UpstartAddress.prototype.geoLocate = function (fnCallback) {
	// TODO:(STEPHANIE) NEEDS IMPLEMENTATION - MAY BE ASYNSCRONOUS
}

////////////////////////////////////////////////////////////////
// Validation and Compare Methods
////////////////////////////////////////////////////////////////
/**
 * Checks to see if the object is valid and returns the items
 * that are invalide.
 *
 * @param {number} nToValidate The validation flags to check
 * @return {number} Zero for success, else invalid items.
 */
UpstartAddress.prototype.validate = function (nToValidate) {
	// We always validate all if unspecified
	nToValidate = assignDefaultValue(nToValidate, -1);

	// Setup the invalid return falgs
	var nInvalid = 0;

	// Check the name
	if ((nToValidate & UPSTART_ADDRESS_NAME) != 0) {
		if (this.m_strName == "") {
			nInvalid |= UPSTART_ADDRESS_NAME;
		}
	}
	
	// Check the streets
	if ((nToValidate & UPSTART_ADDRESS_STREETS) != 0) {
		// We must have at least one street and is must not be empty
		if ((this.m_arrStreets.length == 0) || (this.m_arrStreets[0] == "")) {
			nInvalid |= UPSTART_ADDRESS_STREETS;
		}
	}
	
	// Check the city
	if ((nToValidate & UPSTART_ADDRESS_CITY) != 0) {
		if (this.m_strCity == "") {
			nInvalid |= UPSTART_ADDRESS_CITY;
		}
	}
	
	// Check the state
	if ((nToValidate & UPSTART_ADDRESS_STATE) != 0) {
		if (this.m_strState == "") {
			nInvalid |= UPSTART_ADDRESS_STATE;
		}
	}
	
	// Check the zip code
	if ((nToValidate & UPSTART_ADDRESS_ZIP_CODE) != 0) {
		if (this.m_strZipCode == "") {
			nInvalid |= UPSTART_ADDRESS_ZIP_CODE;
		}
	}
	
	// Check the phone number
	if ((nToValidate & UPSTART_ADDRESS_PHONE_NUMBER) != 0) {
		if (this.m_strPhoneNumber == "") {
			nInvalid |= UPSTART_ADDRESS_PHONE_NUMBER;
		}
	}
	
	// Check the location
	if ((nToValidate & UPSTART_ADDRESS_LOCATION) != 0) {
		if (this.m_oLocation.validate()!=0) {
			nInvalid |= UPSTART_ADDRESS_LOCATION;
		}
	}
	
	return nInvalid;
}

/**
 * Checks to see if two objects are equal.
 *
 * @param {object} oObject The object to compare to.
 * @return {boolean} True if they are euqal, else false. 
 */
UpstartAddress.prototype.isEqual = function (oObject) {
	// Check the type of the objects
	if ((typeof this) != (typeof oObject)) return false;
	
	// Notice we do not check the name or location for equality

	//if (this.m_strName != oObject.m_strName) return false;
	if (this.m_strCity != oObject.m_strCity) return false;
	if (this.m_strState != oObject.m_strState) return false;
	if (this.m_strZipCode != oObject.m_strZipCode) return false;
	if (this.m_strPhoneNumber != oObject.m_strPhoneNumber) return false;
	
	if (this.m_arrStreets.length != oObject.m_arrStreets.length) return false;
	
	for (var i = 0; i < this.m_arrStreets.length; i++) {
		if (this.m_arrStreets[i] != oObject.m_arrStreets[i]) return false;
	}
	
	//if (!this.m_oLocation.isEqual(oObject.m_oLocation)) return false;
	
	return true;
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
UpstartAddress.prototype.writeJSON = function (oJSON, nToWrite) {
	// We always write all if unspecified
	nToWrite = assignDefaultValue(nToWrite, -1);
	
	// Copy the requested basic properties
	if ((nToWrite & UPSTART_ADDRESS_NAME) != 0) oJSON["name"] = this.m_strName;
	if ((nToWrite & UPSTART_ADDRESS_CITY) != 0) oJSON["city"] = this.m_strCity;
	if ((nToWrite & UPSTART_ADDRESS_STATE) != 0) oJSON["state"] = this.m_strState;
	if ((nToWrite & UPSTART_ADDRESS_ZIP_CODE) != 0) oJSON["zipcode"] = this.m_strZipCode;
	if ((nToWrite & UPSTART_ADDRESS_PHONE_NUMBER) != 0) oJSON["phone"] = this.m_strPhoneNumber;
	
	
	// Copy the street array property if requested
	if ((nToWrite & UPSTART_ADDRESS_STREETS) != 0) {
		oJSON["streets"] = [];
		for (var i = 0; i < this.m_arrStreets.length; i++) {
			oJSON.streets.push(this.m_arrStreets[i]);
		}
	}

	// Copy the location if requested
	if ((nToWrite & UPSTART_ADDRESS_LOCATION) != 0) {
		oJSON["location"] = this.m_oLocation.writeJSON({});
	}

	return oJSON;
}

/**
 * Populates the object from a cleanly formatted JSON reprsentation.
 *
 * @param {object} oJSON Object in JSON format.
 * @return {number} Zero for success, else invalid items.
 */
UpstartAddress.prototype.readJSON = function (oJSON) {
	// Setup the invalid return falgs
	var nInvalid = 0;
	
	// Check for a name
	if ("name" in oJSON) {
		if (!this.setName(oJSON.name)) {
			nInvalid |= UPSTART_ADDRESS_NAME;
		}
	}
	
	// Check for streets
	if ("streets" in oJSON) {
		if (!this.setStreets(oJSON.streets)) {
			nInvalid |= UPSTART_ADDRESS_STREETS;
		}
	}
	
	// Check for a city
	if ("city" in oJSON) {
		if (!this.setCity(oJSON.city)) {
			nInvalid |= UPSTART_ADDRESS_CITY;
		}
	}
	
	// Check for a state
	if ("state" in oJSON) {
		if (!this.setState(oJSON.state)) {
			nInvalid |= UPSTART_ADDRESS_STATE;
		}
	}
	
	// Check for a zip code
	if ("zipcode" in oJSON) {
		if (!this.setZipCode(oJSON.zipcode)) {
			nInvalid |= UPSTART_ADDRESS_ZIP_CODE;
		}
	}
	
	// Check for a phone number
	if ("phone" in oJSON) {
		if (!this.setPhoneNumber(oJSON.phone)) {
			nInvalid |= UPSTART_ADDRESS_PHONE_NUMBER;
		}
	}
	
	// Check for a location
	if ("location" in oJSON) {
		if (this.m_oLocation.readJSON(oJSON.location) != 0) {
			nInvalid |= UPSTART_ADDRESS_LOCATION;
		}
	}
 
    return nInvalid;
}