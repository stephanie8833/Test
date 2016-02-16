/********************************************************************************
 *  Overview:   The file contains the Upstart Unit object. It stores the
 *				a packaged unit that is part of a load. A unit is defined by 
 *				its dimensions, weight, and requirements.
 *              
 * Created:     Februray 1, 2016
 * Creator:     Manuel Perez
 ********************************************************************************/

////////////////////////////////////////////////////////////////
// Definitions
////////////////////////////////////////////////////////////////
// Unit Value Flag Definitions
var UPSTART_UNIT_CONTROL_FLAGS			= 0x00000001;
var UPSTART_UNIT_DIMENSIONS				= 0x00000002;
var UPSTART_UNIT_WEIGHT					= 0x00000004;
var UPSTART_UNIT_DESCRIPTION			= 0x00000008;

// Unit Control Flags
var UPSTART_UNIT_IS_STACKABLE			= 0x00000001;	// The unit can be stacked on top of other stackable units.
var UPSTART_UNIT_REQUIRES_COOLING		= 0x00000002;	// The unit requires cooling during transport.
var UPSTART_UNIT_REQUIRES_COVER			= 0x00000004;	// The unit is required to be covered during transport.
var UPSTART_UNIT_REQUIRES_UPRIGHT		= 0x00000008;	// The unit must be stored upright during transport.

var UPSTART_UNIT_CONTROL_FLAGS_ALL		= UPSTART_UNIT_IS_STACKABLE | UPSTART_UNIT_REQUIRES_COOLING | UPSTART_UNIT_REQUIRES_COVER | UPSTART_UNIT_REQUIRES_UPRIGHT;
var UPSTART_UNIT_CONTROL_FLAGS_INVALID	= ~UPSTART_UNIT_CONTROL_FLAGS_ALL;


////////////////////////////////////////////////////////////////
// Constructor
////////////////////////////////////////////////////////////////
/**
 * Creates an instance of a unit.
 *
 * @constructor
 */
var UpstartUnit = function () {
	// Assign our initial flags to invalid
	this.m_nControlFlags = UPSTART_UNIT_CONTROL_FLAGS_INVALID;

	// Assign our initial dimensions to invalid
	this.m_nWidth = 0;
	this.m_nHeight = 0;
	this.m_nLength = 0;
	
	// Assign our initial weight to invalid
	this.m_nWeight = 0;

	// Assign our description to empty
	this.m_strDescription = "";
}

////////////////////////////////////////////////////////////////
// Control Flag Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the control flags of the unit.
 *
 * @return {number} Control flags of the unit (see above).
 */
UpstartUnit.prototype.getControlFlags = function () {
	return this.m_nControlFlags;
}

/**
 * Sets the control flags for the unit.
 *
 * @param {number} nControlFlags New control flags.
 * @return {boolean} true if successful, else false.
 */
UpstartUnit.prototype.setControlFlags = function (nControlFlags) {
	// Must be a combination of the available flags
	if ((nControlFlags & UPSTART_UNIT_CONTROL_FLAGS_INVALID) != 0) return false;
	
	this.m_nControlFlags = nControlFlags;
	return true;
}

////////////////////////////////////////////////////////////////
// Dimension and Weight Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the width of the unit in inches.
 *
 * @return {number} Width dimension.
 */
UpstartUnit.prototype.getWidth = function () {
	return this.m_nWidth;
}

/**
 * Retrieves the height of the unit in inches.
 *
 * @return {number} Height dimension.
 */
UpstartUnit.prototype.getHeight = function () {
	return this.m_nWidth;
}

/**
 * Retrieves the length of the unit in inches.
 *
 * @return {number} Height dimension.
 */
UpstartUnit.prototype.getLength = function () {
	return this.m_nWidth;
}

/**
 * Sets the dimesnions for the unit in inches.
 *
 * @param {number} nWidth New width dimension.
 * @param {number} nHeight New height dimension.
 * @param {number} nLength New length dimension.
 * @return {boolean} true if successful, else false.
 */
UpstartUnit.prototype.setDimensions = function (nWidth, nHeight, nLength) {
	// Verify that the dimensions are all above zero
	if (nWidth <= 0) return false;
	if (nHeight <= 0) return false;
	if (nLength <= 0) return false;
	
	// Set the values
	this.m_nWidth = nWidth;
	this.m_nHeight = nHeight;
	this.m_nLength = nLength;
	return true;
}

/**
 * Retrieves the weight of the unit in pounds.
 *
 * @return {number} Weight of the unit.
 */
UpstartUnit.prototype.getWeight = function () {
	return this.m_nWeight;
}

/**
 * Sets the weight for the unit in pounds.
 *
 * @param {number} nWeight New weight dimension.
 * @return {boolean} true if successful, else false.
 */
