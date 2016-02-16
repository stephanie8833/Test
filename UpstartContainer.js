/********************************************************************************
 *  Overview:   The file contains the Upstart Conatiner object. The conatiner 
 *				object is the root class for conatiners that can contain
 *				units.
 *              
 * Created:     Februray 12, 2016
 * Creator:     Manuel Perez
 ********************************************************************************/

////////////////////////////////////////////////////////////////
// Definitions
////////////////////////////////////////////////////////////////
// Conatiner Value Flag Definitions
var UPSTART_CONTAINER_CONTROL_FLAGS				= 0x00000001;
var UPSTART_CONTAINER_DIMENSIONS				= 0x00000002;
var UPSTART_CONTAINER_MAX_WEIGHT				= 0x00000004;

// Container Control Flags
var UPSTART_CONTAINER_IS_COOLED					= 0x00000001;	// The container can transport units that requiring cooling.
var UPSTART_CONTAINER_IS_ENCLOSED				= 0x00000002;	// The container can transport units that require to be covered.

var UPSTART_CONTAINER_CONTROL_FLAGS_ALL			= UPSTART_CONTAINER_IS_COOLED | UPSTART_CONTAINER_IS_ENCLOSED;
var UPSTART_CONTAINER_CONTROL_FLAGS_INVALID		= ~UPSTART_CONTAINER_CONTROL_FLAGS_ALL;

////////////////////////////////////////////////////////////////
// Constructor
////////////////////////////////////////////////////////////////
/**
 * Creates an instance of a conatiner.
 *
 * @constructor
 */
var UpstartContainer = function () {
	// Assign our initial flags to invalid
	this.m_nControlFlags = UPSTART_CONTAINER_CONTROL_FLAGS_INVALID;
	
	// Assign our initial dimensions to invalid
	this.m_nWidth = 0;
	this.m_nLength = 0;
	
	// Assign our initial max weight to invalid
	this.m_nMaxWeight = 0;
}

////////////////////////////////////////////////////////////////
// Control Flag Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the control flags of the unit.
 *
 * @return {number} Control flags of the unit (see above).
 */
UpstartContainer.prototype.getControlFlags = function () {
	return this.m_nControlFlags;
}

/**
 * Sets the control flags for the unit.
 *
 * @param {number} nControlFlags New control flags.
 * @return {boolean} true if successful, else false.
 */
UpstartContainer.prototype.setControlFlags = function (nControlFlags) {
	// Must be a combination of the available flags
	if ((nControlFlags & UPSTART_CONTAINER_CONTROL_FLAGS_INVALID) != 0) return false;
	
	// The base class does not support the enclosed flag
	if ((nControlFlags & UPSTART_CONTAINER_IS_ENCLOSED) != 0) return false;
	
	this.m_nControlFlags = nControlFlags;
	return true;
}

////////////////////////////////////////////////////////////////
// Dimension and Weight Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the width of the container in inches.
 *
 * @return {number} Width dimension.
 */
UpstartContainer.prototype.getWidth = function () {
	return this.m_nWidth;
}

/**
 * Retrieves the length of the container in inches.
 *
 * @return {number} Length dimension.
 */
UpstartContainer.prototype.getLength = function () {
	return this.m_nWidth;
}

/**
 * Sets the dimensions for the container in inches.
 *
 * @param {number} nWidth New width dimension.
 * @param {number} nLength New length dimension.
 * @return {boolean} true if successful, else false.
 */
UpstartContainer.prototype.setDimensions = function (nWidth, nLength) {
	// Verify that the dimensions are all above zero
	if (nWidth <= 0) return false;
	if (nLength <= 0) return false;
	
	// Set the values
	this.m_nWidth = nWidth;
	this.m_nLength = nLength;
	return true;
}

/**
 * Retrieves the maximum weight of the container in pounds.
 *
 * @return {number} Maximum weight of the container.
 */
UpstartContainer.prototype.getMaxWeight = function () {
	return this.m_nMaxWeight;
}

/**
 * Sets the maximum weight for the container in pounds.
 *
 * @param {number} nWeight New maximum weight.
 * @return {boolean} true if successful, else false.
 */
UpstartContainer.prototype.setMaxWeight = function (nMaxWeight) {
	if (nMaxWeight <= 0) return false;
	
	this.m_nMaxWeight = nMaxWeight;
	return true;
}

////////////////////////////////////////////////////////////////
// Carry Methods
////////////////////////////////////////////////////////////////
/**
 * Checks to see if this container can contain the selected
 * contents. This will check the requirements, dimensions,
 * and weights.
 *
 * @param {UpstartContents} oContents The contents to check.
 * @return {boolean} True if the conatiner can carry the load.
 */
