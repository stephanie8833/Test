/********************************************************************************
 *  Overview:   The file conatins the Upstart Load object. A load object contains
 *              information pertaining to a load that the shipper wishes to 
 *              be picked up from one location and delivered to another.
 *              
 * Created:     January 26, 2016
 * Creator:     Manuel Perez
 ********************************************************************************/

////////////////////////////////////////////////////////////////
// Definitions
////////////////////////////////////////////////////////////////
// Load General State Definitions (WARNING: These are order sensative)		
var UPSTART_LOAD_STATE_CREATED					= 0x00000000;			// The load has been created, but has not yet been posted.
var UPSTART_LOAD_STATE_POSTED					= 0x00000001;			// The load has been posted and is available
var UPSTART_LOAD_STATE_CANCELLED				= 0x00000002;			// The load has been cancelled.
var UPSTART_LOAD_STATE_EXPIRED					= 0x00000003;			// The load has expired.
var UPSTART_LOAD_STATE_COMPLETED				= 0x0000000F;			// The driver has been paid and the load is completed.

// Load Pickup (STATIONARY) State Definitions
var UPSTART_LOAD_STATE_PICKUP_DOCKED			= 0x00000010;			// The driver has docked at the pickup location.
var UPSTART_LOAD_STATE_PICKUP_UPLOADED			= 0x00000020;			// The driver has finished loading and has uploaded the bill of lading.

// Load Dropoff (STATIONARY) State Definitions
var UPSTART_LOAD_STATE_DROPOFF_UPLOADED			= 0x00000100;			// The driver has finished unloading and has uploaded the bill of lading
var UPSTART_LOAD_STATE_DROPOFF_DOCKED			= 0x00000200;			// The driver has docked at the drop off location.
var UPSTART_LOAD_STATE_DROPOFF_ACCEPTED			= 0x00000300;			// The shipper has approved the uploaded bill of lading at drop off.

// Load Movement (SET) State Definitions
var UPSTART_LOAD_STATE_ACCEPTED					= 0x00001000;			// The load has been accepted by a driver.
var UPSTART_LOAD_STATE_PICKUP_ACCEPTED			= 0x00002000;			// The shipper has approved the uploaded bill of lading at pickup.

// Load Movement (GET) State Definitions
var UPSTART_LOAD_STATE_PICKUP_ON_ROUTE			= 0x00010000;			// The driver is on route to the pick up location.
var UPSTART_LOAD_STATE_PICKUP_ARRIVING			= 0x00020000;			// The driver is close to the pickup location.
var UPSTART_LOAD_STATE_PICKUP_ARRIVED			= 0x00030000;			// The driver has arrived at the pickup location.
var UPSTART_LOAD_STATE_DROPOFF_ON_ROUTE			= 0x00040000;			// The driver is on route to the drop off location.
var UPSTART_LOAD_STATE_DROPOFF_ARRIVING			= 0x00050000;			// The driver is close to the drop off location.
var UPSTART_LOAD_STATE_DROPOFF_ARRIVED			= 0x00050000;			// The driver has arrived at the drop off location.

// Load Validation State Definitions
var UPSTART_LOAD_STATE_INVALID					= -1;

var UPSTART_LOAD_STATE_GET_MOVING_MIN			= UPSTART_LOAD_STATE_PICKUP_ON_ROUTE;
var UPSTART_LOAD_STATE_GET_MOVING_MAX			= UPSTART_LOAD_STATE_DROPOFF_ARRIVED;
var UPSTART_LOAD_STATE_SET_MOVING_MIN			= UPSTART_LOAD_STATE_ACCEPTED;
var UPSTART_LOAD_STATE_SET_MOVING_MAX			= UPSTART_LOAD_STATE_DROPOFF_ARRIVED;