UpstartUnit.prototype.setWeight = function (nWeight) {
	if (nWeight <= 0) return false;
	
	this.m_nWeight = nWeight;
	return true;
}

////////////////////////////////////////////////////////////////
// Description Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the human readable description for the unit.
 * This can be empty.
 *
 * @return {string} Human readable description for the unit.
 */
UpstartUnit.prototype.getDescription = function () {
	return this.m_strDescription;
}

/**
 * Sets the human readable description for the unit. This can 
 * be empty.
 *
 * @param {string} strDescription New description.
 * @return {boolean} true if successful, else false.
 */
UpstartUnit.prototype.setDescription = function (strDescription) {
	// A description is always valid
	this.m_strDescription = strDescription;
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
UpstartUnit.prototype.validate = function (nToValidate) {
	// We always validate all if unspecified
	nToValidate = assignDefaultValue(nToValidate, -1);
	
	// Setup the invalid return falgs
	var nInvalid = 0;
	
	// Check the control flags
	if ((nToValidate & UPSTART_UNIT_CONTROL_FLAGS) != 0) {
		if ((this.m_nControlFlags & UPSTART_UNIT_CONTROL_FLAGS_INVALID) != 0) {
			nInvalid |= UPSTART_UNIT_CONTROL_FLAGS;
		}
	}
	
	// Check the dimensions
	if ((nToValidate & UPSTART_UNIT_DIMENSIONS) != 0) {
		if ((this.m_nWidth == 0) || (this.m_nHeight == 0) || (this.m_nLength == 0) ) {
			nInvalid |= UPSTART_UNIT_DIMENSIONS;
		}
	}
	
	// Check the weight
	if ((nToValidate & UPSTART_UNIT_WEIGHT) != 0) {
		if(this.m_nWeight == 0) {
			nInvalid |= UPSTART_UNIT_WEIGHT;
		}
	}
	
	// We never check the description, since it is always valid
	
	return nInvalid;
}

/**
 * Checks to see if two objects are equal.
 *
 * @param {object} oObject The object to compare to.
 * @return {boolean} True if they are euqal, else false. 
 */
UpstartUnit.prototype.isEqual = function (oObject) {
	// Check the type of the objects
	if ((typeof this) != (typeof oObject)) return false;

	if (this.m_nControlFlags != oObject.m_nControlFlags) return false;

	if (this.m_nWidth != oObject.m_nWidth) return false;
	if (this.m_nHeight != oObject.m_nHeight) return false;
	if (this.m_nLength != oObject.m_nLength) return false;
	
	if (this.m_nWeight != oObject.m_nWeight) return false;
	
	if (this.m_strDescription != oObject.m_strDescription) return false;
	
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
UpstartUnit.prototype.writeJSON = function (oJSON, nToWrite) {
	// We always write all if unspecified
	nToWrite = assignDefaultValue(nToWrite, -1);
	
	// Copy the requested properties
	if ((nToWrite & UPSTART_UNIT_CONTROL_FLAGS) != 0) {
		oJSON["flags"] = this.m_nControlFlags;
	}

	if ((nToWrite & UPSTART_UNIT_DIMENSIONS) != 0) {
		oJSON["width"] = this.m_nWidth;
		oJSON["height"] = this.m_nHeight;
		oJSON["length"] = this.m_nLength;
	}
	
	if ((nToWrite & UPSTART_UNIT_WEIGHT) != 0) {
		oJSON["weight"] = this.m_nWeight;
	}
	
	if ((nToWrite & UPSTART_UNIT_DESCRIPTION) != 0) {
		// There is no need to write this if there is no description
		if (this.m_strDescription != "") {
			oJSON["description"] = this.m_strDescription;
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
UpstartUnit.prototype.readJSON = function (oJSON) {
	// Setup the invalid return falgs
	var nInvalid = 0;
	
	// Check for the control flags
	if ("flags" in oJSON) {
		if (!this.setControlFlags(oJSON.flags)) {
			nInvalid |= UPSTART_UNIT_CONTROL_FLAGS;
		}
	}

	// Check for the dimensions
	if (("width" in oJSON) && ("height" in oJSON) && ("length" in oJSON)) {
		if (!this.setDimensions(oJSON.width, oJSON.height, oJSON.length)) {
			nInvalid |= UPSTART_UNIT_DIMENSIONS;
		}
	}
	
	// Check for the weight
	if ("weight" in oJSON) {
		if (!this.setWeight(oJSON.weight)) {
			nInvalid |= UPSTART_UNIT_WEIGHT;
		}

	}
	
	// Check for a description
	if ("description" in oJSON) {
		// Note: The call below will never fail.
		if (!this.setDescription(oJSON.description)) {
			nInvalid |= UPSTART_UNIT_DESCRIPTION;
		}
	}
	
	return nInvalid;
}