/********************************************************************************
 *  Overview:   The file contains the Upstart Vehicle object. This object manages
 *				basic vehicle information.
 *              
 * Created:     February 11, 2016
 * Creator:     Manuel Perez
 ********************************************************************************/

////////////////////////////////////////////////////////////////
// Definitions
/////////////////////////////////////////////////////////////////
// Vehicle Value Flag Definitions
var UPSTART_VEHICLE_TYPE						= 0x00000001;
var UPSTART_VEHICLE_VIN							= 0x00000002;
var UPSTART_VEHICLE_LICENSE						= 0x00000003;
var UPSTART_VEHICLE_MODEL						= 0x00000004;
var UPSTART_VEHICLE_CONTAINER					= 0x00000008;

// Vehicle Type Definitions
var UPSTART_VEHICLE_TYPE_MOTORIZED				= 0x00000001;	// The vehicle is motorized.
var UPSTART_VEHICLE_TYPE_CONTAINER				= 0x00000002;	// The vehicle has a container.
var UPSTART_VEHICLE_TYPE_ENCLOSED				= 0x00000004;	// The vehicle has an enclosed container. Must be combined with the container flag.

var UPSTART_VEHICLE_TYPE_ALL					= UPSTART_VEHICLE_TYPE_MOTORIZED | UPSTART_VEHICLE_TYPE_CONTAINER | UPSTART_VEHICLE_TYPE_ENCLOSED;
var UPSTART_VEHICLE_TYPE_INVALID				= ~UPSTART_VEHICLE_TYPE_ALL;

////////////////////////////////////////////////////////////////
// Constructor
////////////////////////////////////////////////////////////////
/**
 * Creates an instance of a vehicle.
 *
 * @constructor
 */
var UpstartVehicle = function () {
	// Set an invalid type
	this.m_nType = UPSTART_VEHICLE_TYPE_INVALID;
	
	// Create empty basic information about the vehicle
	this.m_strVIN = "";
	this.m_strLicense = "";
	this.m_strModel = "";

	// Set the container to null for now
	this.m_oContainer = null;
}

/**
 * Creates an instance of a tractor vehicle type.
 *
 * @return {UpstartVehicle} New empty vehicle.
 */
UpstartVehicle.CreateTractor = function () {
	var oVehicle = new UpstartVehicle();
	oVehicle.setType(UPSTART_VEHICLE_TYPE_MOTORIZED);

	return oVehicle;
}

/**
 * Creates an instance of a flat bed trailer vehicle type.
 *
 * @return {UpstartVehicle} New empty vehicle.
 */
UpstartVehicle.CreateFlatBedTrailer = function () {
	var oVehicle = new UpstartVehicle();
	oVehicle.setType(UPSTART_VEHICLE_TYPE_CONTAINER);
	oVehicle.m_oContainer.setControlFlags(0);
	
	return oVehicle;
}

/**
 * Creates an instance of a dry van trailer vehicle type.
 *
 * @return {UpstartVehicle} New empty vehicle.
 */
UpstartVehicle.CreateDryVanTrailer = function () {
	var oVehicle = new UpstartVehicle();
	oVehicle.setType(UPSTART_VEHICLE_TYPE_CONTAINER|UPSTART_VEHICLE_TYPE_ENCLOSED);
	oVehicle.m_oContainer.setControlFlags(UPSTART_CONTAINER_IS_ENCLOSED);
	
	return oVehicle;
}

/**
 * Creates an instance of a reefer trailer vehicle type.
 *
 * @return {UpstartVehicle} New empty vehicle.
 */
UpstartVehicle.CreateReeferTrailer = function () {
	var oVehicle = new UpstartVehicle();
	oVehicle.setType(UPSTART_VEHICLE_TYPE_CONTAINER|UPSTART_VEHICLE_TYPE_ENCLOSED);
	oVehicle.m_oContainer.setControlFlags(UPSTART_CONTAINER_IS_ENCLOSED| UPSTART_CONTAINER_IS_COOLED);
	
	return oVehicle;
}

/**
 * Creates an instance of a van vehicle type.
 *
 * @return {UpstartVehicle} New empty vehicle.
 */
UpstartVehicle.CreateVan = function () {
	var oVehicle = new UpstartVehicle();
	oVehicle.setType(UPSTART_VEHICLE_TYPE_MOTORIZED | UPSTART_VEHICLE_TYPE_CONTAINER | UPSTART_VEHICLE_TYPE_ENCLOSED);
	oVehicle.m_oContainer.setControlFlags(UPSTART_CONTAINER_IS_ENCLOSED);
	
	return oVehicle;
}

