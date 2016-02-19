/********************************************************************************
 * Overview:   	This file contains functions to get geoLocation, 
 *              calculate distance and create bounding box 
 *				        
 * Created:     Feb.10, 2016
 * Creator:     Stephanie Zeng
 ********************************************************************************/
 
/**
 * Creating Queue to buffer the API access requests.                                                      
 *                                    
 * @param {string}   strStreetID Street address input.
 * @param {string}   strCityID City input.
 * @param {string}   strStateID State input. 
 * @param {string}   strAttempt Time to attempt retry.
 * @param {number}   nZipCodeID Zipcode input.
 * @param {function} fnCallback Callback function.
 * @param {object}   oRetries Retry times.                                                           
 */
 
function getGeoLocationUsingQ (strStreetID,strCityID,strStateID,nZipCodeID,fnCallback, strAttempt, oRetries){
	
	//Set queue to static.
	if(typeof getGeoLocationUsingQ.queue == "undefined") {
		getGeoLocationUsingQ.queue = [];
	}

    //Push the input for street address into queue.
	getGeoLocationUsingQ.queue.push({strStreetID,strCityID,strStateID,nZipCodeID,fnCallback, strAttempt, oRetries});

    //Call function dequeue.
	if (!dequeue.goingOn) {
		dequeue();
	}
}


/**
 * Checking if Queue is empty.                                                      
 *                                    
 * @param {function} fnCallback To store the result.
 *
 * @return {function} fnCallback Return the status of queue.                                                            
 */

function isQueueEmpty(fnCallback){
	if (getGeoLocationUsingQ.queue.length!=0){
		fnCallback(false);
	}else{
		fnCallback(true);
	}
}


/**
 * Clean up the Queue and call geoLocation function.                                                      
 *         
 * @param {function} fnCallback The status of queue.
 *                                                         
 */

function dequeue() {
    //Set dequeue.goingOn to static.
	if(typeof dequeue.goingOn == "undefined") {
		dequeue.goingOn = false;
	}

	isQueueEmpty(function(isEmpty){
		if(!isEmpty){
		    dequeue.goingOn = true;

            //Pass the elements in queue[0] to geoLocation function.
			getGeoLocation(getGeoLocationUsingQ.queue[0].strStreetID,getGeoLocationUsingQ.queue[0].strCityID,getGeoLocationUsingQ.queue[0].strStateID,
			getGeoLocationUsingQ.queue[0].nZipCodeID,getGeoLocationUsingQ.queue[0].fnCallback,getGeoLocationUsingQ.queue[0].strAttempt,
			getGeoLocationUsingQ.queue[0].oRetries);
		}
	});
}



var UPSTART_INVALID_GEO = 0;

/**
 * Find the latitudes and longtitudes for the target point.                                                         
 *                                    
 * @param {string}   strStreet Street address input.
 * @param {string}   strCity City input.
 * @param {string}   strState State input. 
 * @param {string}   strAttempt Time to attempt retry.
 * @param {number}   nZipCode Zipcode input.
 * @param {function} fnCallback Callback function.
 * @param {object}   oRetries Retry times.

 * @return {function} fnCallback Store latitudes and longtitudes for the target point.                                                            
 */
