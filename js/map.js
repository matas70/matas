function setAircraftIcon(marker, icon, azimuth) {
	var imageUrl = RotateIcon
            .makeIcon("icons/aircrafts/"+ icon + ".svg")
            .setRotation({deg: azimuth})
            .getUrl();
	var domIcon = $('#'+icon);
	domIcon.attr("src",imageUrl);
	marker.setIcon({
              url: domIcon.attr('src'),
			  scaledSize: new google.maps.Size(70,70),
			  anchor: new google.maps.Point(36,36) 
            });	
}

var selectedAircraft = null;
var selectedAircraftMarker = null;
var selectedAircraftMarkerIcon = null;

var aircrafts = null;
var selectedLocation = null;
var selectedLocationMarker = null;
var selectedLocationMarkerIcon = null;

function deselectAircraft(callback) {
	if (selectedAircraft != null) {
		// hide selected location
		hideAircraftInfoPopup(function() {
			// set it to the previous marker icon
			//selectedAircraftMarker.setIcon(selectedAircraftMarkerIcon);
			// mark it is deselected
			selectedAircraft = null;
			if (callback != undefined) 
				callback.call(this);			
		});
	}
}

function selectAircraft(aircraft, marker, aircraftName, aircraftType, iconName, imageName, time, infoUrl) {
	deselectLocation();
	showAircraftInfoPopup(aircraftName, aircraftType, iconName, imageName, time, infoUrl);				
	//map.panTo(location);
	//marker.setIcon(markerIconClicked);
	selectedAircraft = aircraft;
	selectedAircraftMarker = marker;
	//selectedAircraftMarkerIcon = markerIcon;		
}

function onAircraftSelected(aircraftId) {
	var aircraft = aircrafts[aircraftId-1];
	window.scrollTo(0,1);
	selectAircraft(aircraft, aircraftMarkers[aircraftId-1], aircraft.name, aircraft.type, aircraft.icon, aircraft.image, aircraft.path[0].time, aircraft.infoUrl);
}

function addAircraftsToMap() {
	aircrafts.forEach(function(aircraft) {
		// draw current location of the aircraft
		var currentAircraftPosition = getCurrentLocation(aircraft.path, getCurrentTime());
		var nextAircraftPosition = getNextLocation(aircraft.path, getCurrentTime());
		var currentAircraftAzimuth = calcAzimuth(currentAircraftPosition, nextAircraftPosition.location) % 360;						
						 					
		var aircraftMarker = new SlidingMarker({
		    position: currentAircraftPosition,
		    map: aircraft.hide?null:map,
			title: aircraft.name,
			easing: "linear",
			optimized: false,
      		zIndex:9			
		});	
		
		setAircraftIcon(aircraftMarker, aircraft.icon, currentAircraftAzimuth);
		aircraftMarker.currentAircraftAzimuth = currentAircraftAzimuth;																
		aircraftMarkers[aircraft.aircraftId] = aircraftMarker;
				
		infoWindow = new google.maps.InfoWindow();				 
					
		// add "clicked" event		
		aircraftMarker.addListener('click', function() {
			if (selectedAircraft == aircraft) {
					deselectAircraft();				
				} else {
					// first hide the previous popup
					if (selectedAircraft != null) {
						deselectAircraft(function() {
							// then show a new popup
							selectAircraft(aircraft, aircraftMarker, aircraft.name, aircraft.type, aircraft.icon, aircraft.image, aircraft.path[0].time.substr(0,5), aircraft.infoUrl);	
						});
					} else {								
						// then show a new popup
						selectAircraft(aircraft, aircraftMarker, aircraft.name, aircraft.type, aircraft.icon, aircraft.image, aircraft.path[0].time.substr(0,5), aircraft.infoUrl);
					}	
				}				
        });						
	}, this);
}

//**** currrent location detection - need to see wheter to delete or not
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

//********************

function deselectLocation(callback) {
	if (selectedLocation != null) {
		// hide selected location
		hideLocationPopup(function() {
			// set it to the previous marker icon
			selectedLocationMarker.setIcon(selectedLocationMarkerIcon);
			// mark it is deselected
			selectedLocation = null;
			if (callback != undefined) 
				callback.call(this);			
		});
	}
}

function selectLocation(point, location, marker, markerIcon, markerIconClicked, color, titleColor, subtitleColor) {
	deselectAircraft();
	showLocationPopup(point, color, titleColor, subtitleColor);				
	map.panTo(location);
	marker.setIcon(markerIconClicked);
	selectedLocation = location;
	selectedLocationMarker = marker;
	selectedLocationMarkerIcon = markerIcon;		
}

