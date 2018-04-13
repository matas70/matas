function convertPath(path) {
    var convertedPath = [];
    for (var i = 0; i < path.length; i++) {
        var point = path[i];
        var lat = point.lat.degress + (point.lat.minutes * 100 / 60) / 100;
        var lon = point.lon.degress + (point.lon.minutes * 100 / 60) / 100;
        convertedPath[i] = {lat: lat, lng: lon};
    }
    return convertedPath;
}

var loadedRoutes;
var aircrafts;
var groundedAircrafts = new Set();
var locations = [];
var aircraftMarkers = {};
var aircraftPaths = {};
var startDate;
var plannedStartTime;
var actualStartTime;

function convertLocation(north, east) {
    var latDegrees = Math.floor(north / 100);
    var latMinutes = north - latDegrees * 100;
    var lonDegrees = Math.floor(east / 100);
    var lonMinutes = east - lonDegrees * 100;
    var lat = latDegrees + (latMinutes * 100 / 60) / 100;
    var lon = lonDegrees + (lonMinutes * 100 / 60) / 100;
    return {lat: lat, lng: lon};
}

// Converts from degrees to radians.
Math.radians = function (degrees) {
    return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function (radians) {
    return radians * 180 / Math.PI;
};

function calcAzimuth(source, target) {
    if (source == undefined || target == undefined) return null;

    var lng1 = Math.radians(source.lng);
    var lng2 = Math.radians(target.lng);
    var lat1 = Math.radians(source.lat);
    var lat2 = Math.radians(target.lat);

    var y = Math.sin(lng2 - lng1) * Math.cos(lat2);
    var x = Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
    return Math.degrees(Math.atan2(y, x));
}

function getRelativeLocation(prevLocation, nextLocation, ratio) {
    var lng = prevLocation.lng + (nextLocation.lng - prevLocation.lng) * ratio;
    var lat = prevLocation.lat + (nextLocation.lat - prevLocation.lat) * ratio;
    return {lat: lat, lng: lng};
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
        return getPathLocation(path[path.length-1].pointId);
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
    if (plannedStartTime + relativeTime < convertTime(path[prevLocation].time)) {
        var nextTime = convertTime(path[1].time) - plannedStartTime + actualStartTime;
        return {location: getPathLocation(path[1].pointId), time: nextTime};
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
        return {location: getPathLocation(path[path.length - 1].pointId), time: currentTime};
    }

    // otherwise - return the next location
    var nextTime = convertTime(path[nextLocation].time) - plannedStartTime + actualStartTime;
    return {location: getPathLocation(path[nextLocation].pointId), time: nextTime};
}

function getCurrentPosLocation(path, currentTime) {
    var relativeTime = currentTime - actualStartTime;
    var prevLocation = 0;
    var nextLocation = 1;
    var found = false;

    // if the aircraft hasn't start flying yet, return its first location
    if (plannedStartTime + relativeTime < convertTime(path[prevLocation].time))
        return path[0];

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
        return path[path.length - 1];
    }

    // otherwise - calculate the relative position between previous location and current
    var prevLocationTime = convertTime(path[prevLocation].time);
    var ratio = (plannedStartTime + relativeTime - prevLocationTime) / (nextLocationTime - prevLocationTime);

    return path[prevLocation];
}

/**
 * Clears the previous points in the path of all the aircrafts
 */
function cleanPreviousLocations(aircraft) {
    var currTime = getCurrentTime();
    // aircrafts.forEach(function (aircraft) {
    var currLocation = getCurrentPosLocation(aircraft.path, currTime);
    var beforeLastPath = aircraft.path[aircraft.path.length - 2];
    var lastPath = aircraft.path[aircraft.path.length - 1];

    aircraft.path = aircraft.path.filter(function (path) {
        return (currTime < getActualPathTime(path.time));
    }, this);

    if (aircraft.path.length == 0) {
        aircraft.path.push(beforeLastPath);
        aircraft.path.push(lastPath);
    } else {
        aircraft.path.unshift(currLocation)
    }
    // }, this);
}

