function convertPath(path) { 
	var convertedPath = [];
	for(var i=0; i<path.length; i++) {
	  var point = path[i];
	  var lat = point.lat.degress + (point.lat.minutes * 100 / 60)/100;
	  var lon = point.lon.degress + (point.lon.minutes * 100 / 60)/100;
	  convertedPath[i] = {lat:lat, lng:lon};  
	}
	return convertedPath;
}
	
var map;
var aircrafts;
var locations = [];
var aircraftMarkers = {};
var aircraftPaths = {};
var startDate;
var plannedStartTime;
var actualStartTime;
var iconPaths = {
	"fighter" : "M-24 8 L-2 8 L-6 16 L-2 16 L0 14 L2 16 L6 16 L2 8 L24 8 L22 2 L14 -2 L14 -8 L12 -8 L12 -4 L6 -6 L4 -16 L2 -24 L0 -36 L-2 -24 L-4 -16 L-6 -6 L-12 -4 L-12 -8 L-14 -8 L-14 -2 L-22 2 Z",	
	"helicopter" : "M2 30 L2 34 L-2 34 L-2 30 L-10 30 L-10 26 L-2 26 L-4 6 L-6 2 L-24 16 L-6 0 L-6 -4 L-24 -22 L-6 -6 L-4 -8 L-4 -16 L-2 -20 L2 -20 L4 -16 L4 -8 L6 -6 L24 -22 L6 -4 L6 0 L24 16 L6 2 L4 6 L2 26 L10 26 L10 30 Z"
	};

function convertLocation(north, east) {
	var latDegrees = Math.floor(north / 100);
	var latMinutes = north - latDegrees * 100;		
	var lonDegrees = Math.floor(east / 100);
	var lonMinutes = east - lonDegrees * 100;
	var lat = latDegrees + (latMinutes * 100 / 60)/100;
	var lon = lonDegrees + (lonMinutes * 100 / 60)/100;
	return {lat:lat, lng:lon};
}

// Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

function calcAzimuth(source, target) {
	if (source == undefined || target == undefined) return null;
	
	var lng1 = Math.radians(source.lng);
	var lng2 = Math.radians(target.lng);
	var lat1 = Math.radians(source.lat);
	var lat2 = Math.radians(target.lat);
	
	var y = Math.sin(lng2-lng1) * Math.cos(lat2);
	var x = Math.cos(lat1)*Math.sin(lat2) -
        	Math.sin(lat1)*Math.cos(lat2)*Math.cos(lng2-lng1);
	return Math.degrees(Math.atan2(y, x));
}

function getRelativeLocation(prevLocation, nextLocation, ratio) {
	var lng = prevLocation.lng + (nextLocation.lng - prevLocation.lng) * ratio;
	var lat = prevLocation.lat + (nextLocation.lat - prevLocation.lat) * ratio;
	return {lat:lat, lng:lng};
}

function getPathLocation(pointId) {
	var loc = locations[pointId];
	if (loc == undefined) 
		return undefined;
	else 
		return convertLocation(loc.N, loc.E);
}

function getCurrentLocation(path, currentTime) {
	var relativeTime = currentTime - actualStartTime;
	var prevLocation = 0;
	var nextLocation = 1;
	var found = false;
	
	// if the aircraft hasn't start flying yet, return its first location
	if (plannedStartTime + relativeTime < convertTime(path[prevLocation].time)) 
		return getPathLocation(path[0].pointId);			
	
	// otherwise - search for the two points where the aircraft suppossed to be between
	while (nextLocation < path.length && !found) {
		var nextLocationTime = convertTime(path[nextLocation].time);
		if (plannedStartTime + relativeTime < nextLocationTime) {
			found = true;
		} else {
			prevLocation++;
			nextLocation++;
		}
	}
	
	// if not found - the aircraft already landed, return the last location
	if (!found) {
		return getPathLocation(path[path.length-1]);
	}
	
	// otherwise - calculate the relative position between previous location and current
	var prevLocationTime = convertTime(path[prevLocation].time);
	var ratio = (plannedStartTime + relativeTime - prevLocationTime) / (nextLocationTime - prevLocationTime);
	
	return getRelativeLocation(getPathLocation(path[prevLocation].pointId), getPathLocation(path[nextLocation].pointId), ratio);
}

