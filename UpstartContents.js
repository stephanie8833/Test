/********************************************************************************
 *  Overview:   The file contains the Upstart Unit Contents object. This 
 *				object manages the contents of a load.
 *              
 * Created:     Februray 9, 2016
 * Creator:     Manuel Perez
 ********************************************************************************/

////////////////////////////////////////////////////////////////
// Definitions
////////////////////////////////////////////////////////////////
// Contents Value Flag Definitions
var UPSTART_CONTENTS_CONTROL_FLAGS			= 0x00000001;
var UPSTART_CONTENTS_UINTS					= 0x00000002;

// Content Control Flags
var UPSTART_CONTENTS_IN_CONTAINER			= 0x00010000;	// The contents are stored in a supplied container (trailer)

var UPSTART_CONTENTS_CONTROL_FLAGS_ALL		= UPSTART_CONTENTS_IN_CONTAINER;
var UPSTART_CONTENTS_CONTROL_FLAGS_INVALID	= ~UPSTART_CONTENTS_CONTROL_FLAGS_ALL;

////////////////////////////////////////////////////////////////
// Constructor
////////////////////////////////////////////////////////////////
/**
 * Creates an instance of a contents object.
 *
 * @constructor
 */
var UpstartContents = function () {
	// Create an array of empty contents
	this.m_arrContents = [];
}

////////////////////////////////////////////////////////////////
// Control Flag Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the control flags of the contents.
 *
 * @param {boolean} bFull - True to include the unit control flags, elase false.
 * @return {number} Control flags of the contents (see above).
 */
UpstartContents.prototype.getControlFlags = function (bFull) {
	// We always write all if unspecified
	bFull = assignDefaultValue(bFull, true);

	// Set the base control flag to our own
	var nControlFlags = this.m_nControlFlags;
	
	// Check to see if we should include the unit control flags
	if (bFull) {
		// Iterate through all of our units
		for (var i = 0; i < m_arrContents.length; i++) {
			nControlFlags |= m_arrContents[i].units.getControlFlags();
		}
		
		// For a units object we ignore the stackable and upright flags
		nControlFlags &= ~UPSTART_CONTENTS_IS_STACKABLE;
		nControlFlags &= ~UPSTART_CONTENTS_REQUIRES_UPRIGHT;
	}
	
	return fControlFlags;
}

/**
 * Sets the control flags for the contents.
 *
 * @param {number} nControlFlags New control flags.
 * @return {boolean} true if successful, else false.
 */
UpstartContents.prototype.setControlFlags = function (nControlFlags) {
	// Must be a combination of the available flags
	if ((nControlFlags & UPSTART_CONTENTS_CONTROL_FLAGS_INVALID) != 0) return false;
	
	this.m_nControlFlags = nControlFlags;
	return true;
}

////////////////////////////////////////////////////////////////
// Dimensions and Weight Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the total weight of the content in pounds.
 *
 * @return {number} Total weight of the contents in pounds.
 */
UpstartContents.prototype.getTotalWeight = function () {
	// Start with a weight of zero
	var nWeight = 0;
	
	// Iterate through all of our units and sum the weights
	for (var i = 0; i < m_arrContents.length; i++) {
		nWeight += m_arrContents[i].quantity * m_arrContents[i].getWeight();
	}
		
	return nWeight;
}

////////////////////////////////////////////////////////////////
// Unit Methods
////////////////////////////////////////////////////////////////
/**
 * Retrieves the number of contents.
 *
 * @return {number} Number of contents.
 */
UpstartContents.prototype.getNumberOfContents = function () {
	return this.m_arrContents.length;
}

/**
 * Retrieves the unit at a specified index. 
 * 
 * @param {number} nIndex Unit index
 * @return {UpstartUnit} Unit information.
 */
UpstartContents.prototype.getUnitAt = function (nIndex) {
	// Validate that the index is within range
	if (nIndex < 0) return null;
	if (nIndex >= this.m_arrContents.length) return null;
	
	return this.m_arrContents[nIndex].unit;
}

/**
 * Retrieves the quanity at a specified index. 
 * 
 * @param {number} nIndex Unit index
 * @return {UpstartUnit} Unit information.
 */
UpstartContents.prototype.getQuantityAt = function (nIndex) {
	// Validate that the index is within range
	if (nIndex < 0) return null;
	if (nIndex >= this.m_arrContents.length) return null;
	
	return this.m_arrContents[nIndex].quantity;
}

/**
 * Adds new units to the contents..
 * 
 * @param {UpstartUnit} oUnit New unit to add.
 * @param {number} nQuantity Number of units to add.
 * @return {boolean} True if successful, else false.
 */
UpstartContents.prototype.addUnits = function (oUnit, nQuantity) {
	// Fill in the default parameters
	nQuantity = assignDefaultValue(nQuantity, 1);
	
	// We will only be adding valud units
	if (oUnit.validate() != 0) return false;
	
	// The quantity must be at least one
	if (nQuantity < 1) return false;
	
	// We need to search to see if this unit already exists
	for (var i = 0; i < this.m_arrContents.length; i++) {
		if (this.m_arrContents[i].unit.isEqual(oUnit)) {
			// Increment our quantity and return
			this.m_arrContents[i].quantity += nQuantity;
			return true;
		}
	}
	
	// Add the new unit and return
	this.m_arrContents.push({ unit: oUnit, quantity: nQuantity });
	
	return true;
}

