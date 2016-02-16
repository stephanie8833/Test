/********************************************************************************
 *  Overview:   The file contains the Upstart Driver object. This object extends
 *				the information provided by the Upstart Account object for 
 *				drivers.
 *              
 * Created:     February 9, 2016
 * Creator:     Manuel Perez
 ********************************************************************************/

////////////////////////////////////////////////////////////////
// Definitions
/////////////////////////////////////////////////////////////////
// Driver Account Value Flag Definitions
var UPSTART_ACCOUNT_DRIVER_CDL			= 0x00010000;
var UPSTART_ACCOUNT_DRIVER_DOT			= 0x00020000;
var UPSTART_ACCOUNT_DRIVER_MC			= 0x00040000;
var UPSTART_ACCOUNT_DRIVER_VEHICLES		= 0x00080000;

////////////////////////////////////////////////////////////////
// Constructor
////////////////////////////////////////////////////////////////
/**
 * Creates an instance of a account.
 *
 * @constructor
 */
var UpstartDriver = function () {
	// Create empty basic information about the driver
	this.m_strCDL = "";
	this.m_strDOT = "";
	this.m_strMC = "";

	// Create an empty array of vehicles
	this.m_arrVehicles = [];
}

////////////////////////////////////////////////////////////////
// General Access and Modification Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the CDL of the account.
 *
 * @return {string} CDL for the account.
 */
UpstartDriver.prototype.getCDL = function () {
	return this.m_strCDL;
}

/**
 * Sets a new CDL for the account.
 *
 * @param {string} strCDL New CDL for the account.
 * @return {boolean} True if successful, else false.
 */
UpstartDriver.prototype.setCDL = function (strCDL) {
	// Remove all whitespace
	strCDL = strCDL.replace(/\s/g, "");
		
	// We must be at least one character long
	if (strCDL.length < 1) return false;
	
	this.m_strCDL = strCDL;
	return true;
}

/**
 * Retrieves the DOT of the account.
 *
 * @return {string} DOT for the account.
 */
UpstartDriver.prototype.getDOT = function () {
	return this.m_strDOT;
}

/**
 * Sets a new DOT for the account.
 *
 * @param {string} strDOT New DOT for the account.
 * @return {boolean} True if successful, else false.
 */
UpstartDriver.prototype.setDOT = function (strDOT) {
	// Remove all whitespace
	strDOT = strDOT.replace(/\s/g, "");

	// We must be at least one character long 
	if (strDOT.length < 1) return false;
	
	this.m_strDOT = strDOT;
	return true;
}

/**
 * Retrieves the MC of the account.
 *
 * @return {string} MC for the account.
 */
UpstartDriver.prototype.getMC = function () {
	return this.m_strMC;
}

/**
 * Sets a new MC for the account.
 *
 * @param {string} strMC New MC for the account.
 * @return {boolean} True if successful, else false.
 */
UpstartDriver.prototype.setMC = function (strMC) {
	// Remove all whitespace
	strMC = strMC.replace(/\s/g, "");
	
	// We must be at least one character long 
	if (strMC.length < 1) return false;
	
	this.m_strMC = strMC;
	return true;
}

////////////////////////////////////////////////////////////////
// Vehicle Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the number of vehicles stored with the account.
 *
 * @return {number} Number of vehicles.
 */
UpstartDriver.prototype.getNumberOfVehicles = function () {
	return this.m_arrVehicles.length;
}

/**
 * Retrieves the vehicle at a specified index. 
 * 
 * @param {number} nIndex Vehicle index
 * @return {UpstartVehcile} Vehicle information.
 */
UpstartDriver.prototype.getVehicleAt = function (nIndex) {
	// Validate that the index is within range
	if (nIndex < 0) return null;
	if (nIndex >= this.m_arrVehicles.length) return null;
	
	return this.m_arrVehicles[nIndex];
}

/**
 * Sets all vehicles for the account. Replaces all existing
 * vehciles.
 * 
 * @param {array} arrVehicles New vehcile for the account.
 * @return {boolean} True if successful, else false.
 */
UpstartDriver.prototype.setVehicles = function (arrVehicles) {
	// All of the Vehicles must be valid
	for (var i = 0; i < arrVehicles.length; i++) {
		if (arrVehicles[i].validate() != 0) return false;
	}
	
	// Remove all previous Vehicles
	this.m_arrVehicles = [];
	
	// Add the new units
	for (var i = 0; i < arrVehicles.length; i++) {
		this.addVehicle(arrVehicles[i]);
	}
	
	return true;
}

/**
 * Adds a new vehicle to the account.
 * 
 * @param {UpstartAddress} oVehicle New vehicle to add.
 * @return {boolean} True if successful, else false.
 */
UpstartDriver.prototype.addVehicle = function (oVehicle) {
	// We will only be adding valid vehicles
	if (oVehicle.validate() != 0) return false;
	
	// Check for a duplicate
	for (var i = 0; i < this.m_arrVehicles.length; i++) {
		// If we match treat as added
		if (this.m_arrVehicles[i].isEqual(oVehicle)) return true;
	}
	
	// Add the new unit
	this.m_arrVehicles.push(oVehicle);
	
	return true;
}

/**
 * Removes a vehicle from the account.
 * 
 * @param {UpstartAddress} oVehicle Vehicle to remove.
 * @return {boolean} True if successful, else false.
 */
