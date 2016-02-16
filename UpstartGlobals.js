/********************************************************************************
 * Overview:   The file contains some gobal functions used in the Upstart
 *              system.
 *              
 * Created:     January 27, 2016
 * Creator:     Manuel Perez
 ********************************************************************************/

////////////////////////////////////////////////////////////////
// Global Definitions
////////////////////////////////////////////////////////////////
// Error Flag Definitions
var UPSTART_ERROR_DATABASE				= 0x10000000;		// There was an issue related to the database on the server
var UPSTART_ERROR_OBJECT_INVALID		= 0x20000000;		// There was an issue related to the input object information
var UPSTART_ERROR_OBJECT_DOES_EXIST		= 0x30000000;		// The object specified does not exist

// Distance Parameter
var UPSTART_DISTANCE_CLOSE				= 5.0;				// Close distance in miles.
var UPSTART_DISTANCE_CLOSE_EXIT			= 10.0;				// The maximum distance we can drift to exit the close distance.
var UPSTART_DISTANCE_AT					= 0.25;				// At distance in miles.  
var UPSTART_DISTANCE_AT_EXIT			= 1.0;				// The maximum distance we can drift to exit the at distance.

////////////////////////////////////////////////////////////////
// Global Functions
////////////////////////////////////////////////////////////////
/**
 * Used to setup javascript inheritance for objects.
 *
 * @param {class} oChild The child class.
 * @param {class} strAPI The parent class to inherit from.
 */
var inheritsFrom = function (oChild, oParent) {
    oChild.prototype = Object.create(oParent.prototype);
};

/**
 * Used to handle default parameters.
 * 
 * @param {Object} oValue Variables value
 * @param {Object} oDefault Default value
 */
function assignDefaultValue(oValue, oDefault) {
	if (typeof oValue == 'undefined') return oDefault;
	else return oValue;
};

/**
 * Encodes the input image in base64 based on the specified format.
 *
 * @param {Image} oImage An image object. Should be ready and loaded into memory.
 * @param {string} strFormat Image format to convert the input image into before encoding.
 * @return {string} The base64 encoded image.
 */
function encodeImageBase64(oImage, strFormat) {
	// Create an empty canvas element
	var oCanvas = document.createElement("canvas");
	
	// Set the dimensions of the canvas to the dimensions of the image
	oCanvas.width = oImage.width;
	oCanvas.height = oImage.height;
	
	// Get the canvas context
	var oContext = oCanvas.getContext("2d");
	
	// Render the image to the context
	oContext.drawImage(oImage, 0, 0);
	
	// Get the data-URL formatted image
	var dataURL = oCanvas.toDataURL(strFormat);
	
	// Cleanup the data-URL so that it only contains the encoded data
	return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

/**
 * Check to see if the id is valid.
 *
 * @param {object} oID The object unique identifier.
 * @return {boolean} True if the id is valid, else false.
 */
var isIDValid = function (oID) {
	if (oID == "") return false;

	var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
	return checkForHexRegExp.test(oID);
};