// Load Value Flag Definitions
var UPSTART_LOAD_ID								= 0x00000001;
var UPSTART_LOAD_STATE							= 0x00000002;
var UPSTART_LOAD_SHIPPER_ID						= 0x00000004;
var UPSTART_LOAD_DRIVER_ID						= 0x00000008;
var UPSTART_LOAD_PICKUP_ADDRESS					= 0x00000010;
var UPSTART_LOAD_PICKUP_WINDOW					= 0x00000020;
var UPSTART_LOAD_DROPOFF_ADDRESS				= 0x00000100;
var UPSTART_LOAD_DROPOFF_WINDOW					= 0x00000200;
var UPSTART_LOAD_CONTENTS						= 0x00001000;
var UPSTART_LOAD_LOCATION						= 0x00010000;
var UPSTART_LOAD_LOG							= 0x00010000;

// Log Definitions
var UPSTART_LOAD_LOG_CREATED					= "created";			// The time when the load was created
var UPSTART_LOAD_LOG_PICKUP_ARRIVED				= "pickup_arrived";		// The time when the driver arrived at the pickup location
var UPSTART_LOAD_LOG_PICKUP_DOCKED				= "pickup_docked";		// The time when the driver docked at the pickup location
var UPSTART_LOAD_LOG_DROPOFF_ARRIVED			= "dropoff_arrived";	// The time when the driver arrived at the drop off location
var UPSTART_LOAD_LOG_DROPOFF_DOCKED				= "dropoff_docked";		// The time when the driver docked at the drop off location
var UPSTART_LOAD_LOG_DELIVERY_STARTED			= "delivery_started";	// The time when the driver left the pickup location
var UPSTART_LOAD_LOG_DELIVERY_FINISHED			= "delivery_finished";	// The time when the driver left the drop off location

// Image File Definitions
var UPSTART_LOAD_IMAGE_PICKUP_BOL				= "pickup_bol";			// The pickup bill of lading
var UPSTART_LOAD_IMAGE_DROPOFF_BOL				= "dropoff_bol";		// The dropoff bill of lading

// Get All Definitions
var UPSTART_LOAD_ROUTE_TYPE_ALL					= "all";				// All loads
var UPSTART_LOAD_ROUTE_TYPE_OPEN				= "open";				// All loads that are open (created, but not completed)
var UPSTART_LOAD_ROUTE_TYPE_ACTIVE				= "active";				// All loads that are active (posted, but not delivered)

// Route Definitions
var UPSTART_LOAD_ROUTE_GET_ALL					= "/api/loads";
var UPSTART_LOAD_ROUTE_GET_ALL_SHIPPER			= "/api/loads/shipper/:id/:type";
var UPSTART_LOAD_ROUTE_GET_ALL_DRIVER			= "/api/loads/driver/:id/:type";

var UPSTART_LOAD_ROUTE_CREATE					= "/api/load/create";

var UPSTART_LOAD_ROUTE_GET						= "/api/load/:id";
var UPSTART_LOAD_ROUTE_POST						= "/api/load/:id/post";
var UPSTART_LOAD_ROUTE_ACCEPT					= "/api/load/:id/accept/:driverid";
var UPSTART_LOAD_ROUTE_COMPLETE					= "/api/load/:id/complete";
var UPSTART_LOAD_ROUTE_CANCEL					= "/api/load/:id/cancel";

var UPSTART_LOAD_ROUTE_PICKUP_DOCK				= "/api/load/:id/pickup/dock";
var UPSTART_LOAD_ROUTE_PICKUP_UPLOAD			= "/api/load/:id/pickup/upload";
var UPSTART_LOAD_ROUTE_PICKUP_ACCEPT			= "/api/load/:id/pickup/accept";
var UPSTART_LOAD_ROUTE_PICKUP_REJECT			= "/api/load/:id/pickup/reject";

var UPSTART_LOAD_ROUTE_DROPOFF_DOCK				= "/api/load/:id/dropoff/dock";
var UPSTART_LOAD_ROUTE_DROPOFF_UPLOAD			= "/api/load/:id/dropoff/upload";
var UPSTART_LOAD_ROUTE_DROPOFF_ACCEPT			= "/api/load/:id/dropoff/accept";
var UPSTART_LOAD_ROUTE_DROPOFF_REJECT			= "/api/load/:id/dropoff/reject";

var UPSTART_LOAD_ROUTE_UPDATE_LOCATION			= "/api/load/:id/update/location";

