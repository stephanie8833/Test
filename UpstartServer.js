/********************************************************************************
 *  Overview:   The file contains the server module for importing into node.js.
 *              
 * Created:     February 10, 2016
 * Creator:     Manuel Perez
 ********************************************************************************/

////////////////////////////////////////////////////////////////
// Requirements
////////////////////////////////////////////////////////////////
var g_oFS			= require("fs");

var g_oNodeMailer	= require('nodemailer');
var g_oEJS			= require('ejs');
var g_oBodyParser	= require('body-parser');
var g_oUUID			= require('uuid');
var g_oBCrypt		= require('bcrypt-nodejs');

var g_oConfig		= require("../config");

////////////////////////////////////////////////////////////////
// Definitions
////////////////////////////////////////////////////////////////
// Route Definitions Linked to a UI
var UPSTART_ACCOUNT_ROUTE_VERIFY_UI = "/account/verify/:code";

////////////////////////////////////////////////////////////////
// Scripts
////////////////////////////////////////////////////////////////
// Include Global Scripts
eval(g_oFS.readFileSync("./modules/UpstartGlobals.js", "utf8"));
eval(g_oFS.readFileSync("./modules/UpstartGlobalsServer.js", "utf8"));

// Include general object scripts
eval(g_oFS.readFileSync("./modules/UpstartLocation.js", "utf8"));
eval(g_oFS.readFileSync("./modules/UpstartAddress.js", "utf8"));
eval(g_oFS.readFileSync("./modules/UpstartContainer.js", "utf8"));
eval(g_oFS.readFileSync("./modules/UpstartContainerEnclosed.js", "utf8"));
eval(g_oFS.readFileSync("./modules/UpstartVehicle.js", "utf8"));
eval(g_oFS.readFileSync("./modules/UpstartShipper.js", "utf8"));
eval(g_oFS.readFileSync("./modules/UpstartDriver.js", "utf8"));
eval(g_oFS.readFileSync("./modules/UpstartUnit.js", "utf8"));
eval(g_oFS.readFileSync("./modules/UpstartContents.js", "utf8"));
eval(g_oFS.readFileSync("./modules/UpstartWindow.js", "utf8"));

// Include account scripts
eval(g_oFS.readFileSync("./modules/UpstartAccount.js", "utf8"));
eval(g_oFS.readFileSync("./modules/UpstartAccountServer.js", "utf8"));

// Include load scripts
eval(g_oFS.readFileSync("./modules/UpstartLoad.js", "utf8"));
eval(g_oFS.readFileSync("./modules/UpstartLoadServer.js", "utf8"));

////////////////////////////////////////////////////////////////
// Routing UI Functions
////////////////////////////////////////////////////////////////
/**
 * Same as onVerifyAccount, except the result will display 
 * a user interface.
 *
 * @param {object} oRequest HTTP request object.
 * @param {object} oResponse HTTP response object.
 */
function onVerifyAccountUI(oRequest, oResponse) {
	// Get the code identifier
	var oCode = oRequest.params.code;
	
	// Get the accounts collection
	var oAccountsCollection = oRequest.m_oDB.get(g_oConfig.UPSTART_COLLECTION_ACCOUNTS);
	
	// Lookup the account from the code
	oAccountsCollection.findOne({ code: oCode }, { fields: ["_id"] }, function (oError, oDocument) {
		if (oError) {
			// Render the failed page
			oResponse.render(g_oConfig.UPSTART_PAGE_ACCOUNT_VERIFICATION_FAILURE, null);
		}
		else {
			if (oDocument == null) {
				// Render the failed page
				oResponse.render(g_oConfig.UPSTART_PAGE_ACCOUNT_VERIFICATION_FAILURE, null);
			}
			else {
				// We were able to find our id, so assign it as a parameter
				oRequest.params.id = oDocument._id;
				
				// Now we setup a callback, since we do not want a JSON response, but will rather display a web page
				var oCallback = new UpstartResponseCallback(function (strResult) {
					// Get the result
					var nResult = JSON.parse(strResult)._result;
					
					// Any error is treated as a page missing
					if (nResult != 0) {
						// Render the failed page
						oResponse.render(g_oConfig.UPSTART_PAGE_ACCOUNT_VERIFICATION_FAILURE, null);
					}
					else {
						// Render the success page
						oResponse.render(g_oConfig.UPSTART_PAGE_ACCOUNT_VERIFICATION_SUCCESS, null);
					}
				});
				
				// Now we call the base method
				onVerifyAccount(oRequest, oCallback);
			}
		}
	});
}

////////////////////////////////////////////////////////////////
// Functions
////////////////////////////////////////////////////////////////
/**
 * Performs sever setup by setting up collection paraemters in
 * the datebase and adds new routes to the Express application.
 *
 * @param {Express} oApp Express application.
 * @param {Monk} oDB Express database
 */
