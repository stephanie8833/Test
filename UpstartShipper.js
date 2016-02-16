/********************************************************************************
 *  Overview:   The file contains the Upstart Shipper object. This object extends
 *				the information provided by the Upstart Account object for 
 *				shippers.
 *              
 * Created:     February 9, 2016
 * Creator:     Manuel Perez
 ********************************************************************************/

////////////////////////////////////////////////////////////////
// Definitions
/////////////////////////////////////////////////////////////////
// Shipper Account Value Flag Definitions
var UPSTART_ACCOUNT_SHIPPER_EIN				= 0x00010000;
var UPSTART_ACCOUNT_SHIPPER_ADDRESSES		= 0x00020000;

////////////////////////////////////////////////////////////////
// Constructor
////////////////////////////////////////////////////////////////
/**
 * Creates an instance of a account.
 *
 * @constructor
 */
var UpstartShipper = function () {
	// Add an invalid EIN
	this.m_strEIN = "";

	// Add an empty array of addresses
	this.m_arrAddresses = [];
}

////////////////////////////////////////////////////////////////
// General Access and Modification Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the EIN of the account.
 *
 * @return {string} EIN for the account.
 */
UpstartShipper.prototype.getEIN = function () {
	return this.m_strEIN;
}

/**
 * Sets a new EIN for the account.
 *
 * @param {string} strEIN New EIN for the account.
 * @return {boolean} True if successful, else false.
 */
UpstartShipper.prototype.setEIN = function (strEIN) {
	// First we need to remove any non number characters
	strEIN = strEIN.replace(/\D/g, "");
	
	// We must be 9 characters long
	if (strEIN.length != 9) return false;
	
	this.m_strEIN = strEIN;
	return true;
}

////////////////////////////////////////////////////////////////
// Addresses Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the number of address stored with the account.
 *
 * @return {number} Number of addresses.
 */
UpstartShipper.prototype.getNumberOfAddresses = function () {
	return this.m_arrAddresses.length;
}

/**
 * Retrieves the address at a specified index. 
 * 
 * @param {number} nIndex Address index
 * @return {UpstartAddress} Address information.
 */
UpstartShipper.prototype.getAddressAt = function (nIndex) {
	// Validate that the index is within range
	if (nIndex < 0) return null;
	if (nIndex >= this.m_arrAddresses.length) return null;
	
	return this.m_arrAddresses[nIndex];
}

/**
 * Sets all addresses for the account. Replaces all existing add.
 * 
 * @param {array} arrAddresses New adddress for the account.
 * @return {boolean} True if successful, else false.
 */
UpstartShipper.prototype.setAddresses = function (arrAddresses) {	
	// All of the addresses must be valid
	for (var i = 0; i < arrAddresses.length; i++) {
		if (arrAddresses[i].validate() != 0) return false;
	}
	
	// Remove all previous addresses
	this.m_arrAddresses = [];
	
	// Add the new units
	for (var i = 0; i < arrAddresses.length; i++) {
		this.addAddress(arrAddresses[i]);
	}
	
	return true;

}

/**
 * Adds a new address to the account.
 * 
 * @param {UpstartAddress} oAddress New address to add.
 * @return {boolean} True if successful, else false.
 */
UpstartShipper.prototype.addAddress = function (oAddress) {
	// We will only be adding valid addresses
	if (oAddress.validate() != 0) return false;
	
	// Check for a duplicate
	for (var i = 0; i < this.m_arrAddresses.length; i++) {
		// If we match treat as added
		if (this.m_arrAddresses[i].isEqual(oAddress)) return true;
	}
	
	// Add the new unit
	this.m_arrAddresses.push(oAddress);
	
	return true;
}

/**
 * Removes an address from the account.
 * 
 * @param {UpstartAddress} oAddress Address to remove.
 * @return {boolean} True if successful, else false.
 */
