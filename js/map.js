function setAircraftMarkerIcon(marker, url,anchor=36) {
    if (anchor!= null) {
        marker.setIcon({
            url: url,
            //scaledSize: new google.maps.Size(scale, scale),
            anchor: new google.maps.Point(anchor, anchor)
        });
    } else {
        marker.setIcon({
            url: url
        });
    }
}

var aircrafts = null;
var selectedLocation = null;
var selectedLocationMarker = null;
var selectedLocationMarkerIcon = null;
var aircraftCluster = null;

function createAircraftClusterIcon() {
    return {
        url: "/icons/transparent.png",
        textSize: 1,
        width: 70,
        height:70,
        anchor: new google.maps.Point(36, 36)};
}

function updateCluster() {
    if (aircraftCluster!=null) {
        aircraftCluster.repaint();
        // var markers = aircraftCluster.getMarkers();
        // for(var i=0; i<markers.length; i++) {
        // markers[i].setMap(map);
        // }
    }
}

function clusterAircrafts(aircrafts) {
    // create the new cluster
    aircraftCluster = new MarkerClusterer(map, aircrafts,
        {
            styles: [
                createAircraftClusterIcon(),
                createAircraftClusterIcon(),
                createAircraftClusterIcon(),
                createAircraftClusterIcon(),
                createAircraftClusterIcon(),
            ],
            zIndex: 99999,
            gridSize: 15
        });

    // map "on cluster click" event
    google.maps.event.addListener(aircraftCluster, 'clusterclick', function (cluster) {
        alert(cluster.getMarkers().map(aircraft => aircraft.title));
    });
}

function createAircraftMarker(position, name, hide, clickEvent) {
    aircraftMarker =  new SlidingMarker({
        position: position,
        map: hide?null:map,
        title: name,
        easing: "linear",
        optimized: false,
        zIndex:9
    });

    // add "clicked" event
    aircraftMarker.addListener('click', clickEvent);


    return aircraftMarker;
}

function toggleAircraftMarkerVisibility(marker, shouldShow) {
    if (!shouldShow) {
        marker.setMap(null);
    } else if (!marker.getMap()) {
        marker.setMap(map);
    }
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

/**
 * draws a marker on the map given a location and icon
 * @param position - the position to draw the marker
 * @param icon - the icon of the marker
 * @param title - the text shown on the marker
 * @param shouldUseMap - should the map be
 */
function drawMarker(position, icon, title, shouldUseMap) {
    var marker = new google.maps.Marker({
        position: position,
        map: shouldUseMap ? map : null,
        icon: icon,
        title: title != "" ? title : ""
    });
}

/**
 * Sets the map's focus on the given location and zooms in on it
 * @param location
 */
function focusOnLocation(location,zoom=12) {
    map.setCenter(location);
    map.setZoom(zoom);
}

function setMarkerIcon(marker, icon) {
    marker.setIcon(icon);
}

// location markers
function getMarkerIcon(color, clicked) {
    if (!clicked)
        return {
            url: "icons/point-" + color + ".png",
            // The anchor for this image is the center of the circle
            anchor: new google.maps.Point(14, 14)
        };
    else return {
        url: "icons/pointPress-" + color + ".png",
        // The anchor for this image is the center of the circle
        anchor: new google.maps.Point(20, 20)
    };
}

function panTo(map, location) {
    map.panTo(location);
}

var markersMap = {};

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

    var markerIcon = getMarkerIcon(route.color, false);
    var markerIconClicked = getMarkerIcon(route.color, true);

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
                {url: "icons/pointSmall-"+route.color+".png", textSize: 1, textColor: "#" + route.color, width: 27, height:27},
                {url: "icons/pointSmall-"+route.color+".png", textSize: 1,  textColor: "#" + route.color, width: 27, height:27},
                {url: "icons/pointSmall-"+route.color+".png", textSize: 1,  textColor: "#" + route.color, width: 27, height:27},
                {url: "icons/pointSmall-"+route.color+".png", textSize: 1,  textColor: "#" + route.color, width: 27, height:27},
                {url: "icons/pointSmall-"+route.color+".png", textSize: 1,  textColor: "#" + route.color, width: 27, height:27}],
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

function createMapObject(clickCallback) {
    map = new google.maps.Map(document.getElementById('map'),
        {
            center: {lat: 32.00, lng: 35.00},
            zoom: 8,
            gestureHandling: 'greedy',
            disableDefaultUI: true
        });

    map.addListener('click', clickCallback);
    return map;
}

function updateMarkerPosition(marker, position, animationDuration) {
    marker.setDuration(animationDuration);
    marker.setPosition(position);
}

/* unused */
function requestFullScreen() {
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
    }
}

function setZoomCallback(zoomCallback) {
    google.maps.event.addListener(map, 'zoom_changed', zoomCallback);
}

function getZoomLevel() {
    return map.getZoom();
}