var map;
var selectedAircraft = null;
var selectedAircraftMarker = null;
var selectedAircraftMarkerIcon = null;

var aircrafts = null;
var selectedLocation = null;
var selectedLocationMarker = null;
var selectedLocationMarkerIcon = null;

function initMap() {
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

        setTimeout(function () {
            $(".splash").fadeOut();
        }, 3500);

//TODO: Implement
//         $(window).focus(function () {
//             startAircraftsAnimation(true);
//         });
    });
}

// function addAircraftsToMap() {
//     aircrafts.forEach(function(aircraft) {
//         // draw current location of the aircraft
//         var currentAircraftPosition = getCurrentLocation(aircraft.path, getCurrentTime());
//         var nextAircraftPosition = getNextLocation(aircraft.path, getCurrentTime());
//         var currentAircraftAzimuth = calcAzimuth(currentAircraftPosition, nextAircraftPosition.location) % 360;

//         var aircraftMarker = new SlidingMarker({
//             position: currentAircraftPosition,
//             map: aircraft.hide?null:map,
//             title: aircraft.name,
//             easing: "linear",
//             optimized: false,
//             zIndex:9
//         });

//         setAircraftIcon(aircraftMarker, aircraft.icon, currentAircraftAzimuth);
//         aircraftMarker.currentAircraftAzimuth = currentAircraftAzimuth;
//         aircraftMarkers[aircraft.aircraftId] = aircraftMarker;

//         var infoWindow = new google.maps.InfoWindow();

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

//TODO: Implement
function drawRoutesOnMap(routes) {
    // Routes belong in the routes layer
    var routesLayer = new Microsoft.Maps.Layer("routes");
    var markersLayer;

    // add all routes
    routes.forEach(function(route) {
        drawRouteOnMap(route, markersLayer, routesLayer);
    }, this);
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
//             strokeDashArray: [4, 4],
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

function deselectAircraft(callback) {
// Stub
}

function deselectLocation(callback) {

}