UpstartShipper.prototype.RemoveAddress = function (oAddress) {
	// Search for the address and remove it
	for (var i = 0; i < m_arrAddresses.length; i++) {
		if (m_arrAddresses[i] == oAddress) return RemoveAddressAt(i);
	}
	
	return true;
}

/**
 * Removes an address at a specified index the account.
 * 
 * @param {number} nIndex Index of the address to remove.
 * @return {boolean} True if successful, else false.
 */
UpstartShipper.prototype.RemoveAddressAt = function (nIndex) {
	// Validate that the index is within range
	if (nIndex < 0) return false;
	if (nIndex >= this.m_arrAddresses.length) return false;
	
	// Remove the unit from our array
	this.m_arrAddresses.splice(nIndex, 1);
	
	return true;
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
UpstartShipper.prototype.validate = function (nToValidate) {
	// We always validate all if unspecified
	nToValidate = assignDefaultValue(nToValidate, -1);
	
	// Call the base class
	var nInvalid = 0
	
	// Check the EIN
	if ((nToValidate & UPSTART_ACCOUNT_SHIPPER_EIN) != 0) {
		if (this.m_strEIN == "") {
			nInvalid |= UPSTART_ACCOUNT_SHIPPER_EIN;
		}
	}
	
	// If we have addresses we validate them, but we could have none
	if ((nToValidate & UPSTART_ACCOUNT_SHIPPER_ADDRESSES) != 0) {
		for (var i = 0; i < this.m_arrAddresses.length; i++) {
			if (this.m_arrAddresses[i].validate() != 0) {
				nInvalid |= UPSTART_ACCOUNT_SHIPPER_ADDRESSES;
				break;
			}
		}
	}

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
UpstartShipper.prototype.writeJSON = function (oJSON, nToWrite) {
	// We always write all if unspecified
	nToWrite = assignDefaultValue(nToWrite, -1);
	
	// Copy the requested properties
	if ((nToWrite & UPSTART_ACCOUNT_SHIPPER_EIN) != 0) oJSON["ein"] = this.m_strEIN;
	
	// Copy the addresses properties if requested
	if ((nToWrite & UPSTART_ACCOUNT_SHIPPER_ADDRESSES) != 0) {
		// Do not write the addresses if we have none
		if (this.m_arrAddresses.length > 0) {
			// Create an array for the units
			oJSON["addresses"] = [];
			
			// Add all of the addresses
			for (var i = 0; i < this.m_arrAddresses.length; i++) {
				oJSON.addresses.push(this.m_arrAddresses[i].writeJSON({}));
			}
		}
	}
	
	return oJSON;
}

/**
 * Populates the object from a cleanly formatted JSON reprsentation.
 *
 * @param {object} oJSON Object in JSON format.
 * @return {number} Zero for success, else invalid items.
 */
UpstartShipper.prototype.readJSON = function (oJSON) {
	// Call the base class
	var nInvalid = 0;
	
	// Check for a EIN
	if ("ein" in oJSON) {
		if (!this.setEIN(oJSON.ein)) {
			nInvalid |= UPSTART_ACCOUNT_SHIPPER_EIN;
		}
	}

	// Check for addresses
	if ("addresses" in oJSON) {
		// Create an array of addresses
		var arrAddresses = [];
		for (var i = 0; i < oJSON.addresses.length; i++) {
			// Create a new address
			var oAddress = new UpstartAddress();
			
			// Convert from JSON
			if (oAddress.readJSON(oJSON.addresses[i]) == 0) {
				// Add to the array
				arrAddresses.push(oAddress);
			}
			else {
				nInvalid |= UPSTART_ACCOUNT_SHIPPER_ADDRESSES;
			}
		}
		
		// Set the addresses
		if (!this.setAddresses(arrAddresses)) {
			nInvalid |= UPSTART_ACCOUNT_SHIPPER_ADDRESSES;
		}
	}

	return nInvalid;
}