var UPSTART_LOAD_ROUTE_IMAGE					= "/load/:id/image/*";

////////////////////////////////////////////////////////////////
// Constructor
////////////////////////////////////////////////////////////////
/**
 * Creates an instance of a load.
 *
 * @constructor
 */
var UpstartLoad = function () {
	// Set the unqiue identifier to invalid
	this.m_oID = "";

    // Set the state to invalid
	this.m_nState = UPSTART_LOAD_STATE_INVALID;
	
	// Set the shipper and driver ids to invalid
	this.m_oShipperID = "";
	this.m_oDriverID = "";

	// Set the pickup information to empty
	this.m_oPickup = {};
	this.m_oPickup.address = new UpstartAddress();
	this.m_oPickup.window = new UpstartWindow();

	// Set the dropoff information to empty
	this.m_oDropoff = {};
	this.m_oDropoff.address = new UpstartAddress();
	this.m_oDropoff.window = new UpstartWindow();

	// Create an empty collection of units
	this.m_oContents = new UpstartContents();

	// Create an empty location to start
	this.m_oLocation = new UpstartLocation();

	// Create an empty log
	this.m_mapLog = {};
}

////////////////////////////////////////////////////////////////
// Static Methods
////////////////////////////////////////////////////////////////
/**
 * Creates an instance of a load from JSON.
 *
 * @param {function} fnCreate Function used to create the object
 * @param {object} oJSON Object in JSON format.
 * @param {number} nToValidate The validation flags to check
 * @param {object} oResult Receives the result in oResult[strResult];
 * @param {string} strResult Used to populate the result value in object;
 * @return {UpstartLoad} New load object or null.
 */
UpstartLoad.CreateLoadFromJSON = function (fnCreate, oJSON, nToValidate, oResult, strResult) {
	// Assign all refault parameters
	nToValidate = assignDefaultValue(nToValidate, -1);
	oResult = assignDefaultValue(oResult, null);
	strResult = assignDefaultValue(strResult, "");
	
	// Create a new load
	var oLoad = fnCreate();
	
	// Populate the load from the JSON, this call will populate
	// and check entries in the JSON for validity. It does not
	// check to see if a parameter is required or not. This is
	// handled in the following validate call.
	var nResult = oLoad.readJSON(oJSON);
	
	// Check to see if we succeeeded
	if (nResult == 0) {
		// Validate the the object
		nResult = oLoad.validate(nToValidate);
	}
	
	// Assign the result
	if (oResult != null && strResult != "") {
		oResult[strResult] = nResult;
	}
	
	// We should always be valid
	if (nResult != 0) oLoad = null;
	
	// Return the load
	return oLoad;
}

////////////////////////////////////////////////////////////////
// Identifier Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the identifier of the load.
 *
 * @return {object} Unique identifier for the object.
 */
UpstartLoad.prototype.getID = function () {
	return this.m_oID;
}

/**
 * Retrieves the identifier of the shipper.
 *
 * @return {object} Unique identifier for the shipper.
 */
UpstartLoad.prototype.getShipperID = function () {
	return this.m_oShipperID;
}

/**
 * Retrieves the identifier of the driver.
 *
 * @return {object} Unique identifier for the driver.
 */
UpstartLoad.prototype.getDriverID = function () {
	return this.m_oDriverID;
}

/**
 * Sets the unqiue identifier for the load.
 *
 * @param {object} oID New unqiue identifier for the load.
 * @return {boolean} True if successful, else false.
 */
UpstartLoad.prototype.setID = function (oID) {
	if (isIDValid(oID) == false) return false;

	this.m_oID = oID;
	return true;
}

/**
 * Sets the unqiue identifier for the shipper.
 *
 * @param {object} oID New unqiue identifier for the shipper.
 * @return {boolean} True if successful, else false.
 */
UpstartLoad.prototype.setShipperID = function (oID) {
	if (isIDValid(oID) == false) return false;
	
	this.m_oShipperID = oID;
	return true;
}

/**
 * Sets the unqiue identifier for the driver.
 *
 * @param {object} oID New unqiue identifier for the driver.
 * @return {boolean} True if successful, else false.
 */
