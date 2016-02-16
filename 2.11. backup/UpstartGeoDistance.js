/********************************************************************************
 * Overview:   	This file contains three functions: getGeoLocation, 
 *				getDistance, checkDistance.
 *					        
 * Created:     Feb.10, 2016
 * Creator:     Stephanie Zeng
 ********************************************************************************/
 


var UPSTART_INVALID_GEO = 0;

//1.strAddress..-- is it enough for error checking???  result. 
//2. break it up. several input. 
//3. include upstartaddress. pass in upstart address/ 

function getGeoLocation2(strCity, strState, strStreets, fnCallback) {
	// Texas verus TX
	
	// TeXAS tx or TX or tX
	strCity = strCity.uppercase();
	
	// Assume state is in format "TX"
	
	
	if(results[0]["address_components"][0].short_name.length==strState) {
	}
}

/**
 * Find the latitudes and longtitudes for the target point.                                                         
 *                                    
 * @param {string} strAddress Street address string.
 * @return {function} fnCallback Callback for latitudes and longtitudes.                                                            
 */
function getGeoLocation(strAddress, fnCallback, strAttempt, oRetries) {
	if(typeof oRetries == "undefined") oRetries = {n: 10};
	if(strAttempt==null) {}
	else console.log(strAttempt);
	
	// Create a new geocoder
	var geocoder = new google.maps.Geocoder();  
	
	geocoder.geocode({'address': strAddress}, function(results, status) {  
		// Async wait, check the map
		if (status === google.maps.GeocoderStatus.OK) {
			// Check before returning
			//alert();
			console.log(JSON.stringify(results));
			
			var strState = "";
			for(var i = 0; i < results[0]["address_components"].length; i++ )
			{
				for(var j = 0; j < results[0]["address_components"][i]["types"].length; j++ )
				{
					if(results[0]["address_components"][i]["types"][j]=="administrative_area_level_1") {
						strState = results[0]["address_components"][i]["short_name"];
					}
				}
			}
			
			
			
			console.log(strState);
			
			//if(results[0]["address_components"][2]["short_name"].length != 2) {
				//fnCallback(UPSTART_INVALID_GEO,UPSTART_INVALID_GEO);
				//console.log("invalid address");
				
				//return;				
			//}
			
			var nLatitude  = results[0].geometry.location.lat();
			var nLongitude = results[0].geometry.location.lng();
			
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
			oRetries.n -= 1;
			console.log("RETRY " + oRetries.n);
			if(oRetries.n==0) {
				fnCallback(UPSTART_INVALID_GEO,UPSTART_INVALID_GEO);
				console.log("OVER_QUERY_LIMIT");
			}
			else {
				setTimeout( function() {getGeoLocation(strAddress, fnCallback, null, oRetries);}, 1000);
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