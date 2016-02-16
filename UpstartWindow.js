/********************************************************************************
 *  Overview:   The file contains the Upstart Window object. It stores the
 *				window of time allocated for a pickup or delivery. Time is stored
 *				as milliseconds since January 1, 1970 during any JSON serialization.
 *              
 * Created:     January 29, 2016
 * Creator:     Manuel Perez
 ********************************************************************************/

////////////////////////////////////////////////////////////////
// Definitions
////////////////////////////////////////////////////////////////
// Window Value Flag Definitions
var UPSTART_WINDOW_BEGIN	= 0x00000001;
var UPSTART_WINDOW_END		= 0x00000002;

////////////////////////////////////////////////////////////////
// Constructor
////////////////////////////////////////////////////////////////
/**
 * Creates an instance of a window.
 *
 * @constructor
 */
var UpstartWindow = function () {
	// Assign our variables
	this.m_nBegin = 0;
	this.m_nEnd = 0;
}

////////////////////////////////////////////////////////////////
// Window Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the begin date of the window.
 *.
 * @return {number} The date in milliseconds since January 1, 1970 in UTC.
 */
UpstartWindow.prototype.getBegin = function () {
	return this.m_nBegin;
}

/**
 * Retrieves the end date of the window.
 *
 * @return {number} The date in milliseconds since January 1, 1970 in UTC.
 */
UpstartWindow.prototype.getEnd = function () {
	return this.m_nEnd;
}

/**
 * Sets the begin date for the window.
 *
 * @param {number} nDate The date in milliseconds since January 1, 1970 in UTC.
 */
UpstartWindow.prototype.setBegin = function (nDate) {
	this.m_nBegin = nDate;
	return true;
}

/**
 * Sets the end date for the window.
 *
 * @param {number} nDate The date in milliseconds since January 1, 1970 in UTC.
 */
UpstartWindow.prototype.setEnd = function (nDate) {
	this.m_nEnd = nDate;
	return true;
}

////////////////////////////////////////////////////////////////
// Date Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the begin date of the window.
 *
 * @return {date} begin date.
 */
UpstartWindow.prototype.getBeginDate = function () {
	var oDate = new Date(this.getBegin());
	return oDate;
}

/**
 * Retrieves the end date of the window.
 *
 * @return {date} end date.
 */
UpstartWindow.prototype.getEndDate = function (bLocal) {
	var oDate = new Date(this.getEnd());
	return oDate;
}

/**
 * Sets the begin date for the window.
 *
 * @param {date} oDate Date to set.
 */
UpstartWindow.prototype.setBeginDate = function (oDate) {
	// Convert the date to milliseconds
	var nDate = oDate.getTime();
	
	// Verify that the date is valid
	if (isNaN(nDate)) return false;

	return this.setBegin(nDate);
}

/**
 * Sets the end date for the window.
 *
 * @param {date} oDate Date to set.
 */
UpstartWindow.prototype.setEndDate = function (oDate) {
	// Convert the date to milliseconds
	var nDate = oDate.getTime();
	
	// Verify that the date is valid
	if (isNaN(nDate)) return false;
	
	return this.setEnd(nDate);
}

////////////////////////////////////////////////////////////////
// Validation Methods
////////////////////////////////////////////////////////////////
/**
 * Checks to see if the object is valid and returns the items
 * that are invalide.
 *
 * @param {number} nToValidate The validation flags to check.
 * @return {number} Zero for success, else invalid items.
 */
UpstartWindow.prototype.validate = function (nToValidate) {
	// We always validate all if unspecified
	nToValidate = assignDefaultValue(nToValidate, -1);
	
	// Setup the invalid return falgs
	var nInvalid = 0;
	
	// Check the begin
	if ((nToValidate & UPSTART_WINDOW_BEGIN) != 0) {
		if (this.m_nBegin == 0 ) {
			nInvalid |= UPSTART_WINDOW_BEGIN;
		}
	}
	
	if ((nToValidate & UPSTART_WINDOW_END) != 0) {
		if (this.m_nEnd == 0) {
			nInvalid |= UPSTART_WINDOW_END;
		}
	}
	
	// For validity we will also check to make sure that end time occurs after the begin time
	if (((nToValidate & UPSTART_WINDOW_BEGIN) != 0) && ((nToValidate & UPSTART_WINDOW_END) != 0)) {
		if (this.m_nBegin > this.m_nEnd) {
			nInvalid |= (UPSTART_WINDOW_BEGIN|UPSTART_WINDOW_END);
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
UpstartWindow.prototype.writeJSON = function (oJSON, nToWrite) {
	// We always write all if unspecified
	nToWrite = assignDefaultValue(nToWrite, -1);
	
	// Copy the requested properties
	if ((nToWrite & UPSTART_WINDOW_BEGIN) != 0) oJSON["begin"] = this.m_nBegin;
	if ((nToWrite & UPSTART_WINDOW_END) != 0) oJSON["end"] = this.m_nEnd;
	
	return oJSON;
}

/**
 * Populates the object from a cleanly formatted JSON reprsentation.
 *
 * @param {object} oJSON Object in JSON format.
 * @return {number} Zero for success, else invalid items.
 */
UpstartWindow.prototype.readJSON = function (oJSON) {
	// Setup the invalid return falgs
	var nInvalid = 0;
	
	// For the reading from JSON we will support both
	// a Javascript date and raw number
	
	// Check for a begin
	if ("begin" in oJSON) {
		if (typeof oJSON.begin == 'string') {
			if (!this.setBeginDate(new Date(oJSON.begin))) {
				nInvalid |= UPSTART_WINDOW_BEGIN;
			}

		}
		else {
			if (!this.setBegin(oJSON.begin)) {
				nInvalid |= UPSTART_WINDOW_BEGIN;
			}
		}
	}
	
	// Check for an end
	if ("end" in oJSON) {
		if (typeof oJSON.end == 'string') {
			if (!this.setEndDate(new Date(oJSON.end))) {
				nInvalid |= UPSTART_WINDOW_END;
			}
		}
		else {
			if (!this.setEnd(oJSON.end)) {
				nInvalid |= UPSTART_WINDOW_END;
			}
		}
	}
	
	return nInvalid;
}