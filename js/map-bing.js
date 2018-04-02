var selectedLocation = null;
var aircrafts = null;

function updateCurrentLocation(position) {
    // TODO: implement
    // currentPosition = {
    //     lat: position.coords.latitude,
    //     lng: position.coords.longitude,
    //     accuracy: position.coords.accuracy
    // };
    //
    // currentLocationMarker.setIcon(createPositionIcon());
}

var markersMap = {};

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

    // Add each path to the routes layer
    routesLayer.add([mapRoute, shadowRoute]);
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
            }
        });

        // It is more efficient to add an event to an entire layer than to specific shapes
        addClickEventToMarker(markersLayer);
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
function addClickEventToMarker(marker, clickEvent) {
    Microsoft.Maps.Events.addHandler(marker, 'click', function(event) {
        if (selectedLocation == event.location) {
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

// TODO: Implement
function updateMarkerPosition(marker, position, animationDuration) {
    // marker.setDuration(animationDuration);
    // marker.setPosition(position);
}

function setAircraftMarkerIcon(marker, url) {
    // TODO: fix the scale of the icons
    marker.setOptions({
         icon: url,
//         scaledSize: new google.maps.Size(70,70),
         anchor: new Microsoft.Maps.Point(36,36)
    });
}

function createAircraftMarker(position, name, hide, clickEvent) {
    // TODO: Complete implementation
    aircraftMarker =  new Microsoft.Maps.Pushpin(toBingLocation(position), {
        title: name
    });

    if (!hide) {
        map.entities.push(aircraftMarker);
    }
    // add "clicked" event
    Microsoft.Maps.Events.addHandler(aircraftMarker, 'click', clickEvent);

    return aircraftMarker;
}

/**
 * draws a marker on the map given a location and icon
 * @param position - the position to draw the marker
 * @param icon - the icon of the marker
 * @param title - the text shown on the marker
 * @param shouldUseMap - should the map be
 */
function drawMarker(position, icon, title, shouldUseMap) {
    var marker = new Microsoft.Maps.Pushpin(toBingLocation(position), icon);
    if (shouldUseMap) {
        map.entites.push(marker);
    }
    // todo: do we need the title?
}

function createPositionIcon() {
    // TODO: Implement
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
    return {};
}

/**
 * Sets the map's focus on the given location and zooms in on it
 * @param location
 */
function focusOnLocation(location) {
    map.setView({center: toBingLocation(location), zoom:12});
}

function setMarkerIcon(marker, icon) {
    marker.setOptions(icon);
}

// location markers
function getMarkerIcon(color, clicked) {
    if (!clicked)
        return {
            icon: "icons/point-" + color + ".png",
            // The anchor for this image is the center of the circle
            anchor: new Microsoft.Maps.Point(17, 17)
        };
    else return {
        icon: "icons/pointPress-" + color + ".png",
        // The anchor for this image is the center of the circle
        anchor: new Microsoft.Maps.Point(20, 20)
    };
}

function toBingLocation(location) {
    return new Microsoft.Maps.Location(location.lat, location.lng);
}

function panTo(map, location) {
    map.setView({center: toBingLocation(location)});
}


function createMapObject(clickCallback) {
    map = new Microsoft.Maps.Map(document.getElementById('map'), {
        credentials: 'Ak2hpoGQttZ2uKASnsJGuVrmv-eRsiXEOujObmNd5gpii6QjviUim4A84_4ODwmT',
        center: new Microsoft.Maps.Location(31.33, 35.20),
        mapTypeId: Microsoft.Maps.MapTypeId.road,
        zoom: 8,
        showDashboard: false,
        showLocateMeButton: false,
        showMapTypeSelector: false
    });

    Microsoft.Maps.Events.addHandler(map, 'click', clickCallback);
    return map;
}