UpstartLoad.prototype.setDriverID = function (oID) {
	if (isIDValid(oID) == false) return false;
	
	this.m_oDriverID = oID;
	return true;
}

////////////////////////////////////////////////////////////////
// State Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the state of the load.
 *
 * @return {number} Current state of the load.
 */
UpstartLoad.prototype.getState = function () {
    return this.m_nState;
}

/**
 * Sets the state for the load.
 *
 * @param {number} nState New state for the load.
 * @return {boolean} True if successful, else false.
 */
UpstartLoad.prototype.setState = function (nState) {
	this.m_nState = nState;
	return true;
}

////////////////////////////////////////////////////////////////
// Pickup and Dropoff Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the pickup information for the load. The pickup
 * information contains:
 *		"address" {UpstartAddress}
 *		"window" {UpstartWindow}
 *
 * @return {object} The pickup information.
 */
UpstartLoad.prototype.getPickup = function () {
	return this.m_oPickup;
}

/**
 * Retrieves the dropoff information for the load. The dropoff
 * information contains:
 *		"address" {UpstartAddress}
 *		"window" {UpstartWindow}
 *
 * @return {object} The dropoff information.
 */
UpstartLoad.prototype.getDropoff = function () {
	return this.m_oDropoff;
}

////////////////////////////////////////////////////////////////
// Unit Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the contents of the load.
 *
 * @return {UpstartContents} Contents of the load.
 */
UpstartLoad.prototype.getContents = function () {
	return this.m_oContents;
}

////////////////////////////////////////////////////////////////
// Location Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the current location of the load. Can also be the 
 * current location of the driver if the load has not yet been picked up.
 *
 * @return {UpstartLocation} Current location of the load.
 */
UpstartLoad.prototype.getLocation = function () {
	return this.m_oLocation;
}

////////////////////////////////////////////////////////////////
// Log Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the log for the load.
 *
 * @return {object} Map of log items.
 */
UpstartLoad.prototype.getLog = function () {
	return this.m_mapLog;
}

////////////////////////////////////////////////////////////////
// Validation Methods
////////////////////////////////////////////////////////////////
/**
 * Checks to see if the object is valid and returns the items
 * that are invalide.
 *
 * @param {number} nToValidate The validation flags to check
 * @return {number} Zero for success, else invalid items.
 */
