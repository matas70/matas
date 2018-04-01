// function setAircraftIcon(marker, icon, azimuth) {
//     var imageUrl = RotateIcon
//         .makeIcon("icons/aircrafts/"+ icon + ".svg")
//         .setRotation({deg: azimuth})
//         .getUrl();
//     var domIcon = $('#'+icon);
//     domIcon.attr("src",imageUrl);
//     marker.setIcon({
//         url: domIcon.attr('src'),
//         scaledSize: new google.maps.Size(70,70),
//         anchor: new google.maps.Point(36,36)
//     });
// }

var selectedAircraft = null;
var selectedAircraftMarker = null;
var selectedAircraftMarkerIcon = null;

var aircrafts = null;
var selectedLocation = null;
var selectedLocationMarker = null;
var selectedLocationMarkerIcon = null;

// TODO: implement
function deselectAircraft(callback) {
// 	if (selectedAircraft != null) {
// 		// hide selected location
// 		hideAircraftInfoPopup(function() {
// 			// set it to the previous marker icon
// 			//selectedAircraftMarker.setIcon(selectedAircraftMarkerIcon);
// 			// mark it is deselected
// 			selectedAircraft = null;
// 			if (callback != undefined)
// 				callback.call(this);
// 		});
// 	}
}

// function selectAircraft(aircraft, marker, aircraftName, aircraftType, iconName, imageName, time, infoUrl) {
// 	deselectLocation();
// 	showAircraftInfoPopup(aircraftName, aircraftType, iconName, imageName, time, infoUrl);
// 	//map.panTo(location);
// 	//marker.setIcon(markerIconClicked);
// 	selectedAircraft = aircraft;
// 	selectedAircraftMarker = marker;
// 	//selectedAircraftMarkerIcon = markerIcon;
// }
//
// function onAircraftSelected(aircraftId) {
// 	var aircraft = aircrafts[aircraftId-1];
// 	window.scrollTo(0,1);
// 	selectAircraft(aircraft, aircraftMarkers[aircraftId-1], aircraft.name, aircraft.type, aircraft.icon, aircraft.image, aircraft.path[0].time, aircraft.infoUrl);
// }

// function addAircraftsToMap() {
//     aircrafts.forEach(function(aircraft) {
//         // draw current location of the aircraft
//         var currentAircraftPosition = getCurrentLocation(aircraft.path, getCurrentTime());
//         var nextAircraftPosition = getNextLocation(aircraft.path, getCurrentTime());
//         var currentAircraftAzimuth = calcAzimuth(currentAircraftPosition, nextAircraftPosition.location) % 360;
//
//         var aircraftMarker = new SlidingMarker({
//             position: currentAircraftPosition,
//             map: aircraft.hide?null:map,
//             title: aircraft.name,
//             easing: "linear",
//             optimized: false,
//             zIndex:9
//         });
//
//         setAircraftIcon(aircraftMarker, aircraft.icon, currentAircraftAzimuth);
//         aircraftMarker.currentAircraftAzimuth = currentAircraftAzimuth;
//         aircraftMarkers[aircraft.aircraftId] = aircraftMarker;
//
//         infoWindow = new google.maps.InfoWindow();
//
//         // add "clicked" event
//         aircraftMarker.addListener('click', function() {
//             if (selectedAircraft == aircraft) {
//                 deselectAircraft();
//             } else {
//                 // first hide the previous popup
//                 if (selectedAircraft != null) {
//                     deselectAircraft(function() {
//                         // then show a new popup
//                         selectAircraft(aircraft, aircraftMarker, aircraft.name, aircraft.type, aircraft.icon, aircraft.image, aircraft.path[0].time.substr(0,5), aircraft.infoUrl);
//                     });
//                 } else {
//                     // then show a new popup
//                     selectAircraft(aircraft, aircraftMarker, aircraft.name, aircraft.type, aircraft.icon, aircraft.image, aircraft.path[0].time.substr(0,5), aircraft.infoUrl);
//                 }
//             }
//         });
//     }, this);
// }