function getActualPathTime(time) {
    return (actualStartTime + (convertTime(time) - plannedStartTime))
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
    // if fast forward - every minute is parsed as a second
    if ($.urlParam("ff") === "true") {
        return Date.parse(startDate + " " + "00:" + timeString.substr(0,5), "yyyy-MM-dd HH:mm:ss").getTime();
    } else {
        return Date.parse(startDate + " " + timeString, "yyyy-MM-dd HH:mm:ss").getTime();
    }
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

    var current = getCurrentTime();

    // build locations map for all of the aircraft paths
    aircrafts.forEach(function (aircraft) {
        var fromPosition = null;
        aircraft.path.forEach(function (location) {
            var item = {
                aircraftId: aircraft.aircraftId,
                name: aircraft.name,
                icon: aircraft.icon,
                aircraftType: aircraft.type,
                time: location.time,
                aerobatic: aircraft.aerobatic
            };
            var location = locations[location.pointId];
            location.aircrafts.push(item);
        }, this);
    }, this);

    // sort each location points by time
    locations.forEach(function (loc) {
        loc.aircrafts.sort(function (item1, item2) {
            var keyA = convertTime(item1.time),
                keyB = convertTime(item2.time);

            // Compare the 2 times
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
        });
    }, this);

    return locations;
}

function updateLocations(points) {
    points.forEach(function (point) {
        locations[point.pointId] = point;
        locations[point.pointId].aircrafts = [];
    }, this);
}

function loadRoutes(callback) {
    $.getJSON("data/routes.json", function (routes) {
        routes.routes.forEach(function (route) {
            updateLocations(route.points);
        }, this);
        loadedRoutes = routes.routes;
        callback(routes.routes);
    });
}