function drawRouteOnMap(route) {
	// create the line path
	var path = [];
	for (var i=0; i<route.points.length; i++) {					
		path[i] = convertLocation(route.points[i].N, route.points[i].E);		
	}		
	
	// add lines as data layer	
	var data = new google.maps.Data.LineString(path);	
	var dropShadowFeature = new google.maps.Data.Feature();
	dropShadowFeature.setGeometry(data);
	dropShadowFeature.setProperty("type", "dropShadow");
	dropShadowFeature.setProperty("visibile", route.visible);
	
	var pathFeature = new google.maps.Data.Feature();	
	pathFeature.setGeometry(data);
	pathFeature.setProperty("zIndex", route.routeId);
	pathFeature.setProperty("color", "#" + route.color);
	pathFeature.setProperty("type", "path");
	pathFeature.setProperty("visibile", route.visible);
	
	map.data.add(dropShadowFeature);
	map.data.add(pathFeature);			
	
    
	// add location markers	 	
	var markerIcon = {
		    url: "icons/point-"+route.color+".png",		    
		    // The anchor for this image is the center of the circle
		    anchor: new google.maps.Point(17,17)
	};
	
	var markerIconClicked = {
		    url: "icons/pointPress-"+route.color+".png",		    
		    // The anchor for this image is the center of the circle
		    anchor: new google.maps.Point(20,20)
	};
  
  	var markersMap = {};
	// create the points marker
	route.points.forEach(function(point) {
		if (!point.hidden) {
			var location = convertLocation(point.N, point.E);		
			
			// draw marker for this location		
			var marker = new google.maps.Marker({
			    position: location,
			    map: null,
				title: "לחץ כדי להציג את רשימת המטוסים במיקום זה",
				icon: markerIcon,
				optimized: false,
	      		zIndex:route.routeId		
			});
			
			marker.addListener('click', function() {			
				if (selectedLocation == location) {
					deselectLocation();				
				} else {
					// first hide the previous popup
					if (selectedLocation != null) {
						deselectLocation(function() {
							// then show a new popup
							selectLocation(point, location, marker, markerIcon, markerIconClicked, "#" + route.color, "#" + route.primaryTextColor, "#" + route.secondaryTextColor);	
						});
					} else {								
						// then show a new popup
						selectLocation(point, location, marker, markerIcon, markerIconClicked, "#" + route.color, "#" + route.primaryTextColor, "#" + route.secondaryTextColor);
					}	
				}											
			});		
			markersMap[point.pointId] = marker;
		}
	}, this);
	
	var markers = $.map(markersMap, function(value, index) {
	    return [value];
	});
	
	var markerCluster = new MarkerClusterer(map, markers,
            {
				styles: [
					{url: "icons/point-"+route.color+".png", textSize: 1, textColor: "#" + route.color, width: 34, height:34},
					{url: "icons/point-"+route.color+".png", textSize: 1,  textColor: "#" + route.color, width: 34, height:34},
					{url: "icons/point-"+route.color+".png", textSize: 1,  textColor: "#" + route.color, width: 34, height:34},
					{url: "icons/point-"+route.color+".png", textSize: 1,  textColor: "#" + route.color, width: 34, height:34},
					{url: "icons/point-"+route.color+".png", textSize: 1,  textColor: "#" + route.color, width: 34, height:34}],
				zIndex: route.routeId
			});
}

function drawRoutesOnMap(routes) {
	// set style options for routes
	map.data.setStyle(function(feature) {
	    var color = feature.getProperty('color');
		var ftype = feature.getProperty('type');
		var visible = feature.getProperty('visibile');
		var zIndex = feature.getProperty('zIndex');
		
		if (ftype == "path") {
		    return {
			  geodesic: true,
		      strokeColor: color,
			  strokeOpacity: visible?1.0:0.2,
		      strokeWeight: 3,
			  fillOpacity: 0,
			  zIndex: zIndex,
		    };
		} else if (ftype == "dropShadow") {
			return {
				geodesic: true,
          		strokeOpacity: visible?0.1:0.0,
		  		strokeColor: "black",
		  		strokeWeight: 6,
			  	fillOpacity: 0,
			  	zIndex: 0
			};
		} return {};
	});	
	
	// add all routes
	routes.forEach(function(route) {
		drawRouteOnMap(route);
	}, this);
	
		
}

var timeoutHandles = {};

