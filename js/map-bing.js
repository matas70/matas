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
var currentLocationMarker;
var currentHeadingMarker;
var currentPosition;
var currentHeading = null;

//TODO: find out what this is
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

function createPositionIcon() {
    return {
        icon: "icons/location.svg",
        // The anchor for this image is the center of the circle
        anchor: new Microsoft.Maps.Point(20, 20)
    };
}

//********************
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
    //TODO: Implement for bing
    currentHeadingMarker.setIcon(createHeadingArea(currentHeading));
    currentHeadingMarker.setMap(map);
}

/**
 * draws a marker on the map given a location and icon
 * @param position - the position to draw the marker
 * @param icon - the icon of the marker
 * @param title - the text shown on the marker
 * @param shouldUseMap - should the map be
 */
function drawMarker(position, icon, title, shouldUseMap) {
    var bingLocation = new Microsoft.Maps.Location(position.lat, position.lng);
    var marker = new Microsoft.Maps.Pushpin(bingLocation, {
        icon: icon.icon,
        anchor: icon.anchor
    });

    map.entities.push(marker);
    map.setView({
        center: marker.getLocation(),
        zoom: 20
    }); 
}

/**
 * Sets the map's focus on the given location and zooms in on it
 * @param location
 */
function focusOnLocation(location) {
    var bingLocation = new Microsoft.Maps.Location(location.lat, location.lng);
    map.setView({
        center: bingLocation,
        zoom: 12
    });
}

function deselectLocation(callback) {
    if (selectedLocation != null) {
        // hide selected location
        hideLocationPopup(function() {
            // set it to the previous marker icon
//             selectedLocationMarker.setIcon(selectedLocationMarkerIcon);
            selectedLocationMarker.setOptions({
                icon: selectedLocationMarkerIcon.icon
            });

            // mark it is deselected
            selectedLocation = null;
            if (callback != undefined)
                callback.call(this);
        });
    }
}

function selectLocation(point, marker, markerIcon, markerIconClicked, color, titleColor, subtitleColor) {
    deselectAircraft();
    showLocationPopup(point, color, titleColor, subtitleColor);
    var selectedMarker = marker;

    // The selected marker can be either clusteredMarker or a single marker
    if (marker.containedPushpins) {
        selectedMarker = marker.containedPushpins[0];
        marker.visible = false;
    }

    map.setView({
        center: selectedMarker.getLocation(),
        zoom: 12
    });

    selectedMarker.setOptions({
       icon: markerIconClicked.icon 
    });

    this.selectedLocation = selectedMarker.getLocation();
    this.selectedLocationMarker = selectedMarker;
    this.selectedLocationMarkerIcon = markerIcon;
}

function getMarkerIcon(color, clicked) {
    if (!clicked) {
        return {
            icon: "icons/point-" + color + ".png",
            // The anchor for this image is the center of the circle
            anchor: new Microsoft.Maps.Point(17, 17)
        };
    }
    else return {
        icon: "icons/pointPress-" + color + ".png",
        // The anchor for this image is the center of the circle
        anchor: new Microsoft.Maps.Point(20,20)
    };
}

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

    var shadowRoute = new Microsoft.Maps.Polyline(path, {
        strokeColor: "#0000000f",
        strokeThickness: 4,
        visible: route.visible

    });

    
    // Add each path to the routes layer, checking here so we'll have only one layer of routes
    if (map.layers.indexOf(routesLayer) != -1) {
        map.layers[map.layers.indexOf(routesLayer)].add([mapRoute, shadowRoute]);
    } else {
        routesLayer.add([mapRoute, shadowRoute]);
        map.layers.insert(routesLayer);
    }

    drawMarkersOnMap(route, markersLayer);

}

function drawMarkersOnMap(route, markersLayer) {
    // add location markers
    var markerIcon = getMarkerIcon(route.color, false);
    var markerIconClicked = getMarkerIcon(route.color, true);

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
                // For a lack of a better way to pass on the correlated point, each marker has its point in the metadata
                marker.metadata = {
                    point: point,
                    route: route
                };
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
                // This will customize the clusteredMarker each rendering
                clusteredMarker.setOptions({
                    // Guaranteed that containedPushpins is not empty, and it's one of our good markers
                    icon: clusteredMarker.containedPushpins[0].getIcon(),
                    anchor: clusteredMarker.containedPushpins[0].getAnchor(),
                    // Otherwise it will be containedPushpins.length
                    text: ""
                });
                clusteredMarker.metadata = clusteredMarker.containedPushpins[0].metadata;
            }
        });

        // It is more efficient to add an event to an entire layer than to specific shapes
        addClickEventToMarker(markersLayer);
        map.layers.insert(markersLayer);
    });
}

function selectPoint(pointId, minimized=false) {
    var marker = markersMap[pointId];
    var selectedRoute = null;
    var selectedPoint = null;

    // find the route which the point belongs to
    routes.forEach(function(route) {
        route.points.forEach(function(point) {
            if (point.pointId == pointId) {
                selectedRoute = route;
                selectedPoint = point;
            }
        }, this);
    }, this);

    // first hide the previous popup
    if (selectedLocation != null) {
        deselectLocation(function() {
            // then show a new popup
            selectLocation(selectedPoint, marker, getMarkerIcon(selectedRoute.color, false), getMarkerIcon(selectedRoute.color, true), "#" + selectedRoute.color, "#" + selectedRoute.primaryTextColor, "#" + selectedRoute.secondaryTextColor, minimized);
        });
    } else {
        // then show a new popup
        selectLocation(selectedPoint, marker, getMarkerIcon(selectedRoute.color, false), getMarkerIcon(selectedRoute.color, true), "#" + selectedRoute.color, "#" + selectedRoute.primaryTextColor, "#" + selectedRoute.secondaryTextColor, minimized);
    }
}

var markersMap = {};

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
function addClickEventToMarker(layer) {
    Microsoft.Maps.Events.addHandler(layer, 'click', function(event) {
        var marker = event.primitive;
        var point = marker.metadata.point;
        var route = marker.metadata.route;

        if (selectedLocation == event.location) {
            deselectLocation();
        } else {
            // first hide the previous popup
            if (selectedLocation != null) {
                deselectLocation(function() {
                    //TODO: Implement
                    // then show a new popup
                    selectLocation(point, marker, getMarkerIcon(route.color, false), getMarkerIcon(route.color, true), "#" + route.color, "#" + route.primaryTextColor, "#" + route.secondaryTextColor);
                });
            } else {
                //TODO: Implement
                // then show a new popup
                selectLocation(point, marker, getMarkerIcon(route.color, false), getMarkerIcon(route.color, true), "#" + route.color, "#" + route.primaryTextColor, "#" + route.secondaryTextColor);
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
            this.routes = routes;
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
                showCurrentLocation();
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