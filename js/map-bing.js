var map;
function initMap() {
    initPopups();
    map = new Microsoft.Maps.Map(document.getElementById('map'), {
        credentials: 'Ak2hpoGQttZ2uKASnsJGuVrmv-eRsiXEOujObmNd5gpii6QjviUim4A84_4ODwmT',
        center: new Microsoft.Maps.Location(31.33, 35.20),
        mapTypeId: Microsoft.Maps.MapTypeId.road,
        zoom: 8
    });

    map.addListener('click', function () {
        deselectLocation();
        deselectAircraft();
    });

    // load all routes
    loadRoutes(function (routes) {
        drawRoutesOnMap(routes);

        // load aircrafts
        loadAircrafts(function (pAircrafts) {
            addAircraftsToMap();
            aircrafts = pAircrafts;
            startAircraftsAnimation(false);
        });

        setTimeout(function () {
            $(".splash").fadeOut();
        }, 3500);

        $(window).focus(function () {
            startAircraftsAnimation(true);
        });
    });
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

        var infoWindow = new google.maps.InfoWindow();

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

//TODO: Implement
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

//TODO: Implement
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


function deselectAircraft(callback) {
// Stub
}

function deselectLocation(callback) {

}