UpstartDriver.prototype.RemoveVehicle = function (oVehicle) {
	// Search for the address and remove it
	for (var i = 0; i < m_arrVehicles.length; i++) {
		if (m_arrVehicles[i] == oVehicle) return RemoveVehicleAt(i);
	}
	
	return true;
}

/**
 * Removes a vehicle at a specified index the account.
 * 
 * @param {number} nIndex Index of the vehicle to remove.
 * @return {boolean} True if successful, else false.
 */
UpstartDriver.prototype.RemoveVehicleAt = function (nIndex) {
	// Validate that the index is within range
	if (nIndex < 0) return false;
	if (nIndex >= this.m_arrVehicles.length) return false;
	
	// Remove the unit from our array
	this.m_arrVehicles.splice(nIndex, 1);
	
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
UpstartDriver.prototype.validate = function (nToValidate) {
	// We always validate all if unspecified
	nToValidate = assignDefaultValue(nToValidate, -1);
	
	// Call the base class
	var nInvalid = 0;
	
	// Check the basic properties
	if (((nToValidate & UPSTART_ACCOUNT_DRIVER_CDL) != 0) && (this.m_strCDL == "")) nInvalid |= UPSTART_ACCOUNT_DRIVER_CDL;
	if (((nToValidate & UPSTART_ACCOUNT_DRIVER_DOT) != 0) && (this.m_strDOT == "")) nInvalid |= UPSTART_ACCOUNT_DRIVER_DOT;
	if (((nToValidate & UPSTART_ACCOUNT_DRIVER_MC) != 0) && (this.m_strMC == "")) nInvalid |= UPSTART_ACCOUNT_DRIVER_MC;
	
	// Validate the vehicles
	if ((nToValidate & UPSTART_ACCOUNT_DRIVER_VEHICLES) != 0) {
		// We must have at least one motorized vehicle or van and all vehciles
		// must be valid
		var bHasMotorized = false;
		for (var i = 0; i < this.m_arrVehicles.length; i++) {
			if (this.m_arrVehicles[i].validate() != 0) {
				nInvalid |= UPSTART_ACCOUNT_DRIVER_VEHICLES;
				break;
			}
			else {
				if ((this.m_arrVehicles[i].getType() & UPSTART_VEHICLE_TYPE_MOTORIZED) != 0) {
					bHasMotorized = true;
				}
			}
		}

		if (!bHasMotorized) {
			nInvalid |= UPSTART_ACCOUNT_DRIVER_VEHICLES;
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
UpstartDriver.prototype.writeJSON = function (oJSON, nToWrite) {
	// We always write all if unspecified
	nToWrite = assignDefaultValue(nToWrite, -1);
	
	// Copy the requested properties
	if ((nToWrite & UPSTART_ACCOUNT_DRIVER_CDL) != 0) oJSON["cdl"] = this.m_strCDL;
	if ((nToWrite & UPSTART_ACCOUNT_DRIVER_DOT) != 0) oJSON["dot"] = this.m_strDOT;
	if ((nToWrite & UPSTART_ACCOUNT_DRIVER_MC) != 0) oJSON["mc"] = this.m_strMC;
	
	// Copy the vehicle properties if requested
	if ((nToWrite & UPSTART_ACCOUNT_DRIVER_VEHICLES) != 0) {
		// Do not write the vehicle if we have none, this should never be the case
		// as the driver would be invalid
		if (this.m_arrVehicles.length > 0) {
			// Create an array for the units
			oJSON["vehicles"] = [];
			
			// Add all of the vehicles
			for (var i = 0; i < this.m_arrVehicles.length; i++) {
				oJSON.vehicles.push(this.m_arrVehicles[i].writeJSON({}));
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
UpstartDriver.prototype.readJSON = function (oJSON) {
	// Call the base class
	var nInvalid = 0;
	
	// Check for a CDL
	if ("cdl" in oJSON) {
		if (!this.setCDL(oJSON.cdl)) {
			nInvalid |= UPSTART_ACCOUNT_DRIVER_CDL;
		}
	}
	
	// Check for a DOT
	if ("dot" in oJSON) {
		if (!this.setDOT(oJSON.dot)) {
			nInvalid |= UPSTART_ACCOUNT_DRIVER_DOT;
		}
	}
	
	// Check for a MC
	if ("mc" in oJSON) {
		if (!this.setMC(oJSON.mc)) {
			nInvalid |= UPSTART_ACCOUNT_DRIVER_MC;
		}
	}
	
	// Check for vehicles
	if ("vehicles" in oJSON) {
		// Create an array of vehicles
		var arrVehicles = [];
		for (var i = 0; i < oJSON.vehicles.length; i++) {
			// Create a new vehicle
			var oVehicle = new UpstartVehicle();
			
			// Convert from JSON
			if (oVehicle.readJSON(oJSON.vehicles[i]) == 0) {
				// Add to the array
				arrVehicles.push(oVehicle);
			}
			else {
				nInvalid |= UPSTART_ACCOUNT_DRIVER_VEHICLES;
			}
		}
		
		// Set the vehicles
		if (!this.setVehicles(arrVehicles)) {
			nInvalid |= UPSTART_ACCOUNT_DRIVER_VEHICLES;
		}
	}

	return nInvalid;
}