UpstartLoad.prototype.validate = function (nToValidate) {
	// We always validate all if unspecified
	nToValidate = assignDefaultValue(nToValidate, -1);
	
	// Setup the invalid return falgs
	var nInvalid = 0;
	
	// Check the identifier
	if ((nToValidate & UPSTART_LOAD_ID) != 0) {
		if (this.m_oID == "") {
			nInvalid |= UPSTART_LOAD_ID;
		}
	}

	// Check the state
	if ((nToValidate & UPSTART_LOAD_STATE) != 0) {
		if (this.m_nState == UPSTART_LOAD_STATE_INVALID) {
			nInvalid |= UPSTART_LOAD_STATE;
		}
	}
	
	// Check the shipper identifier
	if ((nToValidate & UPSTART_LOAD_SHIPPER_ID) != 0) {
		if (this.m_oShipperID == "") {
			nInvalid |= UPSTART_LOAD_SHIPPER_ID;
		}
	}
	
	// Check the driver identifier
	if ((nToValidate & UPSTART_LOAD_DRIVER_ID) != 0) {
		// The driver id parameter must be valid if we are certain states
		// This is easier to do in reverse
		if (this.m_nState < UPSTART_LOAD_STATE_COMPLETED) { }
		else {
			if (this.m_oDriverID == "") {
				nInvalid |= UPSTART_LOAD_DRIVER_ID;
			}
		}
	}
	
	// Check the pickup address
	if ((nToValidate & UPSTART_LOAD_PICKUP_ADDRESS) != 0) {
		if (this.m_oPickup.address.validate() != 0) {
			nInvalid |= UPSTART_LOAD_PICKUP_ADDRESS;
		}
	}
	
	// Check the pickup window
	if ((nToValidate & UPSTART_LOAD_PICKUP_WINDOW) != 0) {
		if (this.m_oPickup.window.validate() != 0) {
			nInvalid |= UPSTART_LOAD_PICKUP_WINDOW;
		}
	}
	
	// Check the dropoff address
	if ((nToValidate & UPSTART_LOAD_DROPOFF_ADDRESS) != 0) {
		if (this.m_oDropoff.address.validate() != 0) {
			nInvalid |= UPSTART_LOAD_DROPOFF_ADDRESS;
		}
	}
	
	// Check the dropoff window
	if ((nToValidate & UPSTART_LOAD_DROPOFF_WINDOW) != 0) {
		if (this.m_oDropoff.window.validate() != 0) {
			nInvalid |= UPSTART_LOAD_DROPOFF_WINDOW;
		}
	}
	
	// We can also validate that the dropoff window occurs after the pickup window
	if (((nToValidate & UPSTART_LOAD_PICKUP_WINDOW) != 0) && ((nToValidate & UPSTART_LOAD_DROPOFF_WINDOW) != 0)) {
		if (this.m_oDropoff.window.getBegin() <= this.m_oPickup.window.getEnd() ) {
			nInvalid |= (UPSTART_LOAD_PICKUP_WINDOW|UPSTART_LOAD_DROPOFF_WINDOW);
		}
	}
	
	// Check the contents
	if ((nToValidate & UPSTART_LOAD_CONTENTS) != 0) {
		if (this.m_oContents.validate() != 0) {
			nInvalid |= UPSTART_LOAD_CONTENTS;
		}
	}

	// Check the location
	if ((nToValidate & UPSTART_LOAD_LOCATION) != 0) {
		// The location parameter must be valid if we are in a moving state.
		if (this.m_nState >= UPSTART_LOAD_STATE_GET_MOVING_MIN &&
			this.m_nState <= UPSTART_LOAD_STATE_GET_MOVING_MAX) {
			if (this.m_oLocation.validate() != 0) {
				nInvalid |= UPSTART_LOAD_LOCATION;
			}
		}
	}

	// Log data is always valid and is never checked
	
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
UpstartLoad.prototype.writeJSON = function (oJSON, nToWrite) {
	// We always write all if unspecified
	nToWrite = assignDefaultValue(nToWrite, -1);
	
	// Copy the identifier property if requested
	if ((nToWrite & UPSTART_LOAD_ID) != 0) oJSON["_id"] = this.m_oID;

	// Copy the state property if requested
	if ((nToWrite & UPSTART_LOAD_STATE) != 0) oJSON["state"] = this.m_nState;
	
	// Copy the shipper identifier property if requested
	if ((nToWrite & UPSTART_LOAD_SHIPPER_ID) != 0) oJSON["shipperid"] = this.m_oShipperID;
	
	// Copy the driver identifier property if requested
	if ((nToWrite & UPSTART_LOAD_DRIVER_ID) != 0) {
		// No not write the driver id unless we are in a valide state
		// This is easier to do in reverse
		if (this.m_nState >= UPSTART_LOAD_STATE_COMPLETED) {
			oJSON["driverid"] = this.m_oDriverID;
		}
	}
	
	// Copy the pickup properties if requested
	if ((nToWrite & (UPSTART_LOAD_PICKUP_ADDRESS | UPSTART_LOAD_PICKUP_WINDOW)) != 0) {
		oJSON["pickup"] = {};

		if ((nToWrite & UPSTART_LOAD_PICKUP_ADDRESS) != 0) oJSON["pickup"].address = this.m_oPickup.address.writeJSON({});
		if ((nToWrite & UPSTART_LOAD_PICKUP_WINDOW) != 0) oJSON["pickup"].window = this.m_oPickup.window.writeJSON({});
	}
	
	// Copy the pickup properties if requested
	if ((nToWrite & (UPSTART_LOAD_DROPOFF_ADDRESS | UPSTART_LOAD_DROPOFF_WINDOW)) != 0) {
		oJSON["dropoff"] = {};

		if ((nToWrite & UPSTART_LOAD_DROPOFF_ADDRESS) != 0) oJSON["dropoff"].address = this.m_oDropoff.address.writeJSON({});
		if ((nToWrite & UPSTART_LOAD_DROPOFF_WINDOW) != 0) oJSON["dropoff"].window = this.m_oDropoff.window.writeJSON({});
	}
	
	// Copy the contents properties if requested
	if ((nToWrite & UPSTART_LOAD_CONTENTS) != 0) {
		oJSON["contents"] = this.m_oContents.writeJSON({});
	}
	
	// Copy the location property if requested
	if ((nToWrite & UPSTART_LOAD_LOCATION) != 0) {
		oJSON["location"] = this.m_oLocation.writeJSON({});
	}
	
	// Copy the log property if requested
	if ((nToWrite & UPSTART_LOAD_LOG) != 0) {
		// We do not write an empty log
		var nLogCount = 0;
		for (var strKey in this.m_mapLog) nLogCount += 1;
		
		if(nLogCount > 0) oJSON["log"] = this.m_mapLog;
	}

	return oJSON;
}

/**
 * Populates the object from a cleanly formatted JSON reprsentation.
 *
 * @param {object} oJSON Object in JSON format.
 * @return {number} Zero for success, else invalid items.
 */
UpstartLoad.prototype.readJSON = function (oJSON) {
	// Setup the invalid return falgs
	var nInvalid = 0;
	
	// Check for the identifier
	if ("_id" in oJSON) {
		if (!this.setID(oJSON._id)) {
			nInvalid |= UPSTART_LOAD_ID;
		}
	}

	// Check for a state
	if ("state" in oJSON) {
		if (!this.setState(oJSON.state)) {
			nInvalid |= UPSTART_LOAD_STATE;
		}
	}
	
	// Check for the shipper identifier
	if ("shipperid" in oJSON) {
		if (!this.setShipperID(oJSON.shipperid)) {
			nInvalid |= UPSTART_LOAD_SHIPPER_ID;
		}
	}
	
	// Check for the driver identifier
	if ("driverid" in oJSON) {
		if (!this.setDriverID(oJSON.driverid)) {
			nInvalid |= UPSTART_LOAD_DRIVER_ID;
		}
	}
	
	// Check for pickup information
	if ("pickup" in oJSON) {
		var oPickupJSON = oJSON.pickup;
		
		// Check for address information
		if ("address" in oPickupJSON) {
			if (this.m_oPickup.address.readJSON(oPickupJSON.address) != 0) {
				nInvalid |= UPSTART_LOAD_PICKUP_ADDRESS;
			}
		}

		// Check for window information
		if ("window" in oPickupJSON) {
			if (this.m_oPickup.window.readJSON(oPickupJSON.window) != 0) {
				nInvalid |= UPSTART_LOAD_PICKUP_WINDOW;
			}
		}
	}
	
	// Check for dropoff information
	if ("dropoff" in oJSON) {
		var oDropoffJSON = oJSON.dropoff;
		
		// Check for address information
		if ("address" in oDropoffJSON) {
			if (this.m_oDropoff.address.readJSON(oDropoffJSON.address) != 0) {
				nInvalid |= UPSTART_LOAD_DROPOFF_ADDRESS;
			}
		}
		
		// Check for window information
		if ("window" in oDropoffJSON) {
			if (this.m_oDropoff.window.readJSON(oDropoffJSON.window) != 0) {
				nInvalid |= UPSTART_LOAD_DROPOFF_WINDOW;
			}
		}
	}
	
	// Check for contents
	if ("contents" in oJSON) {
		if (this.m_oContents.readJSON(oJSON.contents) != 0) {
			nInvalid |= UPSTART_LOAD_CONTENTS;
		}
	}
	
	// Check for a location
	if ("location" in oJSON) {
		if (this.m_oLocation.readJSON(oJSON.location) != 0) {
			nInvalid |= UPSTART_LOAD_LOCATION;
		}
	}
	
	// Check for the log
	if ("log" in oJSON) {
		// Replace the log entries
		for (var strKey in oJSON.log) {
			this.m_mapLog[strKey] = oJSON.log[strKey];
		}

		// Notice that we never fail at this
	}
	
	return nInvalid;
}