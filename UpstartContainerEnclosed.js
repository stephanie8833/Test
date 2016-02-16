/********************************************************************************
 *  Overview:   The file contains the Upstart Container Enclosedobject. An 
 *				enclosed container object extends the base container by adding
 *				in a height component.
 *              
 * Created:     Februray 12, 2016
 * Creator:     Manuel Perez
 ********************************************************************************/

////////////////////////////////////////////////////////////////
// Constructor
////////////////////////////////////////////////////////////////
/**
 * Creates an instance of a conatiner.
 *
 * @constructor
 */
var UpstartContainerEnclosed = function () {
	// Call the base constructor
	UpstartContainer.call(this);
	
	// Add the height dimension and assign it as empty
	this.m_nHeight = 0;
}
inheritsFrom(UpstartContainerEnclosed, UpstartContainer);

////////////////////////////////////////////////////////////////
// Control Flag Methods
////////////////////////////////////////////////////////////////
/**
 * Sets the control flags for the unit.
 *
 * @param {number} nControlFlags New control flags.
 * @return {boolean} true if successful, else false.
 */
UpstartContainerEnclosed.prototype.setControlFlags = function (nControlFlags) {
	// Must be a combination of the available flags
	if ((nControlFlags & UPSTART_CONTAINER_CONTROL_FLAGS_INVALID) != 0) return false;
	
	// We must be enclosed
	if ((nControlFlags & UPSTART_CONTAINER_IS_ENCLOSED) == 0) return false;

	this.m_nControlFlags = nControlFlags;
	return true;
}

////////////////////////////////////////////////////////////////
// Dimension and Weight Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the height of the container in inches.
 *
 * @return {number} Height dimension.
 */
UpstartContainerEnclosed.prototype.getHeight = function () {
	return this.m_nHeight;
}

/**
 * Sets the dimensions for the container in inches.
 *
 * @param {number} nWidth New width dimension.
 * @param {number} nHeight New width dimension.
 * @param {number} nLength New length dimension.
 * @return {boolean} true if successful, else false.
 */
UpstartContainerEnclosed.prototype.setDimensions = function (nWidth, nHeight, nLength) {
	// Verify that we have 3 parameters as the base method should always
	// fail since we need a height
	if (typeof nLength == "undefined") return false;
	
	// Call the base method
	if (!UpstartContainer.prototype.setDimensions.call(this, nWidth, nLength)) return false;

	// Verify that the height are all above zero
	if (nHeight <= 0) return false;
	
	// Set the height
	this.m_nHeight = nHeight;
	return true;
}

////////////////////////////////////////////////////////////////
// Carry Methods
////////////////////////////////////////////////////////////////
/**
 * Checks to see if the input units will fit in the container.
 *
 * @param {array} arrUnits Array of UpstartUnits to check.
 * @return {boolean} True if the conatiner can carry the load.
 */
UpstartContainerEnclosed.prototype.canFitUnits = function (arrUnits) {
	// TODO: (KELLY) NEEDS IMPLEMENTATION - MAY BE ASYNSCRONOUS
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
UpstartContainerEnclosed.prototype.validate = function (nToValidate) {
	// We always validate all if unspecified
	nToValidate = assignDefaultValue(nToValidate, -1);
	
	// Setup the invalid return value and call the base method
	var nInvalid = UpstartContainer.prototype.validate.call(this, nToValidate);
	
	// Check the height
	if ((nToValidate & UPSTART_CONTAINER_DIMENSIONS) != 0) {
		if (this.m_nHeight == 0) {
			nInvalid |= UPSTART_CONTAINER_DIMENSIONS;
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
UpstartContainerEnclosed.prototype.writeJSON = function (oJSON, nToWrite) {
	// We always write all if unspecified
	nToWrite = assignDefaultValue(nToWrite, -1);
	
	// Call the base method
	oJSON = UpstartContainer.prototype.writeJSON.call(this, oJSON, nToWrite);
	
	// Copy the requested properties
	if ((nToWrite & UPSTART_CONTAINER_DIMENSIONS) != 0) {
		oJSON["height"] = this.m_nHeight;
	}
	
	return oJSON;
}

/**
 * Populates the object from a cleanly formatted JSON reprsentation.
 *
 * @param {object} oJSON Object in JSON format.
 * @return {number} Zero for success, else invalid items.
 */
UpstartContainerEnclosed.prototype.readJSON = function (oJSON) {
	// Setup the invalid return value and call the base
	var nInvalid = UpstartContainer.prototype.readJSON.call(this, oJSON);

	// Check for the dimensions
	if (("width" in oJSON) && ("height" in oJSON) && ("length" in oJSON)) {
		if (!this.setDimensions(oJSON.width, oJSON.height, oJSON.length)) {
			nInvalid |= UPSTART_CONTAINER_DIMENSIONS;
		}
	}

	return nInvalid;
}