////////////////////////////////////////////////////////////////
// General Access and Modification Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the type of the vehicle.
 *
 * @return {number} Type of the vehicle.
 */
UpstartVehicle.prototype.getType = function () {
	return this.m_nType;
}

/**
 * Sets a new type for the vehicle. In generally this
 * should never be called directly.
 *
 * @param {number} nType New Type for the vehicle.
 * @return {boolean} True if successful, else false.
 */
UpstartVehicle.prototype.setType = function (nType) {
	// Check for the valid types
	if ((nType& UPSTART_VEHICLE_TYPE_INVALID) != 0) return false;
	
	this.m_nType = nType;
	
	// We may need to create or destroy our container
	if ((this.m_nType & UPSTART_VEHICLE_TYPE_CONTAINER) != 0) {
		if ((this.m_nType & UPSTART_VEHICLE_TYPE_ENCLOSED) == 0) {
			this.m_oContainer = new UpstartContainer();
		}
		else {
			this.m_oContainer = new UpstartContainerEnclosed();
		}
	}
	else {
		this.m_oContainer = null;
	}

	return true;
}

/**
 * Retrieves the VIN of the vehicle.
 *
 * @return {string} VIN for the vehicle.
 */
UpstartVehicle.prototype.getVIN = function () {
	return this.m_strVIN;
}

/**
 * Sets a new VIN for the vehicle.
 *
 * @param {string} strVIN New CDL for the vehicle.
 * @return {boolean} True if successful, else false.
 */
UpstartVehicle.prototype.setVIN = function (strVIN) {
	// Remove all whitespace
	strVIN = strVIN.replace(/\s/g, "");
	
	// We must be 17 characters long
	if (strVIN.length != 17) return false;
	
	this.m_strVIN = strVIN;
	return true;
}

/**
 * Retrieves the license of the vehicle.
 *
 * @return {string} License for the account.
 */
UpstartVehicle.prototype.getLicense = function () {
	return this.m_strLicense;
}

/**
 * Sets a new license for the vehicle.
 *
 * @param {string} strLicense New License for the vehicle.
 * @return {boolean} True if successful, else false.
 */
UpstartVehicle.prototype.setLicense = function (strLicense) {
	// Remove all whitespace
	strLicense = strLicense.replace(/\s/g, "");
	
	// We must be at least one character long 
	if (strLicense.length < 1) return false;
	
	this.m_strLicense = strLicense;
	return true;
}

/**
 * Retrieves the model of the vehicle.
 *
 * @return {string} Model for the vehicle.
 */
UpstartVehicle.prototype.getModel = function () {
	return this.m_strModel;
}

/**
 * Sets a new model for the vehicle.
 *
 * @param {string} strModel New model for the vehicle.
 * @return {boolean} True if successful, else false.
 */
UpstartVehicle.prototype.setModel = function (strModel) {	
	// We must be at least one character long 
	if (strModel.length < 1) return false;
	
	this.m_strModel = strModel;
	return true;
}

////////////////////////////////////////////////////////////////
// Container and Trasportation Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the container of the vehicle.
 *
 * @return {UpstartConatiner} Conatiner for the vehicle.
 */
UpstartVehicle.prototype.getContainer = function () {
	return this.m_oContainer;
}

/**
 * Checks to see if this vehicle can contain the selected
 * contents. This will check the requirements, dimensions,
 * and weights.
 *
 * @param {UpstartContents} oContents The contents to check.
 * @return {boolean} True if the conatiner can carry the load.
 */
