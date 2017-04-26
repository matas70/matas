var RotateIcon = function(options){
    this.options = options || {};
    this.rImg = options.img || new Image();
    this.rImg.src = this.rImg.src || this.options.url || '';
    this.options.width = this.options.width || this.rImg.width || 52;
    this.options.height = this.options.height || this.rImg.height || 60;
    var canvas = document.createElement("canvas");
    canvas.width = this.options.width;
    canvas.height = this.options.height;
    this.context = canvas.getContext("2d");
    this.canvas = canvas;
};
RotateIcon.makeIcon = function(url) {
    return new RotateIcon({url: url});
};
RotateIcon.prototype.setRotation = function(options){
    var canvas = this.context,
        angle = options.deg ? options.deg * Math.PI / 180:
            options.rad,
        centerX = this.options.width/2,
        centerY = this.options.height/2;

    canvas.clearRect(0, 0, this.options.width, this.options.height);
    canvas.save();
    canvas.translate(centerX, centerY);
    canvas.rotate(angle);
    canvas.translate(-centerX, -centerY);
    canvas.drawImage(this.rImg, 0, 0);
    canvas.restore();
    return this;
};
RotateIcon.prototype.getUrl = function(){
    return this.canvas.toDataURL('image/png');
};

//===============

function createAircraftIcon(icon, azimuth) {
	return {
		    url: RotateIcon
            .makeIcon(icon)
            .setRotation({deg: azimuth+45})
            .getUrl(),		    
		    // The anchor for this image is the center of the circle
		    anchor: new google.maps.Point(17.5,17.5)
	};	
}

var infoWindow;
var aircraftPath;
var selectedAircraft = null;

function showInfoWindow(aircraft) {
	infoWindow.setContent('<div id="firstHeading" class="firstHeading">'+ aircraft.name + '</div>' +
						     '<div id="bodyContent" class="aircraftInfoContent">' +
							 '<img class="aircraftImage" src="'+aircraft.imageUrl + '"/>' +
							 'זמן תחילת טיסה: <b>' + aircraft.path[0].time + '</b>' +  
							 '</div>');
	infoWindow.open(map, aircraftMarkers[aircraft.aircraftId]);
}

var pathMarkers = [];

function showAircraftPath(aircraft) {
	var path = [];
	pathMarkers = [];
		
	// draw the planned path of the aircraft
	for (var i=0; i<aircraft.path.length; i++) {			
		var position = convertLocation(aircraft.path[i].N, aircraft.path[i].E);
		path[i] = position;		
	}

    // Create the polyline, passing the symbol in the 'icons' property.
    // Give the line an opacity of 0.
    // Repeat the symbol at intervals of 20 pixels to create the dashed effect.
	aircraftPath.setPath(path);
	aircraftPath.setMap(map);    					
}

var locationInfoWindow;
var selectedLocation = null;
var selectedLocationMarker = null;

function showLocationInfoWindow(location, marker) {
	var infoHtml = "<div>";
	for(var aircraftId in location.aircrafts) {
		var aircraft = location.aircrafts[aircraftId];
		infoHtml = infoHtml + "<a href='javascript:void(0)' onclick='showAircraftInfo(" + aircraft.aircraftId + ")'><b>" + aircraft.aircraftName + "</b></a> זמן הגעה : <b>" + aircraft.time + "</b><br>";
	} 
	infoHtml = infoHtml + "</div>";	
	locationInfoWindow.setContent(infoHtml);
	locationInfoWindow.setPosition(location.position);		
	locationInfoWindow.open(map, marker);
}

function showAircraftInfo(aircraftId) {
	var aircraft = aircrafts[aircraftId-1];
	// if the location info is displayed - hide it
	if (selectedLocation != null) {
		locationInfoWindow.close();							
				selectedLocation = null; 	
	}
	// if the info already displayed for an aircraft, hide it
	if (selectedAircraft != aircraft) {
		infoWindow.close();
		hideAircraftPath();					
	}
	// show an info for the selected aircraft
	selectedAircraft = aircraft;									
	showInfoWindow(aircraft);
	showAircraftPath(aircraft);	
	map.panTo(aircraftMarkers[aircraftId].getPosition());	
}

