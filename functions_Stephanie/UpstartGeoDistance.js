/********************************************************************************
 * Overview:   	This file contains three functions: getGeoLocation, 
 *				getDistance, checkDistance.
 *					        
 * Created:     Feb.10, 2016
 * Creator:     Stephanie Zeng
 ********************************************************************************/
 
/**
 * Queue                                                        
 *                                    
 * @param {string} .
 * @return {function} .                                                            
 */
 
function getGeoLocationUsingQ (strStreetID,strCityID,strStateID,nZipCodeID,fnCallback, strAttempt, oRetries){
	
	//Set queue to static
	if(typeof getGeoLocationUsingQ.queue == "undefined") {
		getGeoLocationUsingQ.queue = [];
	}
	getGeoLocationUsingQ.queue.push({strStreetID,strCityID,strStateID,nZipCodeID,fnCallback, strAttempt, oRetries});
	//console.log(getGeoLocationUsingQ.queue);
	if(!dequeue.goingOn){
		dequeue();
	}
}

function isQueueEmpty(fnCallback){
	if (getGeoLocationUsingQ.queue.length!=0){
		fnCallback(false);
	}else{
		fnCallback(true);
	}
}

function dequeue(){
	if(typeof dequeue.goingOn == "undefined") {
		dequeue.goingOn = false;
	}
	isQueueEmpty(function(isEmpty){
		if(!isEmpty){
			dequeue.goingOn = true;
			getGeoLocation(getGeoLocationUsingQ.queue[0].strStreetID,getGeoLocationUsingQ.queue[0].strCityID,getGeoLocationUsingQ.queue[0].strStateID,
			getGeoLocationUsingQ.queue[0].nZipCodeID,getGeoLocationUsingQ.queue[0].fnCallback,getGeoLocationUsingQ.queue[0].strAttempt,
			getGeoLocationUsingQ.queue[0].oRetries);
		}
	});
	//console.log(getGeoLocationUsingQ.queue.length);
}



var UPSTART_INVALID_GEO = 0;

/**
 * Find the latitudes and longtitudes for the target point.                                                         
 *                                    
 * @param {string} strAddress Street address string.
 * @return {function} fnCallback Callback for latitudes and longtitudes.                                                            
 */
function getGeoLocation(strStreet,strCity, strState, nZipCode, fnCallback, strAttempt, oRetries) {
	
	if(typeof oRetries == "undefined") oRetries = {n: 10};
	if(strAttempt==null) {}
	
	var geocoder = new google.maps.Geocoder(); 
	//console.log(strStreet,strCity, strState, nZipCode);
	geocoder.geocode({'address': strStreet + strCity + strState + nZipCode}, function(results, status) {  
		// Async wait, check the map
		
		if (status === google.maps.GeocoderStatus.OK) {
			
			var validAddress = checkAddress(results,strCity, strState, nZipCode);
			/*if (results[0].geometry.location_type == "ROOFTOP"){
						// do nothing 
				checkAddress(results,strCity, strState, nZipCode);
		
			}else if (results[0].geometry.location_type == "RANGE_INTERPOLATED"){
						//do nothing
				checkAddress(results,strCity, strState, nZipCode);
			}else if (results[0].geometry.location_type == "GEOMETRIC_CENTER"){
						// do nothing 
				checkAddress(results,strCity, strState, nZipCode);
			}else if (results[0].geometry.location_type == "APPROXIMATE"){
						//check zipcode, state, city 
				checkAddress(results,strCity, strState, nZipCode);
			}	*/					
			
			if(validAddress){
				var nLatitude  = results[0].geometry.location.lat();
				var nLongitude = results[0].geometry.location.lng();
				
			}
			
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
		
		//indicates that the geocode was successful but returned no results. 
		//This may occur if the geocoder was passed a non-existent address.
		else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
			console.log("ZERO_RESULTS");
			fnCallback(UPSTART_INVALID_GEO,UPSTART_INVALID_GEO);
		} 
		
		//indicates that you are over your quota
		else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
			console.log("OVER_QUERY_LIMIT");
			oRetries.n -= 1;
			console.log("RETRY " + oRetries.n);
			if(oRetries.n==0) {
				fnCallback(UPSTART_INVALID_GEO,UPSTART_INVALID_GEO);
				console.log("OVER_QUERY_LIMIT");
			}
			else {
				setTimeout( function() {getGeoLocation(strStreet,strCity, strState, nZipCode, fnCallback, null, oRetries);}, 1000);
			}
		} 
		
		//indicates that your request was denied
		else if (status === google.maps.GeocoderStatus.REQUEST_DENIED) {
			fnCallback(UPSTART_INVALID_GEO,UPSTART_INVALID_GEO);
			console.log("REQUEST_DENIED");
		} 
		
		//generally indicates that the query (address, components or latlng) is missing
		else if (status === google.maps.GeocoderStatus.INVALID_REQUEST){
			fnCallback(UPSTART_INVALID_GEO,UPSTART_INVALID_GEO);
			console.log("INVALID_REQUEST");
		} 
		
		//indicates that the request could not be processed due to a server error. 
		//The request may succeed if you try again.
		else if (status === google.maps.GeocoderStatus.UNKNOWN_ERROR){
			fnCallback(UPSTART_INVALID_GEO,UPSTART_INVALID_GEO);
			console.log("UNKNOWN_ERROR");
		}
	});

	
}

/**
 * Check if Google Map API return the right address.                                                         
 *                                    
 * @param {string} strAddress Street address string.
 * @return {function} fnCallback Callback for latitudes and longtitudes.                                                            
 */
function checkAddress (results,strCity, strState, nZipCode){
	//console.log(strCity);
	//console.log(results[0].address_components[0].short_name);
	
	for(var i = 0; i < results[0].address_components.length;i++){
		
		//console.log(results[0].address_components[i]);
		if(results[0].address_components[i].short_name == nZipCode){
			var bZipCodeCheck = 1; 
			console.log("zipcode checked");
		}
		if(results[0].address_components[i].short_name == strCity){
			console.log("city checked");
			var bCityCheck = 1; 
		}
		if(results[0].address_components[i].short_name == strState){
			console.log("state checked");
			var bStateCheck = 1; 
		}
		
	}
	
	if (bZipCodeCheck && bCityCheck && bStateCheck ){
		console.log("address is valid");
		return true;
	}else{
		console.log("invalid return");
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
 *    @param {number} nUnit        the unit you desire for results                             
 *           where: 'M' is statute miles                         
 *                  'K' is kilometers                                  
 *                  'N' is nautical miles (default).    
 *    Resource:https://www.geodatasource.com/developers/javascript                            
 */
function getDistance(nLat1, nLon1, nLat2, nLon2, nUnits) {

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

	// Convert to the proper coordinate system*/
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
	
	// Return the distance result
	return nDistance;
	
}

 
/**
 *  Check if the ditance is in desired range.  
 *                                                
 *  @param {number} nDistance the distance between two points.                        
 *  @param {number} nRange ideal range for two points.                              
 *  @return {boolean} true if the distance is in the range of 0~nRange.  
 */

 function checkDistance(nDistance,nRange) {
	
	//Check the distance is in the range of 0~desired number.
	if (nDistance <= nRange){
		return true;
	} else if( nDistance > nRange ) {
		return false;
	}
}