UpstartContainer.prototype.canTransportContents = function (oContents) {
	// Get the control flags for the contents
	var nContentFlags = oContents.getControlFlags();

	// The first thing we need to check is if we need a container
	if ((nContentFlags & UPSTART_CONTENTS_IN_CONTAINER) != 0) {
		// In this case we must not have a conatiner
		if ((this.m_nType & UPSTART_VEHICLE_TYPE_CONTAINER) != 0) return false;
		// We must also be motorized
		else if ((this.m_nType & UPSTART_VEHICLE_TYPE_OPEN_MOTORIZED) == 0) return false;
		else return true;
	}

	// Now we know that we need a conatiner, so we check if we have one
	if (this.m_oContainer == null) return false;

	// Check the container versus the contents
	return this.m_oContainer.canContainContents(oContents);
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
UpstartVehicle.prototype.validate = function (nToValidate) {
	// We always validate all if unspecified
	nToValidate = assignDefaultValue(nToValidate, -1);
	
	// Call the base class
	var nInvalid = 0;
	
	// Check the basic properties
	if (((nToValidate & UPSTART_VEHICLE_TYPE) != 0) && (this.m_nType == UPSTART_VEHICLE_TYPE_INVALID)) nInvalid |= UPSTART_VEHICLE_TYPE;
	if (((nToValidate & UPSTART_VEHICLE_VIN) != 0) && (this.m_strVIN == "")) nInvalid |= UPSTART_VEHICLE_VIN;
	if (((nToValidate & UPSTART_VEHICLE_LICENSE) != 0) && (this.m_strLicense == "")) nInvalid |= UPSTART_VEHICLE_LICENSE;
	if (((nToValidate & UPSTART_VEHICLE_MODEL) != 0) && (this.m_strModel == "")) nInvalid |= UPSTART_VEHICLE_MODEL;
	
	// Check for a container
	if ((nToValidate & UPSTART_VEHICLE_CONTAINER) != 0) {
		if ((this.m_nType & UPSTART_VEHICLE_TYPE_CONTAINER) == 0) {
			// The conatiner must not exist
			if (this.m_oContainer != null) nInvalid |= UPSTART_VEHICLE_CONTAINER;
		}
		else {
			// The container must exist and be valid
			if (this.m_oContainer == null) nInvalid |= UPSTART_VEHICLE_CONTAINER;
			else if(this.m_oContainer.validate() != 0) nInvalid |= UPSTART_VEHICLE_CONTAINER;
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
UpstartVehicle.prototype.isEqual = function (oObject) {
	// Check the type of the objects
	if ((typeof this) != (typeof oObject)) return false;
	
	// For vehicles we just use the VIN
	if (this.m_strVIN != oObject.m_strVIN) return false;
	
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
UpstartVehicle.prototype.writeJSON = function (oJSON, nToWrite) {
	// We always write all if unspecified
	nToWrite = assignDefaultValue(nToWrite, -1);
	
	// Copy the requested properties
	if ((nToWrite & UPSTART_VEHICLE_TYPE) != 0) oJSON["type"] = this.m_nType;
	if ((nToWrite & UPSTART_VEHICLE_VIN) != 0) oJSON["vin"] = this.m_strVIN;
	if ((nToWrite & UPSTART_VEHICLE_LICENSE) != 0) oJSON["license"] = this.m_strLicense;
	if ((nToWrite & UPSTART_VEHICLE_MODEL) != 0) oJSON["model"] = this.m_strModel;
	
	// Copy the container if we have one
	if ((nToWrite & UPSTART_VEHICLE_CONTAINER) != 0) {
		if ((this.m_nType&UPSTART_VEHICLE_TYPE_CONTAINER) != 0) {
			// The container must exist and be valid
			if (this.m_oContainer != null) {
				oJSON["container"] = this.m_oContainer.writeJSON({});
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
UpstartVehicle.prototype.readJSON = function (oJSON) {
	// Call the base class
	var nInvalid = 0;
	
	// Check for a Type
	if ("type" in oJSON) {
		if (!this.setType(oJSON.type)) {
			nInvalid |= UPSTART_VEHICLE_TYPE;
		}
	}

	// Check for a VIN
	if ("vin" in oJSON) {
		if (!this.setVIN(oJSON.vin)) {
			nInvalid |= UPSTART_VEHICLE_VIN;
		}
	}
	
	// Check for a license
	if ("license" in oJSON) {
		if (!this.setLicense(oJSON.license)) {
			nInvalid |= UPSTART_VEHICLE_LICENSE;
		}
	}
	
	// Check for a model
	if ("model" in oJSON) {
		if (!this.setModel(oJSON.model)) {
			nInvalid |= UPSTART_VEHICLE_MODEL;
		}
	}
	
	// Check for a conatiner
	if ("container" in oJSON) {
		if (this.m_oContainer == null) nInvalid |= UPSTART_VEHICLE_CONTAINER;
		else {
			if (this.m_oContainer.readJSON(oJSON.container) != 0) {
				nInvalid |= UPSTART_VEHICLE_CONTAINER;
			}
		}
	}
	
	return nInvalid;
}