function animateToNextLocation(aircraft, previousAzimuth, updateCurrent) {
	var animationTime = 2000;
	
	var currentTime = getCurrentTime();
	var currentAircraftPosition = getCurrentLocation(aircraft.path, currentTime);
	var nextAircraftStopPosition = getNextLocation(aircraft.path, currentTime);
	var nextAircraftPosition;
	
	// if the next stop is more than animationTime millieseconds, calculate where the aircraft should be within animationTime 
	// milliseconds
	if (nextAircraftStopPosition.time - currentTime > animationTime) { 
		nextAircraftPosition = getPredictedLocation(currentAircraftPosition, nextAircraftStopPosition.location, nextAircraftStopPosition.time - currentTime, animationTime);
	} else {
		// otherwise, animate to the the next aircraft stop location
		nextAircraftPosition = nextAircraftStopPosition.location;
		animationTime = nextAircraftStopPosition.time - currentTime;
	}
	
	// calculate the new azimuth	
	var currentAircraftAzimuth = calcAzimuth(currentAircraftPosition, nextAircraftPosition);
	if (currentAircraftAzimuth == null) 
		currentAircraftAzimuth = previousAzimuth;
												
	var marker = aircraftMarkers[aircraft.aircraftId];
	
	// change azimuth if needed
	if (Math.abs(previousAzimuth - currentAircraftAzimuth)>=0.1) {
		// animation aircraft roation    	
	    var step = currentAircraftAzimuth-previousAzimuth>=0?5:-5;
		var angle = previousAzimuth;

		var handle = setInterval(function(){    	
			if (Math.abs(angle % 360 - currentAircraftAzimuth % 360) < Math.abs(step)) {
				clearInterval(handle);
				setAircraftIcon(marker, aircraft.icon, currentAircraftAzimuth % 360);		
			} else {
				setAircraftIcon(marker, aircraft.icon, angle+=step % 360);
			}
	    }, updateCurrent?10:100);
	}
	
	// if requested - forcibly update the aircraft to be on current position
	if (updateCurrent) {
		marker.setDuration(1);
		marker.setPosition(currentAircraftPosition);
	}
	else {
		// animate to the next position	
		marker.setDuration(animationTime);		
		marker.setPosition(nextAircraftPosition);
	}
	
	// set a timeout for the next animation interval
	timeoutHandles[aircraft.aircraftId] = setTimeout(function () {
	   animateToNextLocation(aircraft, currentAircraftAzimuth);
	}, animationTime);
}

function startAircraftsAnimation(updateCurrent) {
	aircrafts.forEach(function(aircraft) {
		animateToNextLocation(aircraft, aircraftMarkers[aircraft.aircraftId].currentAircraftAzimuth, updateCurrent);					
	}, this);
}

var defer = $.Deferred();

function onHomeButtonClick() {
	// hide about if visible
	if (aboutVisible) {
		onAboutButtonClick();
	}
	
	deselectAircraft();
	deselectLocation();
	
	map.panTo({lat: 32.00, lng: 35.00});
	map.setZoom(8);
	deselectAircraft();
	deselectLocation();
} 

var aboutVisible = false;

function onAboutButtonClick() {
	deselectAircraft();
	deselectLocation();
	if (!aboutVisible) {	
		$("#aboutPopup").fadeIn();		
		$("#headerIcon").fadeOut("fast", function() {
			$("#aboutMenuTitle").fadeIn();
		});
		$("#aboutButton").attr("src", "icons/aboutIconSelected.png");
		aboutVisible = true;
	} else {
		$("#aboutPopup").fadeOut();
		$("#aboutMenuTitle").fadeOut("fast", function() {
			$("#headerIcon").fadeIn();
		});
		$("#aboutButton").attr("src", "icons/aboutIcon.png");
		aboutVisible = false;
	}	
}

function makeHeaderSticky() {
    // When the user scrolls the page, execute myFunction
    window.onscroll = function() {myFunction()};

	// Get the header
    var header = $("#headerMobile");

	// Get the offset position of the navbar
    var sticky = header.offset().top;

	// Add the sticky class to the header when you reach its scroll position. Remove "sticky" when you leave the scroll position
    function myFunction() {
        if (window.pageYOffset >= sticky) {
            header.addClass("sticky");
        } else {
            header.removeClass("sticky");
        }
    }
}

function initMap() {	
	initPopups();
	map = new google.maps.Map(document.getElementById('map'), 
		{
			center: {lat: 32.00, lng: 35.00},  
			zoom: 8,
			gestureHandling: 'greedy',
            disableDefaultUI: true
			});
			
	map.addListener('click', function() {
		deselectLocation();
		deselectAircraft();
	});

    // make it larger than screen that when it scrolls it goes full screen
    $("#map").height(window.screen.availHeight-128);
    $(".map-dark").height(window.screen.availHeight-128);
    makeHeaderSticky();

    // load all routes
	loadRoutes(function(routes) {
		drawRoutesOnMap(routes);
		
		// load aircrafts 
		loadAircrafts(function(pAircrafts) {
			addAircraftsToMap();			
			aircrafts = pAircrafts;
			startAircraftsAnimation(false);
		});
		
		// hide splash screen
		setTimeout(function() {
			$(".splash").fadeOut();
            document.onclick = function (argument) {
            	/*
                // make the web app full screen on click
                var docelem = document.documentElement;
                if (docelem.requestFullscreen) {
                    docelem.requestFullscreen();
                }
                else if (docelem.mozRequestFullScreen) {
                    docelem.mozRequestFullScreen();
                }
                else if (docelem.webkitRequestFullScreen) {
                    docelem.webkitRequestFullScreen();
                }
                else if (docelem.msRequestFullscreen) {
                    docelem.msRequestFullscreen();
                }*/
            }
	 	}, 3500);
		 
		$(window).focus(function() {
			startAircraftsAnimation(true);
		});			 			
	});
		
	defer.resolve(map);	 			  
}