UpstartContainer.prototype.canContainContents = function (oContents) {
	// Get the control flags for the contents
	var nContentFlags = oContents.getControlFlags();
	
	// Check the cooling property
	if ((UPSTART_UNIT_REQUIRES_COOLING & nContentFlags) != 0) {
		if ((this.m_nControlFlags & UPSTART_CONTAINER_IS_COOLED) == 0) return false;
	}
	else {
		// NOTE: Assumes that a reefer can non reefer products
		if ((this.m_nControlFlags & UPSTART_CONTAINER_IS_COOLED) != 0) return false;
	}
	
	// Check the enclosed property
	if ((UPSTART_UNIT_REQUIRES_COVER & nContentFlags) != 0) {
		if ((this.m_nControlFlags & UPSTART_CONTAINER_IS_ENCLOSED) == 0) return false;
	}
	else {
		// NOTE: Assumes that an enclosed transport can transport products
		// that do not require enclosure
		// if ((this.m_nControlFlags & UPSTART_CONTAINER_IS_ENCLOSED) != 0) return false;
	}
	
	// Check the weight
	if (this.m_nMaxWeight >= Math.round(oContents.getTotalWeight())) return false;
	
	// If we are enclosed then the child class will handle the rest
	if ((this.m_nControlFlags & UPSTART_CONTAINER_IS_ENCLOSED) != 0) return true;
	
	// Unroll all of the units
	var arrUnits = [];
	var nNumContents = oContents.getNumberOfContents();
	for (var i = 0; i < nNumContents; i++) {
		var nQuantity = oContents.getQuantityAt(i);
		var oUnit = oContents.getUnitAt(i);

		for (var j = 0; j < nQuantity; j++) {
			arrUnits.push(oUnit);
		}
	}

	// Check to see if the units will fit
	return this.canFitUnits(arrUnits);
}

/**
 * Checks to see if the input units will fit in the container.
 *
 * @param {array} arrUnits Array of UpstartUnits to check.
 * @return {boolean} True if the conatiner can carry the load.
 */
UpstartContainer.prototype.canFitUnits = function (arrUnits) {
	// TODO: (KELLY) NEEDS IMPLEMENTATION
	return true;
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
UpstartContainer.prototype.validate = function (nToValidate) {
	// We always validate all if unspecified
	nToValidate = assignDefaultValue(nToValidate, -1);
	
	// Setup the invalid return falgs
	var nInvalid = 0;
	
	// Check the control flags
	if ((nToValidate & UPSTART_CONTAINER_CONTROL_FLAGS) != 0) {
		if ((this.m_nControlFlags & UPSTART_CONTAINER_CONTROL_FLAGS_INVALID) != 0) {
			nInvalid |= UPSTART_CONTAINER_CONTROL_FLAGS;
		}
	}
	
	// Check the dimensions
	if ((nToValidate & UPSTART_CONTAINER_DIMENSIONS) != 0) {
		if ((this.m_nWidth == 0) || (this.m_nHeight == 0) || (this.m_nLength == 0)) {
			nInvalid |= UPSTART_CONTAINER_DIMENSIONS;
		}
	}
	
	// Check the weight
	if ((nToValidate & UPSTART_CONTAINER_MAX_WEIGHT) != 0) {
		if (this.m_nMaxWeight == 0) {
			nInvalid |= UPSTART_CONTAINER_MAX_WEIGHT;
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
UpstartContainer.prototype.writeJSON = function (oJSON, nToWrite) {
	// We always write all if unspecified
	nToWrite = assignDefaultValue(nToWrite, -1);
	
	// Copy the requested properties
	if ((nToWrite & UPSTART_CONTAINER_CONTROL_FLAGS) != 0) {
		oJSON["flags"] = this.m_nControlFlags;
	}
	
	if ((nToWrite & UPSTART_CONTAINER_DIMENSIONS) != 0) {
		oJSON["width"] = this.m_nWidth;
		oJSON["length"] = this.m_nLength;
	}
	
	if ((nToWrite & UPSTART_CONTAINER_MAX_WEIGHT) != 0) {
		oJSON["maxweight"] = this.m_nMaxWeight;
	}
	
	return oJSON;
}

/**
 * Populates the object from a cleanly formatted JSON reprsentation.
 *
 * @param {object} oJSON Object in JSON format.
 * @return {number} Zero for success, else invalid items.
 */
UpstartContainer.prototype.readJSON = function (oJSON) {
	// Setup the invalid return falgs
	var nInvalid = 0;
	
	// Check for the control flags
	if ("flags" in oJSON) {
		if (!this.setControlFlags(oJSON.flags)) {
			nInvalid |= UPSTART_CONTAINER_CONTROL_FLAGS;
		}
	}
	
	// Check for the dimensions, notice that we check to make sure that
	// there is no height as this will be handled in the enclosed
	// container class and this call would fail.
	if (("width" in oJSON) && ("length" in oJSON) && !("height" in oJSON)) {
		if (!this.setDimensions(oJSON.width, oJSON.length)) {
			nInvalid |= UPSTART_CONTAINER_DIMENSIONS;
		}
	}
	
	// Check for the weight
	if ("maxweight" in oJSON) {
		if (!this.setMaxWeight(oJSON.maxweight)) {
			nInvalid |= UPSTART_CONTAINER_MAX_WEIGHT;
		}
	}
	
	return nInvalid;
}