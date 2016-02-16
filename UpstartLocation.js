/********************************************************************************
 *  Overview:   The file contains the Upstart Location object. It stores the
 *				latitude and longitude location information.
 *              
 * Created:     January 28, 2016
 * Creator:     Manuel Perez
 ********************************************************************************/

////////////////////////////////////////////////////////////////
// Definitions
////////////////////////////////////////////////////////////////
// Location Value Flag Definitions
var UPSTART_LOCATION_POSITION	= 0x00000001;

////////////////////////////////////////////////////////////////
// Constructor
////////////////////////////////////////////////////////////////
/**
 * Creates an instance of a location.
 *
 * @constructor
 */
var UpstartLocation = function () {
	// Assign our variables
	this.m_nLatitude = 0;
	this.m_nLongitude = 0;
}

////////////////////////////////////////////////////////////////
// Location Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the latitude position of the location.
 *
 * @return {number} Latitude position.
 */
UpstartLocation.prototype.getLatitude = function () {
	return this.m_nLatitude;
}

/**
 * Retrieves the logitude position of the location.
 *
 * @return {number} Longitude position.
 */
UpstartLocation.prototype.getLongitude = function () {
	return this.m_nLongitude;
}

/**
 * Sets the logitude and latitude position for the location.
 *
 * @param {number} nLongitude Longitude position
 * @param {number} nLatitude Latitude position
 */
UpstartLocation.prototype.setPosition = function (nLatitude, nLongitude ) {
	this.m_nLatitude = nLatitude;
	this.m_nLongitude = nLongitude;

	return true;
}

/**
 * Calculates the distance in miles between this location and 
 * the input location.
 *
 * @param {UpstartLocation} oLocation Location to get the distance for.
 * @return {number} Distance in miles.
 */
UpstartLocation.prototype.getDistance = function (oLocation) {
	// TODO: (STEPHANIE) NEEDS IMPLEMENTATION
	return 0;
}

/**
 * Creates a bouding box (rectangle) around the location based on
 * the input distance.
 *
 * @param {number} nDistance The distance around the location to create the bounding box in miles.
 * @return {object} Bounding box for the location as an object with "topleft" and "bottomright"
 */
UpstartLocation.prototype.createBoundingBox = function (nDistance) {
	// TODO: (STEPHANIE) NEEDS IMPLEMENTATION
	return { topleft: { latitude: 0, longitude: 0 }, bottomright: { latitude: 0, longitude: 0 } };
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
UpstartLocation.prototype.validate = function (nToValidate) {
	// We always validate all if unspecified
	nToValidate = assignDefaultValue(nToValidate, -1);

	// Setup the invalid return falgs
	var nInvalid = 0;
	
	// Check the position
	if ((nToValidate & UPSTART_LOCATION_POSITION) != 0) {
		if ((this.m_nLatitude == 0) || (this.m_nLongitude == 0)) {
			nInvalid |= UPSTART_LOCATION_POSITION;
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
UpstartLocation.prototype.isEqual = function (oObject) {
	// Check the type of the objects
	if ((typeof this) != (typeof oObject)) return false;
	
	// We check for an exact match, this is probably not the right thing to do
	if (this.m_nLatitude != oObject.m_nLatitude) return false;
	if (this.m_nLongitude != oObject.m_nLongitude) return false;
		
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
UpstartLocation.prototype.writeJSON = function (oJSON, nToWrite) {
	// We always write all if unspecified
	nToWrite = assignDefaultValue(nToWrite, -1);

	// Copy the requested properties
	if ((nToWrite & UPSTART_LOCATION_POSITION) != 0) {
		oJSON["latitude"] = this.m_nLatitude;
		oJSON["longitude"] = this.m_nLongitude;
	}

	return oJSON;
}

/**
 * Populates the object from a cleanly formatted JSON reprsentation.
 *
 * @param {object} oJSON Object in JSON format.
 * @return {number} Zero for success, else invalid items.
 */
UpstartLocation.prototype.readJSON = function (oJSON) {
	// Setup the invalid return falgs
	var nInvalid = 0;
	
	// Check for a position
	if (("latitude" in oJSON) && ("longitude" in oJSON)) {
		if (!this.setPosition(oJSON.latitude, oJSON.longitude)) {
			nInvalid |= UPSTART_LOCATION_POSITION;
		}
	}

	return nInvalid;
}