function loadAircrafts(callback) {
    $.getJSON("data/aircrafts.json", function (routes) {
        aircrafts = routes.aircrafts;
        startDate = routes.startDate;
        plannedStartTime = convertTime(routes.plannedStartTime);
        actualStartTime = convertTime(routes.actualStartTime);
        if ($.urlParam("simulation") != null) {
            actualStartTime = (new Date()).getTime();  - $.urlParam("simulation")*60*1000;
        }

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
    var rA = -cA * sG - sA * sB * cG;
    var rB = -sA * sG + cA * sB * cG;
    var rC = -cB * cG;

    // Calculate compass heading
    var compassHeading = Math.atan(rA / rB);

    // Convert from half unit circle to whole unit circle
    if (rB < 0) {
        compassHeading += Math.PI;
    } else if (rA < 0) {
        compassHeading += 2 * Math.PI;
    }

    // Convert radians to degrees
    compassHeading *= 180 / Math.PI;

    return compassHeading;
}

var aboutVisible = false;

var selectedAircraft = null;
var selectedAircraftMarker = null;
var selectedAircraftMarkerIcon = null;


function onAboutButtonClick() {
    deselectAircraft();
    deselectLocation();
    if (!aboutVisible) {
        $("#aboutPopup").fadeIn();
        $("#headerIcon").fadeOut("fast", function () {
            $("#aboutMenuTitle").fadeIn();
        });
        $("#aboutButton").attr("src", "icons/aboutIconSelected.png");
        aboutVisible = true;
    } else {
        $("#aboutPopup").fadeOut();
        $("#aboutMenuTitle").fadeOut("fast", function () {
            $("#headerIcon").fadeIn();
        });
        $("#aboutButton").attr("src", "icons/aboutIcon.png");
        aboutVisible = false;
    }
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('/js/service-worker.js').then(function (registration) {
                // Registration was successful
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, function (err) {
                // registration failed :(
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
}

function showCurrentLocation() {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var currentPosition = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                heading: position.coords.heading,
                accuracy: position.coords.accuracy
            };
            navigator.geolocation.watchPosition(updateCurrentLocation);

            var currentPositionIcon = createPositionIcon();
            //var currentHeadingIcon = createHeadingArea(0);

            //drawMarker(currentPosition, currentHeadingIcon, false);
            drawMarker(currentPosition, currentPositionIcon, true);
            focusOnLocation(currentPosition);

            // find the closest location and select it
            selectPoint(findClosestPoint(currentPosition), true);

            //register to compass heading change event
            // window.addEventListener('deviceorientation', function(evt) {
            //     var heading = null;
            //
            //     if(evt.alpha !== null) {
            //         heading = evt.alpha;
            //         updateCurrentHeading(heading);
            //     }
            // });
        }, function () {
            // no location available
        }, {enableHighAccuracy: true});
    } else {
        // Browser doesn't support Geolocation
    }
}

function findClosestPoint(position) {
    var selectedPoint = null;
    var minDist = Infinity;

    // find the route which the point belongs to
    loadedRoutes.forEach(function (route) {
        route.points.forEach(function (point) {
            var targetPos = convertLocation(point.N, point.E);
            var dist = getDistanceFromLatLonInKm(position.lat, position.lng, targetPos.lat, targetPos.lng);
            if (dist < minDist) {
                selectedPoint = point;
                minDist = dist;
            }
        }, this);
    }, this);

    return selectedPoint.pointId;
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

function makeHeaderSticky() {
    // When the user scrolls the page, execute myFunction
    window.onscroll = function () {
        myFunction()
    };

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

var timeoutHandles = {};

function animateToNextLocation(aircraft, previousAzimuth, updateCurrent) {
    var animationTime = 2000;

    var currentTime = getCurrentTime();
    var zoomLevel = getZoomLevel();
    var currentAircraftPosition = getCurrentLocation(aircraft.path, currentTime);
    var nextAircraftStopPosition = getNextLocation(aircraft.path, currentTime);
    var nextAircraftPosition;

    // Should the current time be larger than the next position's time, that means the aircraft landed
    if (convertTime(aircraft.path[aircraft.path.length - 1].time) - plannedStartTime + actualStartTime < getCurrentTime()) {
        toggleAircraftMarkerVisibility(aircraftMarkers[aircraft.aircraftId], false);
        console.log(aircraft.name + " Has landed");
    } else {
        // if the next stop is more than animationTime millieseconds, calculate where the aircraft should be within animationTime
        // milliseconds
        if (nextAircraftStopPosition.time - currentTime > animationTime) {
            nextAircraftPosition = getPredictedLocation(currentAircraftPosition, nextAircraftStopPosition.location, nextAircraftStopPosition.time - currentTime, animationTime);
        } else {
            // otherwise, animate to the the next aircraft stop location
            nextAircraftPosition = nextAircraftStopPosition.location;
            animationTime = nextAircraftStopPosition.time - currentTime;
            cleanPreviousLocations(aircraft);
        }

        // calculate the new azimuth
        var currentAircraftAzimuth = calcAzimuth(currentAircraftPosition, nextAircraftPosition);
        if (currentAircraftAzimuth == null)
            currentAircraftAzimuth = previousAzimuth;
        aircraft.currentAircraftAzimuth = currentAircraftAzimuth;

        var marker = aircraftMarkers[aircraft.aircraftId];

        var rotationInterval = 100;
        if (updateCurrent || $.urlParam("ff")==="true") {
            rotationInterval = 10;
        }

        // change azimuth if needed
        if (Math.abs(previousAzimuth - currentAircraftAzimuth) >= 0.1) {
            // animation aircraft roation
            var step = currentAircraftAzimuth - previousAzimuth >= 0 ? 5 : -5;
            var angle = previousAzimuth;

            var handle = setInterval(function () {
                if (Math.abs(angle % 360 - currentAircraftAzimuth % 360) < Math.abs(step)) {
                    clearInterval(handle);
                    aircraft.currentAircraftAzimuth = currentAircraftAzimuth % 360;
                    setAircraftIcon(marker, aircraft.icon, aircraft.country, currentAircraftAzimuth % 360, aircraft.color, zoomLevel);
                } else {
                    aircraft.currentAircraftAzimuth = angle += step % 360
                    setAircraftIcon(marker, aircraft.icon, aircraft.country, angle += step % 360, aircraft.color, zoomLevel);
                }
            }, rotationInterval);
        }

        // if requested - forcibly update the aircraft to be on current position
        if (updateCurrent) {
            updateMarkerPosition(marker, currentAircraftPosition, 1);
        }
        else {
            // animate to the next position
            updateMarkerPosition(marker, nextAircraftPosition, animationTime);
        }

        // set a timeout for the next animation interval
        timeoutHandles[aircraft.aircraftId] = setTimeout(function () {
            animateToNextLocation(aircraft, currentAircraftAzimuth);
        }, animationTime);
    }
    // update clusters
    //updateCluster();
}

function setAircraftIcon(marker, icon, country, azimuth, color, zoomLevel) {
    var imgUrl;
    var staticUrl;

    if (zoomLevel >= 10) {
        imgUrl = "icons/aircrafts/"+ icon + ".svg";
        staticUrl = country==null?null:"icons/countries/"+ country + ".svg";
    } else {
        imgUrl = "icons/groups/group_"+ color + ".svg";
        staticUrl = null;
    }
    imgUrl = new RotateIcon({url:imgUrl, staticUrl: staticUrl}).setRotation({deg: azimuth}).getUrl();
    setAircraftMarkerIcon(marker, imgUrl);
}

function startAircraftsAnimation(updateCurrent) {
    aircrafts.forEach(function (aircraft) {
        // If the first point's time is in the future - It is still grounded. Hide it
        if (convertTime(aircraft.path[0].time) - plannedStartTime + actualStartTime > getCurrentTime()) {
            toggleAircraftMarkerVisibility(aircraftMarkers[aircraft.aircraftId], false);
//             console.log(aircraft.name + " Has not yet departed");
            groundedAircrafts.add(aircraft);
        } else {
            animateToNextLocation(aircraft, aircraftMarkers[aircraft.aircraftId].currentAircraftAzimuth, updateCurrent);
        }
    }, this);

    // Scheduling a departure check for each of the grounded aircrafts
    groundedAircrafts.forEach(aircraft => {
        if (!departureCheckers[aircraft.aircraftId]) {
            departureCheckers[aircraft.aircraftId] = setTimeout(function() {
                checkDeparture(aircraft)
            }, 10000);
        }   
    }, this);
}

var departureCheckers = {};

// Checks every ten seconds when the aircraft will departure. When a group of aircrafts departure at once - it will separate them
function checkDeparture(aircraft) {
    if (convertTime(aircraft.path[0].time) - plannedStartTime + actualStartTime > getCurrentTime()) {
        departureCheckers[aircraft.aircraftId] = setTimeout(function() {
            checkDeparture(aircraft)
        }, 10000);
        return;
    } else {
        console.log(aircraft.name + " Has departed");
        toggleAircraftMarkerVisibility(aircraftMarkers[aircraft.aircraftId], true);
        clearTimeout(departureCheckers[aircraft.aircraftId]);
        animateToNextLocation(aircraft, aircraftMarkers[aircraft.aircraftId].currentAircraftAzimuth, true);        
    }
}

var lastZoomLevel = 0;

function addAircraftsToMap() {
    var zoomLevel = getZoomLevel();
    aircrafts.forEach(function (aircraft) {
        // draw current location of the aircraft
        var currentAircraftPosition = getCurrentLocation(aircraft.path, getCurrentTime());
        var nextAircraftPosition = getNextLocation(aircraft.path, getCurrentTime());
        var currentAircraftAzimuth = calcAzimuth(currentAircraftPosition, nextAircraftPosition.location) % 360;
        aircraft.currentAircraftAzimuth = currentAircraftAzimuth;

        var clickCallback = function () {
            if (selectedAircraft == aircraft) {
                deselectAircraft();
            } else {
                // first hide the previous popup
                if (selectedAircraft != null) {
                    deselectAircraft(function () {
                        // then show a new popup
                        selectAircraft(aircraft, aircraftMarker, aircraft.name, aircraft.type, aircraft.icon, aircraft.image, aircraft.path[0].time.substr(0, 5), aircraft.infoUrl);
                    });
                } else {
                    // then show a new popup
                    selectAircraft(aircraft, aircraftMarker, aircraft.name, aircraft.type, aircraft.icon, aircraft.image, aircraft.path[0].time.substr(0, 5), aircraft.infoUrl);
                }
            }
        };

        var aircraftMarker = createAircraftMarker(currentAircraftPosition, aircraft.name, aircraft.hide, clickCallback);
        if (aircraft.color == undefined) aircraft.color = "darkgray";
        setAircraftIcon(aircraftMarker, aircraft.icon, aircraft.country, currentAircraftAzimuth, aircraft.color, zoomLevel);
        aircraftMarker.currentAircraftAzimuth = currentAircraftAzimuth;
        aircraftMarkers[aircraft.aircraftId] = aircraftMarker;
    }, this);

    // set zoom callback event
    setZoomCallback(function() {
        var zoomLevel = getZoomLevel();
        if (zoomLevel >= 10 && lastZoomLevel < 10) {
            updateAircraftIcons();
        } else if (zoomLevel < 10 && lastZoomLevel >= 10) {
            updateAircraftIcons();
        }
        lastZoomLevel = zoomLevel;
    });
}

function updateAircraftIcons() {
    var zoomLevel = getZoomLevel();
    aircrafts.forEach(function (aircraft) {
        var aircraftMarker = aircraftMarkers[aircraft.aircraftId];
        setAircraftIcon(aircraftMarker, aircraft.icon, aircraft.country, aircraft.currentAircraftAzimuth, aircraft.color, zoomLevel);
    }, this);
}

function selectLocation(point, location, marker, markerIcon, markerIconClicked, color, titleColor, subtitleColor, minimized=false) {
    deselectAircraft();
    showLocationPopup(point, color, titleColor, subtitleColor, minimized);
    panTo(map, location);
    setMarkerIcon(marker, markerIconClicked);
    selectedLocation = location;
    selectedLocationMarker = marker;
    selectedLocationMarkerIcon = markerIcon;
}

function deselectAircraft(callback) {
    if (selectedAircraft != null) {
        // hide selected location
        hideAircraftInfoPopup(function () {
            // set it to the previous marker icon
            //selectedAircraftMarker.setIcon(selectedAircraftMarkerIcon);
            // mark it is deselected
            selectedAircraft = null;
            if (callback != undefined)
                callback.call(this);
        });
    }
}

function onAircraftSelected(aircraftId) {
    var aircraft = aircrafts[aircraftId-1];
    window.scrollTo(0,1);
    selectAircraft(aircraft, aircraftMarkers[aircraftId-1], aircraft.name, aircraft.type, aircraft.icon, aircraft.image, aircraft.path[0].time, aircraft.infoUrl);
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

function deselectLocation(callback) {
    if (selectedLocation != null) {
        // hide selected location
        hideLocationPopup(function () {
            // set it to the previous marker icon
            setMarkerIcon(selectedLocationMarker, selectedLocationMarkerIcon);

            // mark it is deselected
            selectedLocation = null;
            if (callback != undefined)
                callback.call(this);
        });
    }
}

function selectPoint(pointId, minimized=false) {
    var marker = markersMap[pointId];
    var selectedRoute = null;
    var selectedPoint = null;

    // find the route which the point belongs to
    routes.forEach(function (route) {
        route.points.forEach(function (point) {
            if (point.pointId == pointId) {
                selectedRoute = route;
                selectedPoint = point;
            }
        }, this);
    }, this);

    // first hide the previous popup
    if (selectedLocation != null) {
        deselectLocation(function () {
            // then show a new popup
            selectLocation(selectedPoint, convertLocation(selectedPoint.N, selectedPoint.E), marker, getMarkerIcon(selectedRoute.color, false), getMarkerIcon(selectedRoute.color, true), "#" + selectedRoute.color, "#" + selectedRoute.primaryTextColor, "#" + selectedRoute.secondaryTextColor, minimized);
        });
    } else {
        // then show a new popup
        selectLocation(selectedPoint, convertLocation(selectedPoint.N, selectedPoint.E), marker, getMarkerIcon(selectedRoute.color, false), getMarkerIcon(selectedRoute.color, true), "#" + selectedRoute.color, "#" + selectedRoute.primaryTextColor, "#" + selectedRoute.secondaryTextColor, minimized);
    }
}

function onHomeButtonClick() {
    // hide about if visible
    if (aboutVisible) {
        onAboutButtonClick();
    }

    deselectAircraft();
    deselectLocation();

    focusOnLocation({lat: 32.00, lng: 35.00},8);

    deselectAircraft();
    deselectLocation();
}


var defer = $.Deferred();

function initMap() {
    // onAboutButtonClick();
    // $(".splash").fadeOut();

    // register service worker (needed for the app to be suggested as wepapp)
    //registerServiceWorker();
    // let splash run for a second before start loading the map
    setTimeout(function () {
        initPopups();
        map = createMapObject(function () {
            deselectLocation();
            deselectAircraft();
        });

        // make it larger than screen that when it scrolls it goes full screen
        makeHeaderSticky();

        // load all routes
        loadRoutes(function (routes) {
            this.routes = routes;
            drawRoutesOnMap(routes);

            // load aircrafts
            loadAircrafts(function (pAircrafts) {
                addAircraftsToMap();
                aircrafts = pAircrafts;
                startAircraftsAnimation(false);
                //clusterAircrafts(aircraftMarkers);
            });

            // hide splash screen
            setTimeout(function () {
                $(".splash").fadeOut();
                showCurrentLocation();
            }, 3500);

            $(window).focus(function () {
                startAircraftsAnimation(true);
            });
        });
        defer.resolve(map);
    }, 1000);
}