function addAllLocations() {
	// add a data layer with all of the aircraft paths
	// map.data.loadGeoJson("data/path.json");
	// map.data.setStyle();			
	// map.data.setStyle(function(feature) {
	//   if (feature.getProperty('type')=="marker") {
	//     return {
	// 			icon: {
	// 		            path: google.maps.SymbolPath.CIRCLE,
	// 					fillColor: "#89baf2",
	// 					fillOpacity: 0.8,
	// 					strokeWeight: 1,
	// 		            scale: 3.5					
    //       		  }
	// 			};
	//   }
	//   else {
	//   return {
	// 	  		strokeColor: "#89baf2",
	// 	  		strokeOpacity: 0.3,
	// 	  		strokeWeight: 1
	// 		};
	//   }
	// });
	
	// When the user clicks, set 'isColorful', changing the color of the letters.
	locationInfoWindow = new google.maps.InfoWindow();
	
	// map.data.addListener('click', function(event) {
	// 	if (event.feature.getProperty("type")=="marker") {
	// 		var geometry = event.feature.getGeometry().get();							
	// 		// if the info already displayed for this location, hide it
	// 		if (selectedLocation == geometry) {
	// 			locationInfoWindow.close();							
	// 			selectedLocation = null; 
	// 			}
	// 		else {	
	// 			selectedLocation = geometry;
	// 			//selectedLocationMarker = marker;	
	// 			var location = locations[indexOfPosition({lat:geometry.lat(),lng:geometry.lng()}, locations)];													
	// 			showLocationInfoWindow(location);	
	// 		}        
	// 	}	  		
	// });
		
	locations.forEach(function(location) {				
		//draw a path for this location		
		for(var fromPos in location.from) {
			var from = location.from[fromPos];
						
			// Define a symbol using SVG path notation, with an opacity of 1.
	        var lineSymbol = {
	          path: 'M 0,0.5 0,0.5',
	          strokeOpacity: 0.75,
			  strokeColor : "#234477",
	          scale: 2
	        };
						
	        // Create the polyline, passing the symbol in the 'icons' property.
	        // Give the line an opacity of 0.
	        // Repeat the symbol at intervals of 20 pixels to create the dashed effect.
	        var line = new google.maps.Polyline({
		          path: [from, location.position],
		          strokeOpacity: 0,
		          icons: [{
		            icon: lineSymbol,
		            offset: '0',
		            repeat: '5px'
		          }],
		          map: map
		        });	
			}
		
		// draw marker for this location		
		var marker = new google.maps.Marker({
		    position: location.position,
		    map: map,
			title: "לחץ כדי להציג את רשימת המטוסים במיקום זה",
			icon: {
			            path: google.maps.SymbolPath.CIRCLE,
						fillColor: "#89baf2",
						fillOpacity: 0.8,
						strokeWeight: 1,
			            scale: 3.5,
						labelOrigin: new google.maps.Point(2,0)						
          		  }			
		});	
		
		locationInfoWindow = new google.maps.InfoWindow();
				
		// add "clicked" event		
		marker.addListener('click', function() {
			// if the info already displayed for this location, hide it
			if (selectedLocation == location) {
				locationInfoWindow.close();							
				selectedLocation = null; 
				}
			else {	
				selectedLocation = location;
				selectedLocationMarker = marker;										
				showLocationInfoWindow(location, marker);	
			}
        });	
	}, this); 					
}

function hideAircraftPath() {
	aircraftPath.setMap(null);
	pathMarkers.forEach(function(marker) {
		marker.setMap(null);		
	}, this);
}

function addAircraftsToMap() {
	aircrafts.forEach(function(aircraft) {
		// draw current location of the aircraft
		var currentAircraftPosition = getCurrentLocation(aircraft.path, getCurrentTime());
		var nextAircraftPosition = getNextLocation(aircraft.path, getCurrentTime());
		var currentAircraftAzimuth = calcAzimuth(currentAircraftPosition, nextAircraftPosition);						
					
		var icon = createAircraftIcon(aircraft.icon, currentAircraftAzimuth); 					

		var aircraftMarker = new SlidingMarker({
		    position: currentAircraftPosition,
		    map: map,
			title: aircraft.name,
			easing: "linear",
			icon: icon
		});	
			
		aircraftMarkers[aircraft.aircraftId] = aircraftMarker;
				
		infoWindow = new google.maps.InfoWindow();				 
					
		// add "clicked" event		
		aircraftMarker.addListener('click', function() {
			// if the info already displayed for this aircraft, hide it
			if (selectedAircraft == aircraft) {
					infoWindow.close();
					hideAircraftPath();					
					selectedAircraft = null; 
				}
			else {
				hideAircraftPath();							
				showInfoWindow(aircraft);
				showAircraftPath(aircraft);	
				selectedAircraft = aircraft;
			}
        });						
	}, this);
}

function createCurrentAircraftPath() {
	// Define a symbol for dashed line
    var lineSymbol = {
      path: 'M 0,-1 0,1',
      strokeOpacity: 0.8,
	  strokeColor: '#226d20',
      scale: 2
    };
	
	var arrowSymbol = {
	          path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
	          strokeOpacity: 0.5,			 
			  strokeColor : "#226d20",
	          scale: 1.5
	};
	
	
	aircraftPath = new google.maps.Polyline({
	      path: [],
	      strokeOpacity: 0,
	      icons: [{
	        icon: arrowSymbol,
	        offset: '0',
	        repeat: '10px',
			map: null
	      }]
	    });		
}

var currentLocationMarker;
var currentHeadingMarker;
var currentPosition;
var currentHeading = null;

function createHeadingArea(heading) {
	return  {
		          path: "M0 0 L32 -64 L-32 -64 Z",
		          strokeOpacity: 0,	
				  fillColor: "#f44242",
				  fillOpacity: 0.4,
		          scale: 1.5,
				  rotation: -heading-90,
				  origin: new google.maps.Point(0,0)			
				};
}