function getGeoLocation(strStreet,strCity, strState, nZipCode, fnCallback, strAttempt, oRetries) {
	
	if(typeof oRetries == "undefined") oRetries = {n: 10};
	if(strAttempt==null) {}
	
	var geocoder = new google.maps.Geocoder(); 
	geocoder.geocode({'address': strStreet + strCity + strState + nZipCode}, function(results, status) {  

		if (status === google.maps.GeocoderStatus.OK) {
			
			// Status: ROOFTOP, RANGE_INTERPOLATED, GEOMETRIC_CENTER, APPROXIMATE.
			// Check if Google map read the right address.
			var validAddress = checkAddress(results,strCity, strState, nZipCode);			
			
			if(validAddress){
				var nLatitude  = results[0].geometry.location.lat();
				var nLongitude = results[0].geometry.location.lng();
				
			}
			
            //Dequeue.
			getGeoLocationUsingQ.queue.shift();
			isQueueEmpty(function(isEmpty){
				if(!isEmpty){
					dequeue();
				}else{
					dequeue.goingOn = false;
				}
			});
			fnCallback(nLatitude,nLongitude);
		} 
		
		//Indicates that the geocode was successful but returned no results. 
		//This may occur if the geocoder was passed a non-existent address.
		else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
			//console.log("ZERO_RESULTS");
			fnCallback(UPSTART_INVALID_GEO,UPSTART_INVALID_GEO);
		} 
		
		//Indicates that you are over your quota.
		else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
			oRetries.n -= 1;
			if(oRetries.n==0) {
				fnCallback(UPSTART_INVALID_GEO,UPSTART_INVALID_GEO);
			}
			else {
				setTimeout( function() {getGeoLocation(strStreet,strCity, strState, nZipCode, fnCallback, null, oRetries);}, 1000);
			}
		} 
		
		//Indicates that your request was denied.
		else if (status === google.maps.GeocoderStatus.REQUEST_DENIED) {
			fnCallback(UPSTART_INVALID_GEO,UPSTART_INVALID_GEO);
		} 
		
		//Generally indicates that the query (address, components or latlng) is missing.
		else if (status === google.maps.GeocoderStatus.INVALID_REQUEST){
			fnCallback(UPSTART_INVALID_GEO,UPSTART_INVALID_GEO);
		} 
		
		//Indicates that the request could not be processed due to a server error. 
		//The request may succeed if you try again.
		else if (status === google.maps.GeocoderStatus.UNKNOWN_ERROR){
			fnCallback(UPSTART_INVALID_GEO,UPSTART_INVALID_GEO);
		}
	});
}

/**
 * Check if Google Map API return the right address.                                                         
 *   
 * @param {array}    results Address recognized by Google Map.
 * @param {string}   strCity City input.
 * @param {string}   strState State input. 
 * @param {number}   nZipCode Zipcode input.
 *
 * @return {function} fnCallback Callback for latitudes and longtitudes.                                                            
 */
function checkAddress (results,strCity, strState, nZipCode){

	for(var i = 0; i < results[0].address_components.length;i++){
		
		if(results[0].address_components[i].short_name == nZipCode){
			var bZipCodeCheck = 1; 
		}
		if(results[0].address_components[i].short_name == strCity){
			var bCityCheck = 1; 
		}
		if(results[0].address_components[i].short_name == strState){
			var bStateCheck = 1; 
		}
		
	}
	
	if (/*bZipCodeCheck &&*/ bCityCheck && bStateCheck ){
		return true;
	} else{
		return false;
	}
}
	   
 var UPSTART_DISTANCE_UNIT_MILES              = 0;        
 var UPSTART_DISTANCE_UNIT_KM                 = 1;
 var UPSTART_DISTANCE_UNIT_STATUTE_MILES      = 2;
 
 var UPSTART_STATUTE_MILES_TO_NAUTICAL_MILE   = 0.8684;
 var UPSTART_STATUTE_MILES_TO_KILOMETERS      = 1.609344;
 
 
/**  
 *    Get the distance for two points.                                                  
 *                                                        
 *    @param {number} nlat1, nlon1 Latitude and Longitude of point 1 (in decimal degrees).  
 *    @param {number} nlat2, nlon2 Latitude and Longitude of point 2 (in decimal degrees).
 *    @param {number} nUnit        The unit you desire for results                             
 *           where: 'M' is statute miles                         
 *                  'K' is kilometers                                  
 *                  'N' is nautical miles (default).    
 *    Resource:https://www.geodatasource.com/developers/javascript                            
 */