function getNextLocation(path, currentTime) {
	var relativeTime = currentTime - actualStartTime;
	var prevLocation = 0;
	var nextLocation = 1;
	var found = false;
	
	// if the aircraft hasn't start flying yet, return its second location
	if (plannedStartTime + relativeTime < convertTime(path[prevLocation].time))  {
		var nextTime = convertTime(path[1].time) - plannedStartTime + actualStartTime;		
		return {location:getPathLocation(path[1].pointId), time:nextTime};	
	}
	
	// otherwise - search for the two points where the aircraft suppossed to be between
	while (nextLocation < path.length && !found) {
		var nextLocationTime = convertTime(path[nextLocation].time);
		if (plannedStartTime + relativeTime < nextLocationTime) {
			found = true;
		} else {
			prevLocation++;
			nextLocation++;
		}
	}
	
	// if not found - the aircraft already landed, return the last location
	if (!found) {
		return {location:getPathLocation(path[path.length-1].pointId), time:currentTime};
	}
	
	// otherwise - return the next location
	var nextTime = convertTime(path[nextLocation].time) - plannedStartTime + actualStartTime;
	return {location:getPathLocation(path[nextLocation].pointId),time:nextTime};
}

function getPredictedLocation(currentPosition, nextPosition, nextTime, time) {
	var ratio = time / nextTime;
	return getRelativeLocation(currentPosition, nextPosition, ratio);	  
}

function getCurrentTime() {
  var now = new Date();
  return now.getTime();
}

function convertTime(timeString) {
	return Date.parse(startDate+ " " + timeString, "yyyy-MM-dd HH:mm:ss").getTime();	
	//return Date.parse(startDate+ " " + timeString);
}

function containsPosition(pos, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].lat === pos.lat &&
			list[i].lng == pos.lng) {
            return true;
        }
    }

    return false;
}

function indexOfPosition(pos, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].position.lat === pos.lat &&
			list[i].position.lng == pos.lng) {
            return i;
        }
    }
    return -1;
}

function updateLocationsMap(aircrafts) {	
	// build locations map for all of the aircraft paths		
	aircrafts.forEach(function(aircraft) {
		var fromPosition = null;
		aircraft.path.forEach(function(location) {
			var item = { 
					aircraftId: aircraft.aircraftId,
					name: aircraft.name,
					icon: aircraft.icon,
					aircraftType: aircraft.type,					  
					time: location.time,
					aerobatic: aircraft.aerobatic }; 
			var location = locations[location.pointId];
			location.aircrafts.push(item);
		}, this);
	}, this);
	
	// sort each location points by time
	locations.forEach(function(loc) {
		loc.aircrafts.sort(function(item1, item2) {
    	var keyA = convertTime(item1.time),
        	keyB = convertTime(item2.time);
		    
		// Compare the 2 times
	    if(keyA < keyB) return -1;
	    if(keyA > keyB) return 1;
	    return 0;
	});
	}, this);
	
	return locations;	
}

function updateLocations(points) {
	points.forEach(function(point) {
		locations[point.pointId] = point;
		locations[point.pointId].aircrafts = [];
	}, this);
}

function loadRoutes(callback) {
	$.getJSON("data/routes.json", function(routes) {
		routes.routes.forEach(function(route) {
			updateLocations(route.points);
		}, this);
		callback(routes.routes);		
	});
}

function loadAircrafts(callback) {
	$.getJSON("data/aircrafts.json", function(routes) {	
		aircrafts = routes.aircrafts;
		startDate = routes.startDate;
		plannedStartTime = convertTime(routes.plannedStartTime);
		actualStartTime = convertTime(routes.actualStartTime);			
		updateLocationsMap(aircrafts);	
		callback(aircrafts);
	});
}

function compassHeading(alpha, beta, gamma) {
  // Convert degrees to radians
  var alphaRad = alpha * (Math.PI / 180);
  var betaRad = beta * (Math.PI / 180);
  var gammaRad = gamma * (Math.PI / 180);

  // Calculate equation components
  var cA = Math.cos(alphaRad);
  var sA = Math.sin(alphaRad);
  var cB = Math.cos(betaRad);
  var sB = Math.sin(betaRad);
  var cG = Math.cos(gammaRad);
  var sG = Math.sin(gammaRad);

  // Calculate A, B, C rotation components
  var rA = - cA * sG - sA * sB * cG;
  var rB = - sA * sG + cA * sB * cG;
  var rC = - cB * cG;

  // Calculate compass heading
  var compassHeading = Math.atan(rA / rB);

  // Convert from half unit circle to whole unit circle
  if(rB < 0) {
    compassHeading += Math.PI;
  }else if(rA < 0) {
    compassHeading += 2 * Math.PI;
  }

  // Convert radians to degrees
  compassHeading *= 180 / Math.PI;

  return compassHeading;
}