function setup(oApp, oDB) {
	////////////////////////////////////////////////////////////////
	// Setup the collections
	////////////////////////////////////////////////////////////////
	// Get the collections
	var oAccountsCollection = oDB.get(g_oConfig.UPSTART_COLLECTION_ACCOUNTS);
	var oLoadsCollection = oDB.get(g_oConfig.UPSTART_COLLECTION_LOADS);
	var oImagesCollection = oDB.get(g_oConfig.UPSTART_COLLECTION_IMAGES);
	
	// Make sure that the email is unique in accounts
	oAccountsCollection.index('email', { unique: true });
	
	// Make sure that the filename is unique in images
	oImagesCollection.index('file', { unique: true });

	////////////////////////////////////////////////////////////////
	// Account Routes
	////////////////////////////////////////////////////////////////
	// Add the routes to access accounts
	oApp.get(UPSTART_ACCOUNT_ROUTE_GET_ALL, onNoCache, onGetAllAccounts);
	oApp.get(UPSTART_ACCOUNT_ROUTE_GET_ALL_CHILDREN, onNoCache, onGetAllChildAccounts);
	oApp.get(UPSTART_ACCOUNT_ROUTE_GET, onNoCache, onGetAccount);
	
	// Add route to create an account
	oApp.post(UPSTART_ACCOUNT_ROUTE_CREATE, onNoCache, g_oBodyParser.json(), onCreateAccount);
	
	// Add routes to manage account status
	oApp.put(UPSTART_ACCOUNT_ROUTE_VERIFY, onNoCache, onVerifyAccount);
	oApp.put(UPSTART_ACCOUNT_ROUTE_ACTIVATE, onNoCache, onActivateAccount);
	oApp.put(UPSTART_ACCOUNT_ROUTE_DEACTIVATE, onNoCache, onDeactivateAccount);
	oApp.put(UPSTART_ACCOUNT_ROUTE_REACTIVATE, onNoCache, onReactivateAccount);
	oApp.put(UPSTART_ACCOUNT_ROUTE_SUSPEND, onNoCache, onSuspendAccount);
	oApp.put(UPSTART_ACCOUNT_ROUTE_UNSUSPEND, onNoCache, onUnsuspendAccount);
	
	////////////////////////////////////////////////////////////////
	// Load Routes
	////////////////////////////////////////////////////////////////
	// Add the routes to access loads
	oApp.get(UPSTART_LOAD_ROUTE_GET_ALL, onNoCache, onGetAllLoads);
	oApp.get(UPSTART_LOAD_ROUTE_GET_ALL_SHIPPER, onNoCache, onGetAllShipperLoads);
	oApp.get(UPSTART_LOAD_ROUTE_GET_ALL_DRIVER, onNoCache, onGetAllDriverLoads);
	oApp.get(UPSTART_LOAD_ROUTE_GET, onNoCache, onGetLoad);
	
	// Add route to create a load
	oApp.post(UPSTART_LOAD_ROUTE_CREATE, onNoCache, g_oBodyParser.json(), onCreateLoad);
	
	// Add routes to manage load state transitions
	oApp.put(UPSTART_LOAD_ROUTE_POST, onNoCache, onPostLoad);
	oApp.put(UPSTART_LOAD_ROUTE_ACCEPT, onNoCache, onAcceptLoad);
	oApp.put(UPSTART_LOAD_ROUTE_COMPLETE, onNoCache, onCompleteLoad);
	oApp.put(UPSTART_LOAD_ROUTE_CANCEL, onNoCache, onCancelLoad);
	
	oApp.put(UPSTART_LOAD_ROUTE_PICKUP_DOCK, onNoCache, onDockLoadAtPickup);
	oApp.put(UPSTART_LOAD_ROUTE_PICKUP_UPLOAD, onNoCache, g_oBodyParser.json({ limit: g_oConfig.UPSTART_SERVER_IMAGE_SIZE_LIMIT }), onUploadLoadAtPickup);
	oApp.put(UPSTART_LOAD_ROUTE_PICKUP_ACCEPT, onNoCache, onAcceptLoadAtPickup);
	oApp.put(UPSTART_LOAD_ROUTE_PICKUP_REJECT, onNoCache, onRejectLoadAtPickup);
	
	oApp.put(UPSTART_LOAD_ROUTE_DROPOFF_DOCK, onNoCache, onDockLoadAtDropoff);
	oApp.put(UPSTART_LOAD_ROUTE_DROPOFF_UPLOAD, onNoCache, g_oBodyParser.json({ limit: g_oConfig.UPSTART_SERVER_IMAGE_SIZE_LIMIT }), onUploadLoadAtDropoff);
	oApp.put(UPSTART_LOAD_ROUTE_DROPOFF_ACCEPT, onNoCache, onAcceptLoadAtDropoff);
	oApp.put(UPSTART_LOAD_ROUTE_DROPOFF_REJECT, onNoCache, onRejectLoadAtDropoff);
	
	oApp.put(UPSTART_LOAD_ROUTE_UPDATE_LOCATION, onNoCache, g_oBodyParser.json(), onUpdateLoadLocation);
	
	////////////////////////////////////////////////////////////////
	// Image Routes
	////////////////////////////////////////////////////////////////
	// Add image access route
	oApp.get(UPSTART_LOAD_ROUTE_IMAGE, onNoCache, onRenderImage);
	
	////////////////////////////////////////////////////////////////
	// UI Routes
	// NOTE: These are gets because they are treated as links)
	////////////////////////////////////////////////////////////////
	oApp.get(UPSTART_ACCOUNT_ROUTE_VERIFY_UI, onNoCache, onVerifyAccountUI);
}

////////////////////////////////////////////////////////////////
// Export Functions
////////////////////////////////////////////////////////////////
exports.setup = setup;

// Exposed for testing
exports.createAccount = UpstartAccountServer.CreateAccountFromJSON; 
exports.createLoad = UpstartLoadServer.CreateLoadFromJSON;