function getDistance(nLon1,nLat1, nLon2, nLat2,  nUnits) {

	if(typeof nUnits == "undefined"){
		nUnits = UPSTART_DISTANCE_UNIT_MILES;
	} 

	var nRadlat1  = Math.PI * nLat1/180;
	var nRradlat2 = Math.PI * nLat2/180;
	
	var nTheta    = nLon1-nLon2;
	var nRadtheta = Math.PI * nTheta/180;
	var nDistance = Math.sin(nRadlat1) * Math.sin(nRradlat2) + Math.cos(nRadlat1) * Math.cos(nRradlat2) * Math.cos(nRadtheta);
	nDistance     = Math.acos(nDistance);
	nDistance     = nDistance * 180/Math.PI;
	nDistance     = nDistance * 60 * 1.1515;

	// Convert to the proper coordinate system.
	switch(nUnits) {
		case UPSTART_DISTANCE_UNIT_MILES:{
			nDistance = nDistance * UPSTART_STATUTE_MILES_TO_NAUTICAL_MILE;
		} break;
		case UPSTART_DISTANCE_UNIT_KM:{
			nDistance = nDistance * UPSTART_STATUTE_MILES_TO_KILOMETERS;
		} break;
		case UPSTART_DISTANCE_UNIT_STATUTE_MILES:{
			nDistance = nDistance;
		}
	}
	
    // Return the distance result.
	console.log("real distance is: " + nDistance);
	return nDistance;
	
}


var UPSTART_NAUTICAL_MILE_TO_STATUTE_MILES = 1.151;
var UPSTART_KM_TO_STATUTE_MILES = 0.62137;

/**
 *  Creating bounding box for the location.  
 *                                                
 *  @param {number} nLat Latitude of driver's location.     
 *  @param {number} nLng Longtitude of driver's location. 
 *  @param {number} nRange Ideal range for two points.           
 *
 *  @return {array} The array contains [nTopLeftLat, nTopLeftLng, nBottomRightLat, nBottomRightLng].  
 */

var R = 3959; //unit:miles

//formula from:Gall-Peters projection:https://en.wikipedia.org/wiki/Gall%E2%80%93Peters_projection


/**
 *  Converting geographic coordinate system to Catism coordinate system.  
 *                                                
 *  @param {number} nLat Latitude of driver's location.     
 *  @param {number} nLng Longtitude of driver's location. 
 *  @param {number} nRange Ideal range for two points.           
 *
 *  @return {array} The array contains [nTopLeftLat, nTopLeftLng, nBottomRightLat, nBottomRightLng].  
 */
function geoGraphicToCartism(nLat, nLon, callBackFn) {
    var nLonToX = (R * nLon * 0.0174533) / Math.sqrt(2);
    var nLatToY = R * Math.sqrt(2) * Math.sin(nLat * 0.0174533);
    //var z = R * Math.sin(lat*0.0174533);
    callBackFn(nLonToX, nLatToY);
}


function distanceXY(nLonToX1, nLatToY1, nLonToX2, nLatToY2) {
    var nDistanceXY = Math.sqrt((nLonToX1 - nLonToX2) * (nLonToX1 - nLonToX2) + (nLatToY1 - nLatToY2) * (nLatToY1 - nLatToY2));

    console.log("Distance by Gall Peters is: " + nDistanceXY);
    return nDistanceXY;
}

function tolerance(nDistance, nDistanceXY) {
    var nTolerance = nDistanceXY - nDistance;
    console.log("the difference for GP is: " + nTolerance );

}


function toWebMercator (lon, lat, fnCallBack) {
    var mercatorX_lon = R* (lon * 0.0174533);
    var mercatorY_lat = R * Math.log(Math.tan(Math.PI / 4 + (lat * 0.0174533)/2));

    fnCallBack (mercatorX_lon,mercatorY_lat);

}

function distanceByWebMercator(mercatorX_lon1, mercatorY_lat1, mercatorX_lon2, mercatorY_lat2) {
    var nDistanceByWebMercator = Math.sqrt((mercatorX_lon1 - mercatorX_lon2) * (mercatorX_lon1 - mercatorX_lon2) + (mercatorY_lat1 - mercatorY_lat2) * (mercatorY_lat1 - mercatorY_lat2));
    console.log(" distanceByWebMercator is: " + nDistanceByWebMercator);
    return nDistanceByWebMercator;
}

function toleranceForWM(nDistance, nDistanceByWebMercator) {
    var nTolerance2 = nDistanceByWebMercator - nDistance;
    console.log("the difference for WM is: " + nTolerance2 );

}