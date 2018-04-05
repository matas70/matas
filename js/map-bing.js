var selectedLocation = null;
var aircrafts = null;
var currentLocationMarker;

//********************
function updateCurrentLocation(position) {
    currentPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
    };

    currentLocationMarker.setIcon(createPositionIcon());
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

function updateMarkerPosition(marker, position, animationDuration) {
    prevLocation = marker.getLocation();
    nextLocation = toBingLocation(position);

    // TODO: make it work
    // currentAnimation = new PathAnimation([prevLocation, nextLocation], function (coord) {
    //     marker.setLocation(coord);
    // }, false, animationDuration);
    //
    // currentAnimation.play();
    // TODO: then remove this
    marker.setLocation(nextLocation);
}

function setAircraftMarkerIcon(marker, url) {
    marker.setOptions({
         icon: url,
         anchor: new Microsoft.Maps.Point(36,36)
    });
}

function createAircraftMarker(position, name, hide, clickEvent) {
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
    marker.setOptions({name: title});
    if (shouldUseMap) {
        map.entites.push(marker);
    }
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

function toBingLocation(location) {
    return new Microsoft.Maps.Location(location.lat, location.lng);
}

function panTo(map, location) {
    map.setView({center: toBingLocation(location)});
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

    //Load the Animation Module
    Microsoft.Maps.registerModule('AnimationModule');
    Microsoft.Maps.loadModule("AnimationModule");

    return map;
}