/**
 * Removes units from the contents..
 * 
 * @param {UpstartUnit} oUnit Unit to remove.
 * @param {number} nQuantity Number of units to remove.
 * @return {boolean} True if successful, else false.
 */
UpstartContents.prototype.RemoveUnits = function (oUnit, nQuantity) {
	// Search for the unit and remove it
	for (var i = 0; i < m_arrContents.length; i++) {
		if (m_arrContents[i].unit.isEqual(oUnit)) {
			return RemoveUnitsAt(i, nQuantity);
		}
	}
	
	return true;
}

/**
 * Removes units from a specified index
 * 
 * @param {number} nIndex Index of the units to remove.
 * @param {number} nQuantity Number of units to remove.
 * @return {boolean} True if successful, else false.
 */
UpstartContents.prototype.RemoveUnitsAt = function (nIndex, nQuantity) {
	// Fill in the default parameters
	nQuantity = assignDefaultValue(nQuantity, -1);
	
	// Validate that the index is within range
	if (nIndex < 0) return false;
	if (nIndex >= this.m_arrContents.length) return false;
	
	// Adjust our quantity
	if (nQuantity == -1) this.m_arrContents[nIndex].quantity = 0;
	else this.m_arrContents[nIndex].quantity -= nQuantity;
	
	// Remove the unit entirely if our quanity is below zero
	if (nQuantity.this.m_arrContents[nIndex].quantity <= 0) {
		// Remove the unit from our array
		this.m_arrContents.splice(nIndex, 1);
	}
	
	return true;
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
UpstartContents.prototype.validate = function (nToValidate) {
	// We always validate all if unspecified
	nToValidate = assignDefaultValue(nToValidate, -1);
	
	// Setup the invalid return flags
	var nInvalid = 0;
	
	// Check the control flags
	if ((nToValidate & UPSTART_CONTENTS_CONTROL_FLAGS) != 0) {
		if ((this.m_nControlFlags & UPSTART_CONTENTS_CONTROL_FLAGS_INVALID) != 0) {
			nInvalid |= UPSTART_CONTENTS_CONTROL_FLAGS;
		}
	}
	
	if ((nToValidate & UPSTART_CONTENTS_UINTS) != 0) {
		// We must have at least one unit type
		if (this.m_arrContents.length != 0) {
			// All units must be valid
			for (var i = 0; i < this.m_arrContents.length; i++) {
				if (this.m_arrContents[i].unit.validate() != 0) {
					nInvalid |= UPSTART_CONTENTS_UINTS;
					break;
				}
			}
		}
		else {
			nInvalid |= UPSTART_CONTENTS_UINTS
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
UpstartContents.prototype.writeJSON = function (oJSON, nToWrite) {
	// We always write all if unspecified
	nToWrite = assignDefaultValue(nToWrite, -1);
	
	// Copy the requested properties
	if ((nToWrite & UPSTART_CONTENTS_CONTROL_FLAGS) != 0) {
		oJSON["flags"] = this.m_nControlFlags;
	}

	// Copy the units properties if requested
	if ((nToWrite & UPSTART_CONTENTS_UINTS) != 0) {
		// Create an array for the units
		oJSON["units"] = [];
		
		// Add all of the units
		for (var i = 0; i < this.m_arrContents.length; i++) {
			// Create a unit type with unit information and quantity
			var oUnit = {};
			oUnit["unit"] = this.m_arrContents[i].unit.writeJSON({});
			oUnit["quantity"] = this.m_arrContents[i].quantity;
			
			// Push the type
			oJSON.units.push(oUnit);
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
UpstartContents.prototype.readJSON = function (oJSON) {
	// Setup the invalid return flags
	var nInvalid = 0;
	
	// Check for the control flags
	if ("flags" in oJSON) {
		if (!this.setControlFlags(oJSON.flags)) {
			nInvalid |= UPSTART_CONTENTS_CONTROL_FLAGS;
		}
	}

	// Check for units
	if ("units" in oJSON) {
		// Clear our existing collection
		this.m_arrContents = [];
		
		// Add items for the new collection
		for (var i = 0; i < oJSON.units.length; i++) {
			// Get the next entry
			var oNextEntry = oJSON.units[i];
			
			if (("unit" in oNextEntry) && ("quantity" in oNextEntry)) {
				// Create a new unit
				var oUnit = new UpstartUnit();
				
				// Convert from JSON
				if (oUnit.readJSON(oNextEntry.unit) == 0) {
					// Add the unit to our collection
					if (!this.addUnits(oUnit, oNextEntry.quantity)) {
						nInvalid |= UPSTART_CONTENTS_UINTS;
					}
				}
				else {
					nInvalid |= UPSTART_CONTENTS_UINTS;
				}
			}
			else {
				nInvalid |= UPSTART_CONTENTS_UINTS;
			}
		}
		
		// Check to see if we failed
		if ((nInvalid & UPSTART_CONTENTS_UINTS) != 0) {
			// Clear our array
			this.m_arrContents = [];
		}
	}
	
	return nInvalid;
}