function createPositionIcon() {
	return  {
		          path: google.maps.SymbolPath.CIRCLE,
		          strokeOpacity: 0.8,			 
				  strokeColor : "black",
				  strokeWeight: 1,
				  fillColor: "#f44242",
				  fillOpacity: 0.8,
		          scale: 5,
				  origin: new google.maps.Point(0,0)			
				};
}

function updateCurrentLocation(position) {
	currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
		  accuracy: position.coords.accuracy
        };
	
	currentLocationMarker.setIcon(createPositionIcon());
}

function updateCurrentHeading(heading) {
	currentHeading = heading;	
	currentHeadingMarker.setIcon(createHeadingArea(currentHeading));
	currentHeadingMarker.setMap(map);	
}

function showCurrentLocation() {	
	// Try HTML5 geolocation.
    if (navigator.geolocation) {
	    navigator.geolocation.getCurrentPosition(function(position) {
        currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
		  heading: position.coords.heading,
		  accuracy: position.coords.accuracy
        };
		navigator.geolocation.watchPosition(updateCurrentLocation);

		var currentPositionIcon = createPositionIcon();		
		var currentHeadingIcon = createHeadingArea(0);
		
		currentHeadingMarker = new google.maps.Marker({
		    position: currentPosition,
		    map: null,			
			icon: currentHeadingIcon	
		});	
		currentLocationMarker = new google.maps.Marker({
		    position: currentPosition,
		    map: map,
			title: "אתה נמצא כאן",			
			icon: currentPositionIcon	
		});	
        map.setCenter(currentPosition);				
		
		//register to compass heading change event
		 window.addEventListener('deviceorientation', function(evt) {
		   var heading = null;
		
		   if(evt.alpha !== null) {
			   heading = evt.alpha;
			   updateCurrentHeading(heading);	
			   }
		 });	
      }, function() {
        // no location available
      }, {enableHighAccuracy: true});
    } else {
      // Browser doesn't support Geolocation      
    }
}

function drawRouteOnMap(route) {
	// create the line path
	var path = [];
	for (var i=0; i<route.points.length; i++) {					
		path[i] = convertLocation(route.points[i].N, route.points[i].E);		
	}
	
	var lineShadow = new google.maps.Polyline({
          path: path,
		  geodesic: true,
          strokeOpacity: route.visible?0.1:0.0,
		  strokeColor: "black",
		  strokeWeight: 6,          
          map: map
        });	
		
    var line = new google.maps.Polyline({
          path: path,
		  geodesic: true,
          strokeOpacity: route.visible?1.0:0.0,
		  strokeColor: route.color,
		  strokeWeight: 3,
		  label: route.name,          
          map: map
        });
	
	var markerIcon = {
		    url: "icons/pressPoint@2x.png",		    
		    // The anchor for this image is the center of the circle
		    anchor: new google.maps.Point(20,20)
	};
  
	// create the points marker
	for (var i=0; i<route.points.length; i++) {
		var location = convertLocation(route.points[i].N, route.points[i].E);
		
		// draw marker for this location		
		var marker = new google.maps.Marker({
		    position: location,
		    map: map,
			title: "לחץ כדי להציג את רשימת המטוסים במיקום זה",
			icon: markerIcon		
		});	
	}		
}

function drawRoutesOnMap(routes) {
	routes.forEach(function(route) {
		drawRouteOnMap(route);
	}, this);
}

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), 
		{
			center: {lat: 32.00, lng: 35.00},  
			zoom: 8,
			gestureHandling: 'greedy'
			});
	
	// load all routes
	loadRoutes(function(routes) {
		drawRoutesOnMap(routes);
		
		// load aircrafts 
		loadAircrafts(function(aircrafts) {
			addAircraftsToMap();
		});
		
		// hide splash screen
		setTimeout(function() {
			$(".splash").fadeOut();					
	 	}, 2500);	
		 
		setInterval(function() {
			aircrafts.forEach(function(aircraft) {				
				var currentAircraftPosition = getCurrentLocation(aircraft.path, getCurrentTime());
				var nextAircraftPosition = getNextLocation(aircraft.path, getCurrentTime());
				var currentAircraftAzimuth = calcAzimuth(currentAircraftPosition, nextAircraftPosition);						
							
				var icon = createAircraftIcon(aircraft.icon, currentAircraftAzimuth);
				 
				var marker = aircraftMarkers[aircraft.aircraftId];
				marker.setPosition(currentAircraftPosition);
				marker.setIcon(icon);				
			}, this);
		}, 2000);	
	});
	
	
	// load all routes and convert coordiantes
	// loadAircraftData(function(aircrafts) {					
	// 	createCurrentAircraftPath();				
	// 	//addAllLocations();
	// 	addAircraftsToMap();
	// 	showCurrentLocation();	
		
			
	// });	 			  
}