//**** currrent location detection - need to see wheter to delete or not
// var currentLocationMarker;
// var currentHeadingMarker;
// var currentPosition;
// var currentHeading = null;
//
// function createHeadingArea(heading) {
//     return  {
//         path: "M0 0 L32 -64 L-32 -64 Z",
//         strokeOpacity: 0,
//         fillColor: "#f44242",
//         fillOpacity: 0.4,
//         scale: 1.5,
//         rotation: -heading-90,
//         origin: new google.maps.Point(0,0)
//     };
// }
//
// function createPositionIcon() {
//     return  {
//         path: google.maps.SymbolPath.CIRCLE,
//         strokeOpacity: 0.8,
//         strokeColor : "black",
//         strokeWeight: 1,
//         fillColor: "#f44242",
//         fillOpacity: 0.8,
//         scale: 5,
//         origin: new google.maps.Point(0,0)
//     };
// }
//
// function updateCurrentLocation(position) {
//     currentPosition = {
//         lat: position.coords.latitude,
//         lng: position.coords.longitude,
//         accuracy: position.coords.accuracy
//     };
//
//     currentLocationMarker.setIcon(createPositionIcon());
// }
//
// function updateCurrentHeading(heading) {
//     currentHeading = heading;
//     currentHeadingMarker.setIcon(createHeadingArea(currentHeading));
//     currentHeadingMarker.setMap(map);
// }
//
// function showCurrentLocation() {
//     // Try HTML5 geolocation.
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(function(position) {
//             currentPosition = {
//                 lat: position.coords.latitude,
//                 lng: position.coords.longitude,
//                 heading: position.coords.heading,
//                 accuracy: position.coords.accuracy
//             };
//             navigator.geolocation.watchPosition(updateCurrentLocation);
//
//             var currentPositionIcon = createPositionIcon();
//             var currentHeadingIcon = createHeadingArea(0);
//
//             currentHeadingMarker = new google.maps.Marker({
//                 position: currentPosition,
//                 map: null,
//                 icon: currentHeadingIcon
//             });
//             currentLocationMarker = new google.maps.Marker({
//                 position: currentPosition,
//                 map: map,
//                 title: "אתה נמצא כאן",
//                 icon: currentPositionIcon
//             });
//             map.setCenter(currentPosition);
//
//             //register to compass heading change event
//             window.addEventListener('deviceorientation', function(evt) {
//                 var heading = null;
//
//                 if(evt.alpha !== null) {
//                     heading = evt.alpha;
//                     updateCurrentHeading(heading);
//                 }
//             });
//         }, function() {
//             // no location available
//         }, {enableHighAccuracy: true});
//     } else {
//         // Browser doesn't support Geolocation
//     }
// }

//********************

// TODO: Implement
function deselectLocation(callback) {
//     if (selectedLocation != null) {
//         // hide selected location
//         hideLocationPopup(function() {
//             // set it to the previous marker icon
//             selectedLocationMarker.setIcon(selectedLocationMarkerIcon);
//             // mark it is deselected
//             selectedLocation = null;
//             if (callback != undefined)
//                 callback.call(this);
//         });
//     }
}
//
// function selectLocation(point, location, marker, markerIcon, markerIconClicked, color, titleColor, subtitleColor) {
//     deselectAircraft();
//     showLocationPopup(point, color, titleColor, subtitleColor);
//     map.panTo(location);
//     marker.setIcon(markerIconClicked);
//     selectedLocation = location;
//     selectedLocationMarker = marker;
//     selectedLocationMarkerIcon = markerIcon;
// }

function drawRouteOnMap(route, markersLayer, routesLayer) {
    // create the line path
    var path = [];
    for (var i=0; i < route.points.length; i++) {
        var convertedLocation = convertLocation(route.points[i].N, route.points[i].E);

        // Create an array of locations
        path[i] = new Microsoft.Maps.Location(convertedLocation.lat, convertedLocation.lng);
    }

    // Create a bing map polyline
    var mapRoute = new Microsoft.Maps.Polyline(path, {
        strokeColor: "#"+route.color,
        strokeThickness: 3,
        visible: route.visible,
    });

    // Add each path to the routes layer
    routesLayer.add(mapRoute);
    map.layers.insert(routesLayer);

    drawMarkersOnMap(route, markersLayer);

}

function drawMarkersOnMap(route, markersLayer) {
    // add location markers
    var markerIcon = {
        icon: "icons/point-"+route.color+".png",
        // The anchor for this image is the center of the circle
        anchor: new Microsoft.Maps.Point(17,17)
    };

    var markerIconClicked = {
        icon: "icons/pointPress-"+route.color+".png",
        // The anchor for this image is the center of the circle
        anchor: new Microsoft.Maps.Point(20,20)
    };

    var markersMap = {};

    // Create a clustering layer for the markers
    Microsoft.Maps.loadModule("Microsoft.Maps.Clustering", function() {

        // The rest of the method depends on the clustering module being loaded, so it's done in the callback

        // create the points marker
        route.points.forEach(function(point) {
            if (!point.hidden) {
                var convertedLocation = convertLocation(point.N, point.E);
                var location = new Microsoft.Maps.Location(convertedLocation.lat, convertedLocation.lng);

                // draw marker for this location
                var marker = new Microsoft.Maps.Pushpin(location, markerIcon);

                // Extracted to a method so the cluster can use it aswell
                addClickEventToMarker(marker);

                markersMap[point.pointId] = marker;
            }
        }, this);

        var markers = $.map(markersMap, function(value, index) {
            return [value];
        });

        markersLayer = new Microsoft.Maps.ClusterLayer(markers, {
            // Takes the first marker as the clustered marker, easy on performence, good on the eye
            clusterPlacementType: Microsoft.Maps.ClusterPlacementType.FirstLocation,
            gridSize: 90,
            clusteredPinCallback: function(clusteredMarker) {
                clusteredMarker.setOptions({
                    // Guaranteed that containedPushpins is not empty, and it's one of our good markers
                    icon: clusteredMarker.containedPushpins[0].getIcon(),
                    anchor: clusteredMarker.containedPushpins[0].getAnchor(),
                    // Otherwise it will be containedPushpins.length
                    text: ""
                });

                addClickEventToMarker(clusteredMarker);
            }
        });


        map.layers.insert(markersLayer);
    });
}

function drawRoutesOnMap(routes) {
    // Routes belong in the routes layer
    var routesLayer = new Microsoft.Maps.Layer("routes");
    var markersLayer;

    // add all routes
    routes.forEach(function(route) {
        drawRouteOnMap(route, markersLayer, routesLayer);
    }, this);
}

// We're working with Bing's location format
function addClickEventToMarker(marker) {
    Microsoft.Maps.Events.addHandler(marker, 'click', function() {
        if (selectedLocation == marker.getLocation()) {
            deselectLocation();
        } else {
            // first hide the previous popup
            if (selectedLocation != null) {
                deselectLocation(function() {
                    //TODO: Implement
                    // then show a new popup
                    selectLocation(point, location, marker, markerIcon, markerIconClicked, "#" + route.color, "#" + route.primaryTextColor, "#" + route.secondaryTextColor);
                });
            } else {
                //TODO: Implement
                // then show a new popup
                selectLocation(point, location, marker, markerIcon, markerIconClicked, "#" + route.color, "#" + route.primaryTextColor, "#" + route.secondaryTextColor);
            }
        }
    });
}

// var timeoutHandles = {};
//
// function animateToNextLocation(aircraft, previousAzimuth, updateCurrent) {
//     var animationTime = 2000;
//
//     var currentTime = getCurrentTime();
//     var currentAircraftPosition = getCurrentLocation(aircraft.path, currentTime);
//     var nextAircraftStopPosition = getNextLocation(aircraft.path, currentTime);
//     var nextAircraftPosition;
//
//     // if the next stop is more than animationTime millieseconds, calculate where the aircraft should be within animationTime
//     // milliseconds
//     if (nextAircraftStopPosition.time - currentTime > animationTime) {
//         nextAircraftPosition = getPredictedLocation(currentAircraftPosition, nextAircraftStopPosition.location, nextAircraftStopPosition.time - currentTime, animationTime);
//     } else {
//         // otherwise, animate to the the next aircraft stop location
//         nextAircraftPosition = nextAircraftStopPosition.location;
//         animationTime = nextAircraftStopPosition.time - currentTime;
//     }
//
//     // calculate the new azimuth
//     var currentAircraftAzimuth = calcAzimuth(currentAircraftPosition, nextAircraftPosition);
//     if (currentAircraftAzimuth == null)
//         currentAircraftAzimuth = previousAzimuth;
//
//     var marker = aircraftMarkers[aircraft.aircraftId];
//
//     // change azimuth if needed
//     if (Math.abs(previousAzimuth - currentAircraftAzimuth)>=0.1) {
//         // animation aircraft roation
//         var step = currentAircraftAzimuth-previousAzimuth>=0?5:-5;
//         var angle = previousAzimuth;
//
//         var handle = setInterval(function(){
//             if (Math.abs(angle % 360 - currentAircraftAzimuth % 360) < Math.abs(step)) {
//                 clearInterval(handle);
//                 setAircraftIcon(marker, aircraft.icon, currentAircraftAzimuth % 360);
//             } else {
//                 setAircraftIcon(marker, aircraft.icon, angle+=step % 360);
//             }
//         }, updateCurrent?10:100);
//     }
//
//     // if requested - forcibly update the aircraft to be on current position
//     if (updateCurrent) {
//         marker.setDuration(1);
//         marker.setPosition(currentAircraftPosition);
//     }
//     else {
//         // animate to the next position
//         marker.setDuration(animationTime);
//         marker.setPosition(nextAircraftPosition);
//     }
//
//     // set a timeout for the next animation interval
//     timeoutHandles[aircraft.aircraftId] = setTimeout(function () {
//         animateToNextLocation(aircraft, currentAircraftAzimuth);
//     }, animationTime);
// }
//
// function startAircraftsAnimation(updateCurrent) {
//     aircrafts.forEach(function(aircraft) {
//         animateToNextLocation(aircraft, aircraftMarkers[aircraft.aircraftId].currentAircraftAzimuth, updateCurrent);
//     }, this);
// }


// TODO: Implement
function onHomeButtonClick() {
    // hide about if visible
    // if (aboutVisible) {
    //     onAboutButtonClick();
    // }
    //
    // deselectAircraft();
    // deselectLocation();
    //
    // map.panTo({lat: 32.00, lng: 35.00});
    // map.setZoom(8);
    // deselectAircraft();
    // deselectLocation();
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

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/js/service-worker.js').then(function(registration) {
                // Registration was successful
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, function(err) {
                // registration failed :(
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
}

function redirectToHttps() {
    var loc = window.location.href+'';
    if (loc.startsWith('http://') && loc.endsWith(".azurewebsites.net")){
        window.location.href = loc.replace('http://','https://');
    }
}

var map;

function initMap() {
    redirectToHttps();
    // register service worker (needed for the app to be suggested as wepapp)
    registerServiceWorker();
    // let splash run for a second before start loading the map
    setTimeout(function() {
        initPopups();
        map = new Microsoft.Maps.Map(document.getElementById('map'), {
            credentials: 'Ak2hpoGQttZ2uKASnsJGuVrmv-eRsiXEOujObmNd5gpii6QjviUim4A84_4ODwmT',
            center: new Microsoft.Maps.Location(31.33, 35.20),
            mapTypeId: Microsoft.Maps.MapTypeId.road,
            zoom: 8,
            showDashboard: false,
            showLocateMeButton: false,
            showMapTypeSelector: false
        });

        Microsoft.Maps.Events.addHandler(map, 'click', function () {
            deselectLocation();
            deselectAircraft();
        });

        // make it larger than screen that when it scrolls it goes full screen
        $("#map").height(window.outerHeight);
        $(".map-dark").height(window.outerHeight);
        makeHeaderSticky();

        // load all routes
        loadRoutes(function (routes) {
            drawRoutesOnMap(routes);

            //TODO: Implement
            //         // load aircrafts
            //         loadAircrafts(function (pAircrafts) {
            //             addAircraftsToMap();
            //             aircrafts = pAircrafts;
            //             startAircraftsAnimation(false);
            //         });

            // hide splash screen
            setTimeout(function () {
                $(".splash").fadeOut();
                document.onclick = function (argument) {
                    window.scrollTo(0, 1);
                }
            }, 3500);

            //TODO: Implement
            //         $(window).focus(function () {
            //             startAircraftsAnimation(true);
            //         });

        });
    }, 1000);
}