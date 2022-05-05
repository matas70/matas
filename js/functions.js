//# sourceURL=js/functions.js
window.gm_authFailure = function () {
    mapFail = true;
    $("#closeIcon").hide();
    gtag('event', 'gmap_failture', {
        'event_category': 'google maps failture',
        'event_label': 'gm_authFailture'
    });
};

var mapFail = false;
var mapAPI = null;

function convertPath(path) {
    var convertedPath = [];
    for (var i = 0; i < path.length; i++) {
        var point = path[i];
        var lat = point.lat.degress + (point.lat.minutes * 100 / 60) / 100;
        var lon = point.lon.degress + (point.lon.minutes * 100 / 60) / 100;
        convertedPath[i] = { lat: lat, lng: lon };
    }
    return convertedPath;
}

var loadedRoutes;
//var aircrafts; -- keep the aircrafts in the window
var aircraftTypesInfo = {};
var groundedAircrafts = new Set();
var locations = [];
var aircraftMarkers = {};
var aircraftPaths = {};
var startDate;
var firstFlightTime = null;
var lastFlightTime = null;
var plannedStartTime;
var plannedEndTime;
var actualStartTime;
var realActualStartTime;
var categories = [];
var displayAircraftShows = true;
var userSimulation = false;
var aircraftData = null;
var appLoaded = false;
var changes = false;
var appStage;

var audioMessages;
$.getJSON('/data/audio-messages.json', (res) => {
    audioMessages = res;
});

// set default configuration
var config = {
    "timeOfAerobaticShow" : 2,
    "noCrowdingGeneralText": "",
    "noCrowdingLocationText": "",
    "showCrowdingWarnings": false,
    "apiURL": "https://matasstorage.blob.core.windows.net"
};


function getEnv(callback) {
    if (appStage != undefined) callback(appStage);
    else {
        $.getJSON('data/env.json', (body) => {
            switch (body.env) {
                case 'dev':
                    appStage = 'matas-dev';
                    break;
                case 'prod':
                    appStage = 'matas';
                    break;
                default:
                    appStage = 'matas-dev';
                    break;
            }
            callback(appStage);
        })
        .catch(() => {
            console.error("Matas: Couldn't load env from server, using defauls.");
            appStage = "matas";
            callback(appStage);
        });
    }
}



function convertLocation(north, east) {
    var latDegrees = Math.floor(north / 100);
    var latMinutes = north - latDegrees * 100;
    var lonDegrees = Math.floor(east / 100);
    var lonMinutes = east - lonDegrees * 100;
    var lat = latDegrees + (latMinutes * 100 / 60) / 100;
    var lon = lonDegrees + (lonMinutes * 100 / 60) / 100;
    return { lat: lat, lng: lon };
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
    var azimuth = Math.degrees(Math.atan2(y, x));
    if (azimuth < 0) {
        azimuth = 360 + azimuth;
    }
    return azimuth;
}

let baseData = [];

function loadOpenBasesLocation(callback) {
    getEnv((env) => {
        $.getJSON(`${config.apiURL}/${env}/openBases.json?t=`+(new Date()).getTime(), function (baseLocations) {
            baseLocations.forEach(element => {
                baseData.push(element)
            })
        });
    });
}

function firstContainintRoute(location) {
    return routes.find(route => route.points.find(point => location.pointId === point.pointId));
}

loadOpenBasesLocation();

//create base category in navbar 
function createBaseCategory(point) {
    let base;
    baseData.forEach(element => {
        if(element.baseName === point.pointName) {
            base = element
        }
    })

    if(base === undefined) return '';
    
    return `<div class="base-category-container" onclick=showBaseLoactionPopup("${point.pointId}")>
                <h2 class="header">${base.baseName}</h2>
                <a target="_blank" href="${base.baseWazeDestinationLink}">
                        <img class="waze-icon" src="icons/waze.svg">
                </a>
            </div>`
}

function getRelativeLocation(prevLocation, nextLocation, ratio) {
    var lng = prevLocation.lng + (nextLocation.lng - prevLocation.lng) * ratio;
    var lat = prevLocation.lat + (nextLocation.lat - prevLocation.lat) * ratio;
    return { lat: lat, lng: lng };
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
    if (plannedStartTime + relativeTime < convertTime(path[prevLocation].date, path[prevLocation].time))
        return -1;

    // otherwise - search for the two points where the aircraft suppossed to be between
    while (nextLocation < path.length && !found) {
        var nextLocationTime = convertTime(path[nextLocation].date, path[nextLocation].time);
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
    if (plannedStartTime + relativeTime < convertTime(path[prevLocation].date, path[prevLocation].time))
        return getPathLocation(path[0].pointId);

    // otherwise - search for the two points where the aircraft suppossed to be between
    while (nextLocation < path.length && !found) {
        var nextLocationTime = convertTime(path[nextLocation].date, path[nextLocation].time);
        if (plannedStartTime + relativeTime < nextLocationTime) {
            found = true;
        } else {
            prevLocation++;
            nextLocation++;
        }
    }

    // if not found - the aircraft already landed, return the last location
    if (!found) {
        return getPathLocation(path[path.length - 1].pointId);
    }

    // otherwise - calculate the relative position between previous location and current
    var prevLocationTime = convertTime(path[prevLocation].date, path[prevLocation].time);
    var ratio = (plannedStartTime + relativeTime - prevLocationTime) / (nextLocationTime - prevLocationTime);

    return getRelativeLocation(getPathLocation(path[prevLocation].pointId), getPathLocation(path[nextLocation].pointId), ratio);
}

function getIndexOfNextLocation(path, currentTime) {
    var relativeTime = currentTime - actualStartTime;
    var prevLocation = 0;
    var nextLocation = 1;
    var found = false;

    // if the aircraft hasn't start flying yet, return its second location
    if (plannedStartTime + relativeTime < convertTime(path[prevLocation].date, path[prevLocation].time)) {
        return -1
    }

    // otherwise - search for the two points where the aircraft suppossed to be between
    while (nextLocation < path.length && !found) {
        var nextLocationTime = convertTime(path[nextLocation].date, path[nextLocation].time);
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
    if (path.length > 1) {
        var nextLocation;
        nextLocation = getIndexOfNextLocation(path, currentTime);
        if (nextLocation === -1) {
            var nextTime = convertTime(path[1].date, path[1].time) - plannedStartTime + actualStartTime;
            return {location: getPathLocation(path[1].pointId), time: nextTime};
        } else if (nextLocation == path.length) {
            return {location: getPathLocation(path[path.length - 1].pointId), time: currentTime};
        } else {
            var nextTime = convertTime(path[nextLocation].date, path[nextLocation].time) - plannedStartTime + actualStartTime;
            return {location: getPathLocation(path[nextLocation].pointId), time: nextTime};
        }
    } else {
        return {location: getPathLocation(path[0].pointId), time: path[0].time};
    }
}

function getCurrentPosLocation(path, currentTime) {
    var relativeTime = currentTime - actualStartTime;
    var prevLocation = 0;
    var nextLocation = 1;
    var found = false;

    // if the aircraft hasn't start flying yet, return its first location
    if (plannedStartTime + relativeTime < convertTime(path[prevLocation].date, path[prevLocation].time))
        return path[0];

    // otherwise - search for the two points where the aircraft suppossed to be between
    while (nextLocation < path.length && !found) {
        var nextLocationTime = convertTime(path[nextLocation].date, path[nextLocation].time);
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
    var prevLocationTime = convertTime(path[prevLocation].date, path[prevLocation].time);
    var ratio = (plannedStartTime + relativeTime - prevLocationTime) / (nextLocationTime - prevLocationTime);

    return path[prevLocation];
}

function removeAircraftsFromLocation() {
    if (!userSimulation) {
        var currTime = getCurrentTime();
        locations.forEach(function (location) {
            location.aircrafts = location.aircrafts.filter(function (aircraft) {
                return (currTime < getActualPathTime(aircraft.date, aircraft.time));
            })
        });
    }
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

    // find all of the locations that already visited
    var pathPassed = aircraft.path.filter(function (path) {
        return (currTime >= getActualPathTime(path.date, path.time))
    });

    // remove aircraft from locations that it already visited
    if (!userSimulation) {
        pathPassed.forEach(function (path) {
            var location = locations[path.pointId];
            if (!location) return false;
            location.aircrafts = location.aircrafts.filter(function (aircraftInPath) {
                return (aircraftInPath.aircraftId !== aircraft.aircraftId ||
                    aircraftInPath.aircraftId === aircraft.aircraftId && currTime < getActualPathTime(aircraftInPath.date, aircraftInPath.time))
            });
        });
    }

    // remove them from the aircraft path
    aircraft.path = aircraft.path.filter(function (path) {
        return (currTime < getActualPathTime(path.date, path.time));
    }, this);

    if (aircraft.path.length == 0) {
        aircraft.path.push(beforeLastPath);
        aircraft.path.push(lastPath);
    } else {
        aircraft.path.unshift(currLocation)
    }
    // }, this);
}

function getActualPathTime(date, time) {
    return (actualStartTime + (convertTime(date, time) - plannedStartTime))
}

function getPredictedLocation(currentPosition, nextPosition, nextTime, time) {
    var ratio = time / nextTime;
    return getRelativeLocation(currentPosition, nextPosition, ratio);
}

function getCurrentTime() {
    var now = new Date();
    return now.getTime();
}

function convertTime(dateString, timeString) {
    if (!dateString) dateString = startDate;
    var year = dateString.substr(0, 4);
    var month = dateString.substr(5, 2);
    var day = dateString.substr(8, 2);
    var hours = timeString.substr(0, 2);
    var minutes = timeString.substr(3, 2);
    var seconds = timeString.substr(6, 2);

    if ($.urlParam("ff") === "true") {
        realTime = new Date(year, month - 1, day, 0, hours, minutes, seconds / 60 * 1000).getTime();
    } else {
        realTime = new Date(year, month - 1, day, hours, minutes, seconds).getTime();
    }

    return realTime;
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

function getHtmlWithAerobaticGlow(originalMarkerHtml) {
    if (!originalMarkerHtml.includes("aerobatic-gif")) {
        var markerClassHtml = originalMarkerHtml.split('">', 1)[0];
        var htmlWithGif = originalMarkerHtml.replace(markerClassHtml, markerClassHtml + " aerobatic-gif-marker");
        htmlWithGif += `<div class="glowing-circle ${mapAPI.circleClassName}">
                          <div class="circle"></div>
                          <div class="circle2"></div>
                        </div>`;

        // Sorry for this
        mapAPI.panALittle();

        return htmlWithGif;
    }

    return originalMarkerHtml;
}

var aerobaticShows = {};

function glowOnPoint(location, timeOfAerobaticShow) {
    if ($.urlParam("ff") === "true") timeOfAerobaticShow = timeOfAerobaticShow / 60;

    var relevantMarker = markersMap[location.pointId];

    if (relevantMarker) {
        const originalMarkerHtml = mapAPI.getMarkerHtml(relevantMarker);
        mapAPI.setMarkerHtml(relevantMarker, getHtmlWithAerobaticGlow(originalMarkerHtml));

        // Actually set the icon
        mapAPI.setMarkerIcon(relevantMarker, mapAPI.getMarkerIconToSet(relevantMarker));
        

        // Rest merker icon
        setTimeout(() => {
            mapAPI.setMarkerHtml(relevantMarker, originalMarkerHtml);
        }, timeOfAerobaticShow);

        if (!aerobaticShows[location.pointId]) {
            aerobaticShows[location.pointId] = setTimeout(() => {
                mapAPI.setMarkerHtml(originalMarkerHtml);
                mapAPI.setMarkerIcon(relevantMarker, mapAPI.getMarkerIconToSet(relevantMarker));
                aerobaticShows[location.pointId] = undefined;
                mapAPI.panALittle();
            }, timeOfAerobaticShow);
        }
    }
}

function scheduleAerobaticNotifications(notificationBody, item, location, time) {
    // schedule in-app popups 5 minutes before each aerobatic show
    let timeToNotify = time - 5 * 60 * 1000;

    if (timeToNotify > 0) {
        setTimeout(() => {
            if (isSubscribed(location.pointId)) {
                showBasePopup(item.aerobatic, item.specialInAircraft, item.specialInPath, 5, location.pointName);
            }
        }, timeToNotify);
    }
}

var aerobaticNotificationsHandler = null;

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
                from: location.from,
                aerobatic: aircraft.aerobatic,
                parachutist: aircraft.parachutist,
                category: aircraft.category,
                specialInPath: location.special,
                specialInAircraft: aircraft.special,
                date: location.date
            };

            if (locations[location.pointId]) {
                location = locations[location.pointId];
            } else {
                console.warn(`warning - aircraft is moving above non existing location, point id: ${location.pointId}, time: ${item.time}`)
                aircraft.path = aircraft.path.filter(point => point.pointId !== location.pointId)
                location.aircrafts = [];
                location.hidden = true;
                location.pointName = "";
            }

            if (displayAircraftShows && (item.aerobatic || item.parachutist || item.specialInPath === "מופעים אוויריים" || item.specialInAircraft === "מופעים אוויריים")) {
                var timeout = convertTime(item.date, item.time) - getCurrentTime() + actualStartTime - plannedStartTime;
                var notificationBody = `${getEventName(item.aerobatic, item.specialInAircraft, item.specialInPath)} ${getEventDescription(item.aerobatic, location.pointName, 5)}`;
                if (!userSimulation && timeout > 0) {
                    scheduleAerobaticNotifications(notificationBody, item, location, timeout);
                }

                const timeOfAerobaticShow = config.timeOfAerobaticShow * 60 * 1000;
                if (!userSimulation && timeout > -timeOfAerobaticShow) {
                    // schedule aerobatic indication when the show starts, if the show already start the glow will start within 5 seconds
                    // (to allow the map to load and create the markers)
                    setTimeout(() => {
                        glowOnPoint(location, timeOfAerobaticShow + Math.min(timeout, 0));
                    }, Math.max(timeout, 5000));
                }
            }

            location.aircrafts.push(item);
        }, this);
    }, this);

    // sort each location points by time
    locations.forEach(function (loc) {
        loc.aircrafts.sort(function (item1, item2) {
            var keyA = convertTime(item1.date, item1.time),
                keyB = convertTime(item2.date, item2.time);

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
        const oldPoint = locations[point.pointId]
        if(oldPoint) {
            /* for these attributes, always use the 'points.json' as single source of truth.
             * other values will be overridden by the latest route.
             */
            const attributesToKeep = {
                // hidden: oldPoint.hidden,
                type: oldPoint.type,
                E: oldPoint.E,
                N: oldPoint.N,
                //hideAircrafts: oldPoint.hideAircrafts,
                pointLocation: oldPoint.pointLocation,
                wazeLink: oldPoint.wazeLink,
                pointName: oldPoint.pointName
            }
            point = {
                ...point,
                ...attributesToKeep
            }
        }
        locations[point.pointId] = point;
        locations[point.pointId].aircrafts = [];
        locations[point.pointId].hideAircrafts = point.hideAircrafts;
        locations[point.pointId].color = route.color;
    }, this);
}


function loadLocations(callback) {
    getEnv((env) => {
        $.getJSON(`${config.apiURL}/${env}/points.json?t=` + (new Date()).getTime(), function (points) {
            points.forEach(function (point) {
                if (locations[point.pointId] === undefined) {
                    locations[point.pointId] = point;
                    locations[point.pointId].aircrafts = [];
                    locations[point.pointId].color = "64e1a5"
                }
            }, this);
            callback(points);
        });
    });
}

function loadRoutes(callback) {
    getEnv((env) => {
        $.getJSON(`${config.apiURL}/${env}/routes.json?t=`+(new Date()).getTime(), function (routes) {
            routes.routes.forEach(function (route) {
                updateLocations(route);
            }, this);
            loadedRoutes = routes.routes;
            callback(routes.routes);
        });
    });
}

/**
 * Considers the simulation flag
 * @param routes
 */
function loadActualStartTime() {
    actualStartTime = convertTime(startDate, aircraftData.actualStartTime);

    if ($.urlParam("simulation") != null) {
        actualStartTime = (new Date()).getTime() - $.urlParam("simulation") * 60 * 1000;
    }
    realActualStartTime = actualStartTime;

    var currentTime = new Date().getTime();

    // make sure there is no active rehearsal
    var isRehearsalActive = false;
    var deltaFromRehearsals = 2 * 60 * 60 * 1000;
    var rehearsals = [].concat.apply([], aircrafts.filter((aircraft) => {
        return aircraft.special === "חזרות";
    }).map((aircraft) => {
        return aircraft.path;
    }));
    rehearsals.forEach((rehersal) => {
        if (currentTime > convertTime(rehersal.date, rehersal.time) - deltaFromRehearsals &&
            currentTime < convertTime(rehersal.date, rehersal.time) + deltaFromRehearsals)
            isRehearsalActive = true;
    });

    // run simulation until 6 hours before the actual flight.
    if (actualStartTime - currentTime > 6 * 60 * 60 * 1000 && !isRehearsalActive) {
        // start a simulation between 15 minutes after the first aircraft and 15 minutes before the last landing time.
        userSimulation = true;
        var simulationLength = (lastFlightTime - 15 * 60 * 1000) - (firstFlightTime + 15 * 60 * 1000);
        actualStartTime = currentTime - (currentTime % ((firstFlightTime + 15 * 60 * 1000) % simulationLength)) - ((firstFlightTime + 15 * 60 * 1000) - actualStartTime);
    }
}

function loadAircrafts(callback) {
    getEnv((env) => {
        $.getJSON(`${config.apiURL}/${env}/aircrafts-info.json?t=` + (new Date()).getTime(), function(aircraftInfo) {
            // load aircraft type info into a map
            aircraftInfo.aircraftTypes.forEach(function (aircraftTypeInfo) {
                aircraftTypesInfo[aircraftTypeInfo.aircraftTypeId] = aircraftTypeInfo;
            }, this);

            // load all aircrafts
            $.getJSON(`${config.apiURL}/${env}/aircrafts.json?t=`+(new Date()).getTime(), function (flightData) {
                aircrafts = flightData.aircrafts;
                startDate = flightData.startDate;
                plannedStartTime = convertTime(startDate, flightData.plannedStartTime);
                plannedEndTime = convertTime(startDate, flightData.plannedEndTime);
                changes = flightData.changes;

                // keep only aircrafts with paths
                aircrafts = aircrafts.filter(aircraft => aircraft.path.length > 1);
                
                // merge info from aircraft type info
                aircrafts.forEach(function (aircraft) {
                    if (aircraft.aircraftTypeId !== undefined) {
                        // copy all of the information from aircraft type info
                        var aircraftTypeInfo = aircraftTypesInfo[aircraft.aircraftTypeId];
                        for(var field in aircraftTypeInfo)
                            aircraft[field]=aircraftTypeInfo[field];
                    }

                    // sort aircraft path by time
                    aircraft.path.sort((point1, point2) => convertTime(point1.date, point1.time) - convertTime(point2.date, point2.time));

                    // update times of all flights
                    if (!aircraft.hide && aircraft.path.length > 0 && !aircraft.special) {
                        aircraftFlightTime = convertTime(aircraft.path[0].date, aircraft.path[0].time);
                        if (firstFlightTime == null) {
                            firstFlightTime = aircraftFlightTime;
                        } else if (aircraftFlightTime < firstFlightTime) {
                            firstFlightTime = aircraftFlightTime;
                        }

                        aircraftLandTime = convertTime(aircraft.path[aircraft.path.length-1].date, aircraft.path[aircraft.path.length-1].time);

                        if (lastFlightTime == null) {
                            lastFlightTime = aircraftLandTime;
                        } else if (aircraftLandTime > lastFlightTime) {
                            lastFlightTime = aircraftLandTime;
                        }
                    }

                }, this);

                aircraftData = flightData;
                loadActualStartTime();
                callback(aircrafts);
            });
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
    previousHash.push(aboutHash);
    window.location.hash = aboutHash;

    gtag('event', 'about_popup_open', {
        'event_category': 'ui_interaction'
    });

    deselectAircraft();
    deselectLocation();
    if (!aboutVisible) {
        $("#aboutPopup").fadeIn();
        $("#headerIcon").fadeOut("fast", function () {
            $("#aboutMenuTitle").fadeIn();
        });
        $("#aboutButton").attr("src", "icons/aboutIconSelected.png");
        aboutVisible = true;

        // hide IAF logo if there is no room - this is very ugly code but we don't have much time to mess around with this
        var requiredHeight = 64 + $("#headerMobile").height() + $("#aboutLogo").height() + $("#aboutTitle").height() + $("#aboutBody").height() + $("#aboutBottom").height();
        if (window.innerHeight < requiredHeight) {
            $("#aboutBottom").hide();
        }
    }
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js').then(function (registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function (err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    }
}

/**
 *
 * @param typeCategory - base, hospital, etc.
 * @returns {boolean}
 */
 function shouldShowTypeCategory(typeCategory) {
    return !!locations.find(location => location && location.type === typeCategory);
}


var currentLocationMarker;
var currentPosition;

function updateCurrentLocation(position) {
    currentPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
    };

    mapAPI.updateMarkerPosition(currentLocationMarker, currentPosition, 200);
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

            currentLocationMarker = mapAPI.createPositionMarker(currentPosition);
            mapAPI.focusOnLocation(currentPosition);

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
            
            gtag('event', 'show_curr_location', {
                'event_category': 'show_curr_location',
                'event_label': 'success - show point ' + findClosestPoint(currentPosition)
            });
        }, function () {
            // no location available
            gtag('event', 'show_curr_location', {
                'event_category': 'show_curr_location',
                'event_label': 'failed - no permission'
            });
        }, {enableHighAccuracy: true});
    } else {
        // Browser doesn't support Geolocation
        gtag('event', 'show_curr_location', {
            'event_category': 'show_curr_location',
            'event_label': 'failed - not supported'
        });
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

function checkIfSimulationEnded() {
    // if there is a user simulation and there are no more aircrafts with paths, start over
    if (userSimulation) {
        let currentTime = getCurrentTime();
        let remainingAircrafts = aircrafts.filter((aircraft) => {
            let path = aircraft.path.filter((point) => {
                return getActualPathTime(point.date, point.time) > currentTime;
            });
            return (path.length > 0 && !aircraft.special);
        });
        if (remainingAircrafts.length === 0) {
            // restart simulation
            location.reload();
        }
    }
}

//array of aircaftTypes that were notified as near
var notifiedNearUser = [];


function animateToNextLocation(aircraft, previousAzimuth, updateCurrent) {
    
    var animationTime = 2000;

    var currentTime = getCurrentTime();
    var zoomLevel = mapAPI.getZoomLevel();
    var currentAircraftPosition = getCurrentLocation(aircraft.path, currentTime);
    var nextAircraftStopPosition = getNextLocation(aircraft.path, currentTime);
    var nextAircraftPosition;


    var eventsStartTime = convertTime(startDate, aircraftData.actualStartTime);
    let isSimulation = $.urlParam("simulation") != null;
    let theEventStarted = eventsStartTime - new Date().getTime() < 0 ;
    
    // Checking weather aircraftType has not already been notified 
    if ( (theEventStarted || isSimulation) && !(notifiedNearUser.includes(aircraft.aircraftTypeId)))
         {
                notifyUserIfNear(currentAircraftPosition, aircraft);
    }
    
    

    // Should the current time be larger than the next position's time, that means the aircraft landed
    if (convertTime(aircraft.path[aircraft.path.length - 1].date, aircraft.path[aircraft.path.length - 1].time) - plannedStartTime + actualStartTime < getCurrentTime()) {
        mapAPI.toggleAircraftMarkerVisibility(aircraftMarkers[aircraft.aircraftId], false);
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
        var curIndexLocation = getCurrentIndexLocation(aircraft.path, currentTime);
        if (curIndexLocation >= 0 && curIndexLocation < aircraft.path.length && (aircraft.path[curIndexLocation].hideAircrafts || aircraft.hide)) {
            if (mapAPI.isMarkerVisible(marker)) {
                mapAPI.toggleAircraftMarkerVisibility(marker, false);
                // console.log(aircraft.path[curIndexLocation].pointId);
            }
        } else if (!mapAPI.isMarkerVisible(marker)) {
            mapAPI.toggleAircraftMarkerVisibility(marker, !aircraft.hide);
            // if (aircraft.path[curIndexLocation].pointId===33){
            //     console.log("up" + aircraft.path[curIndexLocation].pointId);
            // }
        }

        var rotationInterval = 100;
        if (updateCurrent || $.urlParam("ff") === "true") {
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
                    setAircraftIcon(marker, aircraft.icon, aircraft.aircraftId, aircraft.country, currentAircraftAzimuth % 360, aircraft.color, zoomLevel);
                } else {

                    // console.log("Aircraft " + aircraft.name + ", id: " + aircraft.aircraftId + " is rotating " + step + " degrees from " + angle + " to " + currentAircraftAzimuth+ ", and its distance is " + Math.abs(angle % 360 - currentAircraftAzimuth % 360));

                    aircraft.currentAircraftAzimuth = angle += step % 360
                    setAircraftIcon(marker, aircraft.icon, aircraft.aircraftId, aircraft.country, angle += step % 360, aircraft.color, zoomLevel);
                }
            }, rotationInterval);
        }

        // if requested - forcibly update the aircraft to be on current position
        if (updateCurrent) {
            mapAPI.updateMarkerPosition(marker, currentAircraftPosition, 1);
        } else {
            // animate to the next position
            mapAPI.updateMarkerPosition(marker, nextAircraftPosition, animationTime);
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

function setAircraftIcon(marker, icon, acId, country, azimuth, color, zoomLevel) {
    var imgUrl;
    var staticUrl;
    
    if (zoomLevel >= 9) { 
        imgUrl = 'icons/aircrafts/' + icon + '.svg?a=' + acId + 'i';
        staticUrl = country == null ? null : "icons/countries/" + country + ".svg";
    } else {
        imgUrl = 'icons/arrow.svg?a=' + acId + 'i';
        staticUrl = null;
    }

    mapAPI.setAircraftMarkerIcon(marker, imgUrl);
    
    setTimeout(() => {
        $(`img[src*="?a=${acId}i"]`).css("transform",  'rotate(' + azimuth + 'deg)');
    }, 500);
}

function startAircraftsAnimation(updateCurrent) {
    aircrafts.forEach(function (aircraft) {
        // If the first point's time is in the future - It is still grounded. Hide it
        if (convertTime(aircraft.path[0].date, aircraft.path[0].time) - plannedStartTime + actualStartTime > getCurrentTime()) {
            mapAPI.toggleAircraftMarkerVisibility(aircraftMarkers[aircraft.aircraftId], false);
            //             console.log(aircraft.name + " Has not yet departed");
            groundedAircrafts.add(aircraft);
        } else {
            animateToNextLocation(aircraft, aircraftMarkers[aircraft.aircraftId].currentAircraftAzimuth, updateCurrent);
        }
    }, this);

    // Scheduling a departure check for each of the grounded aircrafts
    groundedAircrafts.forEach(aircraft => {
        if (!departureCheckers[aircraft.aircraftId]) {
            departureCheckers[aircraft.aircraftId] = setTimeout(function () {
                checkDeparture(aircraft)
            }, 10000);
        }
    }, this);
}

var departureCheckers = {};

// Checks every ten seconds when the aircraft will departure. When a group of aircrafts departure at once - it will separate them
function checkDeparture(aircraft) {
    if (convertTime(aircraft.path[0].date, aircraft.path[0].time) - plannedStartTime + actualStartTime > getCurrentTime()) {
        departureCheckers[aircraft.aircraftId] = setTimeout(function () {
            checkDeparture(aircraft)
        }, 10000);
        return;
    } else {
        //console.log(aircraft.name + " Has departed");
        var nextLocation = getIndexOfNextLocation(aircraft.path, getCurrentTime());
        if (nextLocation >= 0 && nextLocation < aircraft.path.length && aircraft.path[nextLocation].hideAircrafts) {
            mapAPI.toggleAircraftMarkerVisibility(aircraftMarkers[aircraft.aircraftId], false);
        } else {
            mapAPI.toggleAircraftMarkerVisibility(aircraftMarkers[aircraft.aircraftId], !aircraft.hide);
        }
        clearTimeout(departureCheckers[aircraft.aircraftId]);
        animateToNextLocation(aircraft, aircraftMarkers[aircraft.aircraftId].currentAircraftAzimuth, true);
    }
}

var lastZoomLevel = 0;

function addAircraftsToMap() {
    var zoomLevel = mapAPI.getZoomLevel();

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
                        selectAircraft(aircraft, aircraftMarker, aircraft.name, aircraft.type, aircraft.icon, aircraft.image, roundToMinute(aircraft.path[0].time), aircraft.infoUrl, false);
                    });
                } else {
                    // then show a new popup
                    selectAircraft(aircraft, aircraftMarker, aircraft.name, aircraft.type, aircraft.icon, aircraft.image, roundToMinute(aircraft.path[0].time), aircraft.infoUrl, false);
                }
            }
        };

        var aircraftMarker = mapAPI.createAircraftMarker(currentAircraftPosition, aircraft.name, aircraft.hide, clickCallback);
        if (aircraft.color == undefined) aircraft.color = "darkgray";
        setAircraftIcon(aircraftMarker, aircraft.icon, aircraft.aircraftId, aircraft.country, currentAircraftAzimuth, aircraft.color, zoomLevel);
        aircraftMarker.currentAircraftAzimuth = currentAircraftAzimuth;
        aircraftMarkers[aircraft.aircraftId] = aircraftMarker;
    }, this);

    // set zoom callback event
    mapAPI.setZoomCallback(function () {
        var zoomLevel = mapAPI.getZoomLevel();
        if (zoomLevel >= 9 && lastZoomLevel < 9) {
            updateAircraftIcons();
        } else if (zoomLevel < 9 && lastZoomLevel >= 9) {
            updateAircraftIcons();
        }
        lastZoomLevel = zoomLevel;
    });
}

function updateAircraftIcons() {
    var zoomLevel = mapAPI.getZoomLevel();
    aircrafts.forEach(function (aircraft) {
        var aircraftMarker = aircraftMarkers[aircraft.aircraftId];
        setAircraftIcon(aircraftMarker, aircraft.icon, aircraft.aircraftId, aircraft.country, aircraft.currentAircraftAzimuth, aircraft.color, zoomLevel);
    }, this);
}

var selectedPointId;

function selectLocation(pointId, location, marker, markerIcon, markerIconClicked, color, titleColor, subtitleColor, minimized = false) {
    if (locations[pointId].options && locations[pointId].options.liveStream) {
        $('#liveStream').attr('src', locations[pointId].options.liveStream);
    }
    
    deselectAircraft();
    selectedPointId = pointId;

    if (aerobaticShows[selectedPointId]) {
        markerIconClicked = mapAPI.setMarkerIconHtml(markerIconClicked, getHtmlWithAerobaticGlow(mapAPI.getMarkerIconHtml(markerIconClicked)));
        marker = mapAPI.setMarkerHtml(marker, getHtmlWithAerobaticGlow(mapAPI.getMarkerHtml(marker)));
    }

    mapAPI.setMarkerIcon(marker, markerIconClicked);
    selectedLocation = location;
    selectedLocationMarker = marker;
    selectedLocationMarkerIcon = markerIcon;
    mapAPI.panTo(map, location);
    
    if (locations[pointId].type === 'base') {
        showBaseLoactionPopup(pointId)
    } else {
        showLocationPopup(locations[pointId], color, titleColor, subtitleColor, minimized, setMarkerOnDeselectLocation);
    }
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

function selectInfoButtonWithoutClicking() {
    $("hr.aircraftLineSeparator").removeClass("two");
    $(".aircraftScheduleButton").removeClass("active");
    $(".aircraftInfoButton").addClass("active");

    currAircraftTab = "#aircraftInfoContent";
}
let openAircraftInfo = true;

const cur_user_agent = new UAParser();
cur_user_agent.setUA(navigator.userAgent);

function openAR(aircraft) {
    if(isIOS()){

        gtag('event', 'showAircraftIOS', {
            'event_category': 'showAircraftIOS',
            'event_label': localStorage.getItem('selectedAircraftIsUsdz') || 'default aircraft'
        });

        localStorage.setItem('selectedAircraftName', aircraft.name);
        localStorage.setItem('selectedAircraftIsUsdz', aircraft.isUsdz);

        if(!document.querySelector("#popup-bottom #checkbox").checked){

            openAircraftInfo = false;
            document.getElementById("usdz-info-popup").style.display = "block";
            document.getElementById("dim-background").style.display = "block";
            
            document.querySelector("#popup-bottom button").addEventListener('click', () =>{
                document.getElementById("usdz-info-popup").style.display = "none";
                document.getElementById("dim-background").style.display = "none";
                openAircraftInfo = true;
                if(localStorage.getItem('selectedAircraftIsUsdz')){
                    openExternal(`https://matasstorage.blob.core.windows.net/models/usdz%2F${localStorage.getItem('selectedAircraftName')}.usdz`);
                }else{
                    openExternal(`https://matasstorage.blob.core.windows.net/models/usdz%2Fbarak.usdz`);
                }
            });

        }else{
            if(localStorage.getItem('selectedAircraftIsUsdz')){
                openExternal(`https://matasstorage.blob.core.windows.net/models/usdz%2F${localStorage.getItem('selectedAircraftName')}.usdz`);
            }else{
                openExternal(`https://matasstorage.blob.core.windows.net/models/usdz%2Fbarak.usdz`);
            }
        }

    }else{
        openExternal("ar.html");
        localStorage.setItem('selectedAircraft', aircraft.name);
        arClick = false;
    }
}

function onAircraftSelected(aircraftId, collapse, showSchedule = false, showAllPoints = false) {
    onCloseOpenBasePopup()

    if(!isIOS() || (openAircraftInfo && isIOS())){
        
        var aircraft = aircrafts[aircraftId - 1];
    window.scrollTo(0, 1);

    // Manages selected tab in aircraft view
    // $("#aircraftInfoButton").click(); 
    selectInfoButtonWithoutClicking();

    selectAircraft(aircraft, aircraftMarkers[aircraftId - 1], aircraft.name, aircraft.type, aircraft.icon, aircraft.image, aircraft.path[0].time, aircraft.infoUrl, collapse, showAllPoints);

    if (showSchedule) {
        // show schedule instead of aircraft info
        $("#aircraftScheduleButton").click();
    }
    }
    
    
}

var globalCollapse;

function resizeAircraftNameIfNeeded() {
    if ($("#aircraftInfoName").height() >= $("#aircraftInfoText").height()) {
        $("#aircraftInfoName").css('fontSize', "19px");
    }
}

function selectAircraft(aircraft, marker, aircraftName, aircraftType, iconName, imageName, time, infoUrl, collapse, showAllPoints = false) {
    previousHash.push(aircraftSelectedHash);
    window.location.hash = aircraftSelectedHash;

    globalCollapse = collapse;
    deselectLocation();
    showAircraftInfoPopup(aircraft, collapse);
    fillAircraftSchedule(aircraft, showAllPoints);
    //map.panTo(location);
    //marker.setIcon(markerIconClicked);
    selectedAircraft = aircraft;
    selectedAircraftMarker = marker;
    //selectedAircraftMarkerIcon = markerIcon;
    resizeAircraftNameIfNeeded();
}


function deselectLocation(callback) {
    $('#liveStream').attr('src', $('#liveStream').attr('src'));
    if (selectedLocation != null) {
        // hide selected location
        hideLocationPopup(function () {
            setMarkerOnDeselectLocation();
            if (callback != undefined)
                callback.call(this);
        });
    }
}

function setMarkerOnDeselectLocation() {
    // set it to the previous marker icon
    if (aerobaticShows[selectedPointId]) {
        selectedLocationMarker = mapAPI.setMarkerHtml(selectedLocationMarker, getHtmlWithAerobaticGlow(mapAPI.getMarkerHtml(selectedLocationMarker)));
        selectedLocationMarkerIcon = mapAPI.setMarkerIconHtml(selectedLocationMarkerIcon, getHtmlWithAerobaticGlow(mapAPI.getMarkerIconHtml(selectedLocationMarkerIcon)));
    }

    mapAPI.setMarkerIcon(selectedLocationMarker, selectedLocationMarkerIcon);

    // mark it is deselected
    selectedLocation = null;
}

function selectPoint(pointId, minimized = false) {
    var marker = markersMap[pointId];

    var selectedPoint = locations[pointId];
    var selectedRoute = routes.find(route => route.points.find(p=> p.pointId == selectedPoint.pointId));

    // first hide the previous popup
    if (selectedLocation != null) {
        deselectLocation(function () {
            // then show a new popup
            selectLocation(pointId, convertLocation(selectedPoint.N, selectedPoint.E), marker,
                mapAPI.getMarkerIcon(selectedRoute.color, false, isPointAerobatic(pointId), selectedPoint.pointName, selectedPoint),
                mapAPI.getMarkerIcon(selectedRoute.color, true, isPointAerobatic(pointId), selectedPoint.pointName,
                selectedPoint),
                "#" + selectedRoute.color, "#" + selectedRoute.primaryTextColor,
                "#" + selectedRoute.secondaryTextColor, minimized);
        });
    } else {
        // then show a new popup
        selectLocation(pointId, convertLocation(selectedPoint.N, selectedPoint.E), marker,
            mapAPI.getMarkerIcon(selectedRoute.color, false, isPointAerobatic(pointId), selectedPoint.pointName,
            selectedPoint),
            mapAPI.getMarkerIcon(selectedRoute.color, true, isPointAerobatic(pointId), selectedPoint.pointName,
            selectedPoint),
            "#" + selectedRoute.color, "#" + selectedRoute.primaryTextColor,
            "#" + selectedRoute.secondaryTextColor, minimized);
    }
}

function onHomeButtonClick() {
    // hide about if visible
    if (aboutVisible) {
        onAboutButtonClick();
    }

    $('#quiz').animate({
        'opacity': 0
    }, 1000).css('display', 'none')

    deselectAircraft();
    deselectLocation();

    if (mapLoaded) {
        if (!currentLocationMarker) {
            mapAPI.focusOnLocation({lat: 32.00, lng: 35.00}, 8);
            showCurrentLocation();
        } else {
            selectPoint(findClosestPoint(mapAPI.getMarkerPosition(currentLocationMarker)), true);
        }
    }
}

var mapLoaded = false;

function countdown() {
    var currentTime = getCurrentTime();
    var remainingTime = new Date(realActualStartTime - currentTime);

    // Load the map three seconds before the countdown finishes
    if (remainingTime < 3500 && remainingTime > 2500) {
        $(".splash").hide();

        // Stops the gif from running more than once
        setTimeout(function () {
            $(".splash").fadeIn();
            $(".loading").fadeIn();
            loadApp();
            // cancel simulation (if enabled)
            actualStartTime = realActualStartTime;
            userSimulation = false;

            setTimeout(() => {
                $(".splash").fadeOut();
                $(".loading").fadeOut();
            }, 1000);
        }, 100);
    }

    // Time to remove the entrancePopup
    if (remainingTime < 0) {
        $("#minutes").text("00");
        $("#entrancePopup").fadeOut("slow", function () {
            $(".loading").fadeIn();
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
    return Math.floor(date.getTime() / (1000 * 60)) - getRemainingHours(date) * 60 - getRemainingDays(date) * 24 * 60;
}

function getRemainingSeconds(date) {
    return Math.round((date.getTime() - ((((((getRemainingDays(date) * 24) +
        getRemainingHours(date)) * 60) +
        getRemainingMinutes(date)) * 60) * 1000)) / 1000)
}


var countdownInterval;
var previousHash = [mainHash];
var locationPopupHash = "#locationPopup";
var clusterHash = "#cluster";
var moreInfoHash = "#moreInfo";
var aircraftScheduleContentHash = "#aircraftScheduleContent";
var aircraftInfoContentHash = "#aircraftInfoContent";
var aircraftSelectedHash = "#aircraftSelected";
var aboutHash = "#about";
var locationsHash = "#locations";
var mainHash = "#main";
var menuHash = "#menu";
var aircraftHash = "#aircraft";
var mapHash = "#map";

function onLoad() {
    if (!checkIframe()) {
        // For back button handling
        previousHash.push(mainHash);
        previousHash.push(mapHash);
        window.location.hash = mapHash;
        setTimeout(() => {
            window.location.hash = mainHash;
        }, 100);

        // if we are on online mode and it is taking too long to load - switch to offline
        if (!($.urlParam("offline") === "true")) {
            setTimeout(() => {
                // if after 45 seconds the app isn't loaded yet and there is an offline cache - start it offline
                if (!appLoaded && navigator.serviceWorker) {
                    console.log("app load is taking too long... trying to switch to offline mode.");
                    caches.open('matas').then((cache) => {
                        cache.keys().then(keys => {
                            // if there is enough cache keys loaded
                            if (keys.length > 100) {
                                // reload the page in offline mode
                                window.location = "/?offline=true";
                            }
                        });
                    });
                }
            }, 45000);
        }

        // start loading animation after 2 seconds
        setTimeout(function () {
            $(".loading").fadeIn();
        }, 2000);

        // register service worker (needed for the app to be suggested as webapp)
        registerServiceWorker();

        initMenu();
        $("#mapClusterPopup").hide();


        setTimeout(function () {
            aircrafts = [];
            loadAircrafts(function (pAircrafts) {
                aircrafts = pAircrafts;
                loadLocations(function (points) {
                    // load all routes
                    loadRoutes(function (routes) {
                        this.routes = routes;
                        loadCategories(function () {
                            updateLocationsMap(aircrafts);
                            fillMenu();
                            scheduleNoCrowdingPopup();
                            scheduleConfirmationPopup();
                        });
                    }, this);
                }, this);

                if (getCurrentTime() < realActualStartTime) {
                    countdownInterval = setInterval(function () {
                        countdown();
                    }, 1000);
                    $("#entrancePopup").fadeIn();
                }

                if (!mapLoaded) {
                    // Stops the gif from running more than once. It probably won't help because loadApp stops ui functions
                    setTimeout(function () {
                        loadApp();
                    }, 1500);
                }
            });
        }, 0);
    } else {
        window.location.replace(window.location.href.substr(0, window.location.href.lastIndexOf('/')) + "/press.html");
    }
}

function loadApp() {
    loadMapApi();
    showComponents();
    removeAircraftsFromLocation();
}

function loadMapApi() {
    mapAPI = googleMaps;
    $.ajaxSetup({cache: true});
    if (!mapLoaded) {
        if ($.urlParam("offline") === "true") {
            mapAPI = leafletMaps;
            mapLoaded = true;
            initMap();
        } else {
            // check if an internet connection is available (by fetching non-cache file)
            fetch("data/test-connection.json?t=" + new Date().getTime()).then((response) => {
                // if there is a connection - load google maps
                $.getScript(mapAPI.MAP_URL, function () {
                    mapLoaded = true;
                    gtag('event', 'map_loaded', {
                        'event_category': 'maps',
                        'event_label': window.location.href
                    });
                });
            }).catch((err) => {
                console.warn("no internet connection - working offline");
                gtag('event', 'offline_mode', {
                    'event_category': 'maps',
                    'event_label': window.location.href
                });
                // if there is no connection - load leaflet maps (offline)
                mapAPI = leafletMaps;
                mapLoaded = true;
                initMap();
            });
        }
    }

    $.ajaxSetup({cache: false});
}

function isNotHiddenAtLeastInOneRoute (location) {
    let isExists = false;
    routes?.forEach(route => {
        route.points?.forEach(point => {
            if(location.pointId === point.pointId)
                if(!point.hidden)
                    isExists = true;
        })
    });
    return isExists;
}

function showComponents() {
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
var currMenuTab = "#locations";
var currAircraftTab = "#aircraftInfoContent";
var $menuHamburger;
var $aboutExit

function toggleListView(event, shouldOnlyToggleClose = false) {
    if (aboutVisible) {
        $("#aboutPopup").fadeOut();
        $("#aboutMenuTitle").fadeOut("fast", function () {
            $("#headerIcon").fadeIn();
        });
        $("#aboutButton").attr("src", "icons/aboutIcon.png");
        aboutVisible = false;
    } else if (canOpenMenu) {
        canOpenMenu = false;
        if (isMenuOpen) {
            $menuHamburger.toggleClass("is-active");
            closeMenu();
        } else {
            if (shouldOnlyToggleClose) {
                canOpenMenu = true;
                return;
            } else {
                $menuHamburger.toggleClass("is-active");
                closeAllPopups();
                openMenu();
                fillMenu();
            }
        }
    }
}

function exitAbout(event) {
    alert("work")
}

var searchOpen = false;
var listViewHeight;

function displaySearchView() {
    if (!searchOpen) {
        searchOpen = true;
        $(".search-input").width("65%");
        setTimeout(() => {
            $("#search-back-button").show();
        }, 400);

        $(".search-input").css({
            "background": "white",
            "font-family": "Heebo-Regular",
            "font-weight": 600
        });
        $("#search-prompt").hide();
        $('.tabs #search').show().siblings().hide();
        $('.menuHeader').show().hide("fast");


        listViewHeight = $("#listView").height();

        $("#listView").animate({height: "100%"}, "fast");

        var searchViewHtml = "";

        if (shouldShowTypeCategory("base")) {
            // add bases
            searchViewHtml += createCategoryRow({category: "ׁׁבסיסים"}, true);
            sortedLocations.forEach(function (location) {
                if (location.type === 'base') {
                    searchViewHtml += createLocationRow(location, false, true);
                }
            }, this);
        }


        if (shouldShowTypeCategory("hospital")) {
            // add bases
            searchViewHtml += createCategoryRow({category: "נקודות תצפית"}, true);

            sortedLocations.forEach(function (location) {
                if (!location.hidden && location.type && location.type === "hospital") {
                    searchViewHtml += createLocationRow(location, false, true);
                }
            }, this);
        }

        // add other locations category
        searchViewHtml += createCategoryRow({category: "יישובים"}, true);
        sortedLocations
        .filter(location => !location.hidden || isNotHiddenAtLeastInOneRoute(location))
        .filter(firstContainintRoute) // has containing route
        .filter(location => location.type !== "base" && location.type !== "hospital")
        .forEach(function (location) {
                    searchViewHtml += createLocationRow(location, false, true);
            
        });

        // add aircrafts category
        searchViewHtml += createCategoryRow({category: "כלי טיס"}, true);
        Array.from(aircraftMap.values())
            .sort((aircraft1, aircraft2) => {
                return aircraft1.name.localeCompare(aircraft2.name);
            })
            .forEach(function (aircraft) {
                searchViewHtml += createTableRow(aircraft.aircraftId,
                    aircraft.name,
                    aircraft.icon,
                    aircraft.type,
                    aircraft.path[0].time,
                    aircraft.aerobatic,
                    aircraft.special,
                    true,
                    false);

            });

        $("#search-view").html(searchViewHtml);
        $("#search-view").show();

        // Don't know where the 20 came. But we need it
        $(".tabs").height($("#listView").height() - $("#search-bar").height() + 20);
    }
}

function hideSearchView() {
    if (searchOpen) {
        searchOpen = false;
        $(".search-input").css({
            "background": "#1b223a",
            "font-family": "Heebo-Regular",
            "font-weight": 600
        });
        $(".search-input").val("");
        $("#search-back-button").hide();
        $("#search-clear-button").hide();

        setTimeout(() => {
            $(".tabs").height(tabsHeight);
            $("#listHeader #search-bar").siblings().show();
            $('.tabs ' + currMenuTab).show().siblings().hide();
        }, 10)

        setTimeout(() => {
            $(".search-input").width("100%");
        }, 100)

        setTimeout(() => {
            $("#listView").animate({height: listViewHeight + "px"});
        }, 200);

    }
}

var search_GA_report_timeout;
function search_GA_report(needle) {
    if(search_GA_report_timeout){ clearTimeout(search_GA_report_timeout);}
    search_GA_report_timeout = setTimeout(function() {
        gtag('event', 'search', {
            'event_category': 'search',
            'event_label': needle
        });
    }, 500); // wait 0.5 seconds before submitting the search term to google analitycs
}

function initSearchBar() {
    // Search bar code
    $(".search-input").focus(function () {
        displaySearchView();
    });

    $(".search-input").keyup(function () {
        displaySearchView();
        var searchInput = $(this).val();

        if (searchInput.length > 0) {
            // Display relevant search view
            $("#search-clear-button").show();
            
            search_GA_report(searchInput)
            
        }

        var resultsHtml = "";
        var basesResults;
        var citiesResults;
        var aircraftResults;
        var viewPointResults;

        // Filtering relevant bases
        basesResults = sortedLocations.filter(location => {
            return  location.type == 'base';
        }).filter(location => location.pointName.includes(searchInput));
 
        if (basesResults.length > 0) {
            // Create location category only if we have location results
            resultsHtml += createCategoryRow({category: "בסיסים"}, true);

            // Populate location results
            basesResults.forEach(function (location) {
                resultsHtml +=
                    createLocationRow(location, false, true);
            }, this);
        }

        viewPointResults = sortedLocations.filter(location => {
            return  location.type === 'hospital' && location.pointName.includes(searchInput)
        });
        if (viewPointResults.length > 0) {
            // Create location category only if we have location results
            resultsHtml += createCategoryRow({category: "נקודות תצפית"}, true);

            // Populate location results
            viewPointResults.forEach(function (location) {
                resultsHtml +=
                    createLocationRow(location, false, true);
            }, this);
        }

        // Filtering relevant locations
        citiesResults = sortedLocations
            .filter(location => !location.hidden || isNotHiddenAtLeastInOneRoute(location))
            .filter(location => location.type !== "base" && location.type !== "hospital")
            .filter(location => location.pointName.includes(searchInput));

        if (citiesResults.length > 0) {
            // Create location category only if we have location results
            resultsHtml += createCategoryRow({category: "יישובים"}, true);

            // Populate location results
            citiesResults.forEach(function (location) {
                resultsHtml +=
                    createLocationRow(location, false, true);
            }, this);
        }

        aircraftResults = Array.from(aircraftMap.values()).
            filter(aircraft => aircraft.name.includes(searchInput) ||
                               aircraft.type.includes(searchInput) ||
                               (aircraft.special && aircraft.special.includes(searchInput)));

        if (aircraftResults.length > 0) {
            // Create location category only if we have location results
            resultsHtml += createCategoryRow({category: "כלי טיס"}, true);

            // Populate aircraft results
            aircraftResults.sort((aircraft1, aircraft2) => {
                return aircraft1.name.localeCompare(aircraft2.name);
            })
            .forEach(function (aircraft) {
                resultsHtml += createTableRow(aircraft.aircraftId,
                    aircraft.name,
                    aircraft.icon,
                    aircraft.type,
                    aircraft.path[0].time,
                    aircraft.aerobatic,
                    aircraft.special,
                    true,
                    false);
            });
        }

        if (aircraftResults.length > 0 || citiesResults.length > 0 || basesResults.length > 0 || viewPointResults.length >0) {
            $("#search-prompt").hide();
            $("#search-view").show();
            $("#search-view").html(resultsHtml);
        } else {
            $("#search-prompt").show();
            $("#search-view").hide();
        }

    });

    $("#search-clear-button").click(function () {
        $(".search-input").val('');
        $(".search-input").focus();
        $("#search-clear-button").hide();
        $(".search-input").keyup();
        gtag('event', 'search', {
            'event_category': 'search clear',
            'event_label': 'search clear'
        });
    });

    $("#search-back-button").click(function () {
        hideSearchView();
        gtag('event', 'search', {
            'event_category': 'search clear',
            'event_label': 'search back (hide)'
        });
    });
}

var currentAttrValue;
var tabsHeight;
var attemptToExit = false;

window.onhashchange = (e) => {
    var currentHash = e.newURL.substr(e.newURL.lastIndexOf("#"), e.newURL.length);
    var previousHashValue = previousHash.pop();

    if (currentHash === previousHashValue) {
        previousHash.push(previousHashValue);
    }

    if (currentHash === "/" && previousHashValue !== "/") {
        closeAllPopups();
    }

    
    // Should close the menu
    else if ((previousHashValue === menuHash || previousHashValue === locationsHash) && (currentHash === mainHash || currentHash === "/")) {
        $("#menuHamburger").click();
    } else if (previousHashValue === locationsHash && currentHash === aircraftHash) {
        // Should toggle between locations and aircraft
        $("#aircraftLink").click();
    } else if (previousHashValue === aircraftHash && (currentHash === locationsHash || currentHash === menuHash)) {
        // Should toggle between aircraft and locations
        $("#locationsLink").click();
    } else if (previousHashValue === aboutHash && currentHash !== aboutHash) {
        if (aboutVisible) {
            previousHash.push(mainHash);
            $("#aboutPopup").fadeOut();
            aboutVisible = false;
        }
    // Aircraft info popup section
    } else if ((previousHashValue === aircraftSelectedHash || previousHashValue === aircraftInfoContentHash) &&
        currentHash !== aircraftSelectedHash &&
        currentHash !== aircraftInfoContentHash &&
        currentHash !== aircraftScheduleContentHash && globalCollapse) {
        $("#shrinkAircraftInfoPopup").click();
        hideAircraftInfoPopup();
        if (currentHash !== menuHash) {
            previousHash.pop();
        }
    } else if (previousHashValue === aircraftSelectedHash &&
        currentHash !== aircraftSelectedHash &&
        currentHash !== mainHash && !globalCollapse) {
        hideAircraftInfoPopup();
    } else if (previousHashValue === aircraftInfoContentHash && currentHash === aircraftSelectedHash) {
        hideAircraftInfoPopup();
    } else if (previousHashValue === aircraftInfoContentHash && (currentHash === aircraftScheduleContentHash)) {
//      || currentHash === aircraftSelectedHash)) {
        $("#aircraftScheduleButton").click();
    } else if (previousHashValue === aircraftScheduleContentHash && (currentHash === aircraftInfoContentHash || currentHash === aircraftSelectedHash || currentHash === moreInfoHash)) {
        $("#aircraftInfoButton").click();
    } else if (previousHashValue === moreInfoHash && currentHash !== moreInfoHash) {
        $("#shrinkAircraftInfoPopup").click();
    }
    // Cluster section
    else if (previousHashValue === clusterHash && currentHash !== clusterHash) {
        closeAllPopups();
    }
    // Location popup
    else if (previousHashValue === locationPopupHash && currentHash !== locationPopupHash) {
        closeAllPopups();
    }
};

function initMenu() {
    $menuHamburger = $("#menuHamburger");
    $aboutExit = $("#aboutExitLogo");
    $("#listView").height("100%");
    var listViewHeight = $("#listView").height();
    var headerHeight = $("#headerBg").height();
    var listHeaderHeight = $("#listHeader").height();

    $("#listView").height(listViewHeight - headerHeight + "px");
    // 5 is shadow box height
    tabsHeight = listViewHeight - headerHeight - listHeaderHeight - 5;
    $(".tabs").height(tabsHeight + "px");

    // Responsible for opening the side menu
    $menuHamburger.on("click", toggleListView);
    $aboutExit.on("click", toggleListView);
    initSearchBar();

    // Responsible for managing the tabs
    $(".menuLink").on("click", function (elem) {
        $(".menuLink").removeClass("active");
        $(elem.target).addClass("active");
        currentAttrValue = $(this).attr('href');
        previousHash.push(currentAttrValue);
        if (currMenuTab != currentAttrValue) {
            $("hr").toggleClass("two");
        }

        currMenuTab = currentAttrValue;
        $('.tabs ' + currentAttrValue).show().siblings().hide();
    });

    // Responsible for managing aircraft info tabs
    $(".aircraftMenuLink").on("click", function (elem) {
        manageAircraftTabs(elem);
    });

    $("#showScheduleButton").on("click", toggleListView);
    $("#showMapButton").on("click", closeEntrancePopup);
}

function openMenu() {
    // For back button handling
    previousHash.push("#menu");
    $("#listView").css({"transform": "translateX(0)"});
    isMenuOpen = true;
    setTimeout(function () {
        canOpenMenu = true
    }, 300);
}

function closeMenu() {
    previousHash.push("#main");
    $("#listView").css({"transform": "translateX(100%)"});
    isMenuOpen = false;
    setTimeout(function () {
        canOpenMenu = true
    }, 300);

}

function loadCategories(callback) {
    getEnv((env) => {
        $.getJSON(`${config.apiURL}/${env}/categories.json?t=` + (new Date()).getTime(), function (pCategories) {
            categories = pCategories;
            callback();
        });
    });
}

function createCategoryRow(category, isBlue) {
    return "<div class='aircraftCategory " + (isBlue ? "categoryBlue" : "") + "'>" + category.category + "</div>"
}

function createLocationPopupCategoryRow(name) {
    return "<div class='aircraftLocationCategory'>" + name + "</div>"
}

var aircraftMap;

function fillMenu() {
    
    var html = "";
    aircraftMap = new Map();

    // Creates a map that maps an aircraft's name (which is basically a group for all the aircraft's with the same name)
    // to it's object which is the first of its kind. For example, if we have four F15, the map will contain the first one only.
    aircrafts.forEach(function (aircraft) {
        // if (map.get(aircraft.name)) {
        //     if (convertTime(aircraft.path[0].time) < convertTime(map.get(aircraft.name).path[0].time)) {
        //         map.set(aircraft.name, aircraft);
        //     }
        // } else {
        //     map.set(aircraft.name, aircraft);
        // }
        if (!aircraftMap.has(aircraft.name))
            aircraftMap.set(aircraft.name, aircraft);
    });

    if (categories.length === 0) {
        return;
    }


    categories.forEach(function (category) {
        var categorizedAircrafts = [].concat(aircrafts);
        if (category.special) {
            // Get aircraft relevant for category, sort them,
            // and make sure that if there is a date - It is in the future (Prevents past rehearsals being shown)
            var categoryAircrafts =
                categorizedAircrafts.filter(aircraft => aircraft.special === category.category)
                    .sort((aircraft1, aircraft2) => {
                        return aircraft1.name > aircraft2.name ? 1 : aircraft1.name < aircraft2.name ? -1 : 0;
                    })
                    .filter(categoryAircraft =>
                        categoryAircraft.path.find(point =>
                            getCurrentTime() <= convertTime(point.date, point.time)));
            if (categoryAircrafts.length > 0) {
                
                html += createCategoryRow(category, category.special);
                var prevAircraftTypeId = -1;
                categoryAircrafts.forEach(categoryAircraft => {
                    if (categoryAircraft.aircraftTypeId !== prevAircraftTypeId) {
                        var date = undefined;

                        if (categoryAircraft.path.find(point => point.date)) {
                            var split = categoryAircraft.path.find(point => point.date).date.split('-');
                            date = split[2] + "/" + split[1] + "/" + split[0].substr(2, 2);
                        }

                        html += createTableRow(categoryAircraft.aircraftId,
                            categoryAircraft.name,
                            categoryAircraft.icon,
                            categoryAircraft.type,
                            categoryAircraft.time,
                            categoryAircraft.aerobatic || category.category === "מופעים אווירובטיים" || category.category === "חזרות",
                            categoryAircraft.special,
                            true,
                            false,
                            date,
                            true,
                            categoryAircraft.category === "מופעים קרקעיים",
                        );
                        prevAircraftTypeId = categoryAircraft.aircraftTypeId;

                        // var categoryLocations = [].concat.apply([], categorizedAircrafts.filter(aircraft => aircraft.aircraftTypeId===categoryAircraft.aircraftTypeId && aircraft.special === category.category)
                        //     .map(aircraft => aircraft.path));
                        //
                        // categoryLocations.forEach(location => {
                        //     html += createCategoryLocationRow(locations[location.pointId],
                        //         location.time, location.from);
                        // });
                    }
                });
            }
        } else {
            aircraftsForCategory = Array.from(aircraftMap.values()).filter(aircraft =>
                aircraft.category === category.category)
                .sort((aircraft1, aircraft2) => {
                    return aircraft1.path[0].time - aircraft2.path[0].time
                })
                .filter(categoryAircraft =>
                    categoryAircraft.path.find(point =>
                        (point.date && new Date(point.date) > new Date())
                        || !point.date));

            if (aircraftsForCategory.length > 0) {
                
                html += createCategoryRow(category, category.special);
                aircraftsForCategory.forEach(function (aircraftFromCategory) {
                    html += createTableRow(aircraftFromCategory.aircraftId,
                        aircraftFromCategory.name,
                        aircraftFromCategory.icon,
                        aircraftFromCategory.type,
                        aircraftFromCategory.path[0].time,
                        aircraftFromCategory.aerobatic,
                        aircraftFromCategory.special,
                        true,
                        false,
                        undefined,
                        false,
                        true);

                });
            }
        }
    });

    $("#aircraftsListView").html(html);

    // prepare locations view
    var locationsViewHtml = "";

    // sort locations by name
    sortedLocations = locations.slice();
    

    sortedLocations.sort(function (item1, item2) {
        var keyA = item1.pointName,
            keyB = item2.pointName;

        // Compare the 2 times
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    });

    var currTime = getCurrentTime();

    if (shouldShowTypeCategory("base")) {
       // var airpalnesOnBasesCount = 0;
        
        // add bases
       /* locations.forEach(function (location) {
            if (location.pointName.includes('בסיס')) {
                airpalnesOnBasesCount += location.aircrafts.length;
            } 
        }, this); */

        //if (airpalnesOnBasesCount > 0)
            locationsViewHtml += createCategoryRow({category: "בסיסים"}, true);
            sortedLocations
                .filter(location => location.type === 'base')
                .forEach(function (location) {
                    locationsViewHtml += createBaseCategory(location); 
                }, this); 
    }

    if (shouldShowTypeCategory("hospital")) {
        // add view points
        locationsViewHtml += createCategoryRow({category: "נקודות תצפית"}, true);

        sortedLocations.forEach(function (location) {
            if ( location.type === 'hospital') {
                locationsViewHtml += createLocationRow(location, false);
            }
        }, this);
    }

    // add cities
    locationsViewHtml += createCategoryRow({category: "יישובים"}, true);
    sortedLocations
    .filter(location => isNotHiddenAtLeastInOneRoute(location) || !location.hidden) // not hidden
    .filter(firstContainintRoute) // has route
    .filter(location => location.type !== 'base') // not base
    .filter(location => location.type !== 'hospital') // not a viewpoint
    .forEach(function (location) {
                locationsViewHtml += createLocationRow(location, false);
    });


    $("#locationsListView").html(locationsViewHtml);
}

function makeTwoDigitTime(t) {
    if (t < 10) {
        return "0" + t.toString();
    } else {
        return t.toString();
    }
}

function roundToMinute(time) {
    var hour = time.substr(0, 2);
    var minute = time.substr(3, 2);
    var second = time.substr(6, 2);
    var h = parseInt(hour);
    var m = parseInt(minute);
    var s = parseInt(second);
    if (s > 39) {
        m = m + 1;
        if (m >= 60) {
            h = h + 1;
            m = m - 60;
        }
    }
    return makeTwoDigitTime(h) + ":" + makeTwoDigitTime(m);
}

function areNotificationsAvailable() {
    return (areNotificationsPossible() && Notification.permission === "granted");
}

function areNotificationsPossible() {
    return ('Notification' in window);
}

function scheduleConfirmationPopup() {
    let messageBody = 'אם ברצונך לקבל הודעה בדבר זמני המופעים הקרובים עליך לאשר את ההתראות';

    //  Getting permissions for notifications if we haven't gotten them yet
    if (areNotificationsPossible()) {
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            setTimeout(function () {
                showConfirmationPopup();
            }, 15000);
        } else if (Notification.permission === "granted") {
            registerToFirebaseNotifications();
        }
    }
}


function scheduleNoCrowdingPopup() {
    if (config.showCrowdingWarnings) {
        setTimeout(function () {
            showNoCrowdingPopup();
        }, 30000);
    }
}

function getISODate(date) {
    return new Date(date).toISOString().split('T')[0];
}

function initGenericPopups() {
    
    if (userSimulation) {
        showGenericPopup("מחממים מנועים!", "המטוסים המופיעים על המפה לפני המטס הינם הדמייה בלבד", undefined, null, () => {
        });
    } else if (getCurrentTime() >= realActualStartTime - 4 * 60 * 60 * 1000 && getCurrentTime() <= realActualStartTime + 3 * 60 * 60 * 1000) {
        if (!changes) {
            let displayed = "false";
            if (localStorage)
                displayed = localStorage.getItem("good_morning_displayed_2022");
            if (!(displayed === "true")) {
                showGenericPopup("בוקר כחול לבן!", `השמיים מושלמים למטס. <br> בואו לחגוג איתנו :)`, "flightStartIcon", () => {
                });
                if (localStorage)
                    localStorage.setItem("good_morning_displayed_2022", "true");
            }
        } else {
            showGenericPopup("עקב תנאי מזג האוויר", `חלו שינויים קלים בנתיבים ובמופעים, אך אנחנו עדיין באים! (: חג שמח!`, "flightStartChangesIcon", () => {
            });
        }
        setTimeout(() => {
            showGenericPopup("בזמן שאתם ממתינים...", "הבאנו את מטוסי החיל אליכם,<br>בואו לצפות במטוסים אצלכם בסלון", "arIcon", "ar.html");
        }, 10*1000);
    } else {
        var timeToFlightEnd = new Date(realActualStartTime).addHours(6) - new Date();
        if (timeToFlightEnd < 0) {
            timeToFlightEnd = 0;
        }

        setTimeout(() => {
            showGenericPopup("נתראה בשנה הבאה!", `מקווים שנהניתם מהמטס. <br> חג עצמאות שמח! :)`, "flightEndIcon");
        }, timeToFlightEnd);
    }

    var timeToNotifyOfek = new Date(realActualStartTime).addHours(2.5) - new Date();

    if (timeToNotifyOfek > 0) {
        setTimeout(() => {
            showGenericPopup("חג עצמאות שמח!",
                ` אנשי יחידת אופק 324 מתרגשים לחגוג אתכם את יום העצמאות ה-74!`,
                "ofekIcon",
                "https://bit.ly/2PQAoVY");
        }, timeToNotifyOfek);
    }
}

function initMap() {
    mapAPI.loadPlugins(() => {
        // make it larger than screen that when it scrolls it goes full screen
        makeHeaderSticky();
        initPopups();
        initGenericPopups();
        // } else if (new Date() >= )

        if (true) {
            // let splash run for a second before start loading the map
            setTimeout(function () {
                map = mapAPI.createMapObject(function (e) {
                    closeAllPopups();
                });
                $("#map").show();

                mapAPI.drawRoutesOnMap(routes);
                addAircraftsToMap();
                startAircraftsAnimation(false);

                // hide splash screen - wait few milliseconds so the map can be loaded
                let waitForMap = setInterval(() => {
                    if ($("#map:visible").length === 1) {
                        clearInterval(waitForMap);
                        $(".splash").fadeOut();

                        // load cache of all aircraft types icons
                        let loadedAicrafts = {};
                        aircrafts.forEach((aircraft) => {
                            if (!loadedAicrafts[aircraft.icon]) {
                                $("#aircraftImgCache").append(`<img id="${aircraft.icon}" src="icons/aircrafts/${aircraft.icon}.svg" class="imageCache"></img>`);
                                loadedAicrafts[aircraft.icon] = true;
                            }
                        });

                        // request service worker to load all of the cache
                        if (navigator.serviceWorker && navigator.serviceWorker.controller)
                            navigator.serviceWorker.controller.postMessage({action: "loadCache"});

                        appLoaded = true;
                    }
                }, 100);

                //             $(window).focus(function () {
                // //                 startAircraftsAnimation(true);
                //             });


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
            setTimeout(function () {
                $(".splash").fadeOut();
                window.location.replace(window.location.href + "press.html");
            }, 0);
        }
        if ( navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({name: 'geolocation'}).then(function(PermissionStatus) {
                if (PermissionStatus.state === 'prompt') {
                    PermissionStatus.onchange = function(){
                        gtag('event', 'permission_set', {
                            'event_category': 'geo_location',
                            'event_label': this.state
                        });
                    }
                }
            })
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                gtag('event', 'permission_set', {
                    'event_category': 'geo_location',
                    'event_label': this.state
                });
            })
        }
    });
}

function closeEntrancePopup() {
    clearInterval(countdownInterval);
    var ep = $("#entrancePopup");
    if (ep.css("display") !== "none") {
        ep.fadeOut();
        getMapUndark();
    }
}

function getAerobaticsPoints() {
    return [].concat(aircrafts.filter(aircraft => aircraft.aerobatic).map(aircraftObj => aircraftObj.path.map(point => point.pointId)).flat(),
                     aircrafts.map(aircraft => aircraft.path.filter(point => point.special === "מופעים אוויריים").map(point => point.pointId)).flat());
}

var pointsWithShows = [];

function getAllPointsWithShows() {
    if (!pointsWithShows) {
        pointsWithShows = [].concat.apply([], aircrafts.filter(aircraft => {
            return (aircraft.aerobatic || aircraft.specialInPath ||
                aircraft.special === "מופעים אוויריים");
        }).map(aircraftObj => aircraftObj.path.map(point => point.pointId)));
    }

    return pointsWithShows;
}

function isPointAerobatic(pointId) {
    if (!aerobaticPoints) {
        aerobaticPoints = getAerobaticsPoints();
    }

    return aerobaticPoints.includes(pointId);
}

function isAircraftAerobatic(aircraftId) {
    return (aircrafts[aircraftId].aerobatic || aircrafts[aircraftId].specialInPath === "מופעים אוויריים")
}

function getEventName(aerobatic, special1, special2) {
    if (aerobatic)
        return "מופע אווירובטי";
    else if (special1 === "מופעים אוויריים")
        return "מופע אווירי";
    else if (special2 === "מופעים אוויריים")
        return "מופע אווירי";
    else {
        return "מופע";
    }
}

function getEventDescription(isAerobatics, locationName, minutes) {
    var desc = 'יחל ב';
    return `${desc}${locationName} בעוד ${minutes} דקות`;
}



(function() {
    var userLoc = null;
    navigator.geolocation.watchPosition(function(newLoc){
        userLoc = newLoc;
        userLoc = {lon: userLoc.coords.longitude, lat: userLoc.coords.latitude};
    });

    function notifyUserIfNear(currentLocation, aircraft) {
        if (userLoc) {
            
            currentLocation = {lon: currentLocation.lng, lat: currentLocation.lat};



            if (haversineDistance(userLoc,currentLocation) < 3) {
                    if($('#myModal:hidden') && $('#gottoVoiceMessagePopup')[0].style.display == "none") {

                        //Checking weather audioMessages is not undifined    
                        //and if audio message for aircraftType is available 
                        var audioMessageAvailable =(audioMessages &&
                            aircraft.aircraftTypeId in audioMessages && 
                            audioMessages[aircraft.aircraftTypeId]["audioSrc"] );
                        
                        //Close popup sooner 
                        var closePopupTime = audioMessageAvailable ? 60 : 30;
                        
                        //Adding to array so the user won't get notifed twice  
                        notifiedNearUser.push(aircraft.aircraftTypeId);

                        //Closing popup After closePopupCount seconds
                        setTimeout(()=>{$('#gottoVoiceMessagePopup').hide();},1000*closePopupTime);

                        if(aircraft.icon){
                            $("#aircraftImg").attr("src",`icons/aircrafts/${aircraft.icon}.svg`);
                        }
                        else{
                            $("#aircraftImg").attr("src",`icons/genericAircraft.svg`);
                        }
                        $("#gottoVoiceMessagePopup")[0].style.display = "block";
                        //Change type and name if efroni to aerobatic team 
                        if (aircraft.name === 'עפרוני'){
                            $("#aircraftName").html(`הצוות האוירובטי - עפרוני`);
                        }
                        else{
                             $("#aircraftName").html(`${aircraft.type} - ${aircraft.name}`);
                        }
                        
                        $("#aircraftTime").html("יעבור מעלייך בקרוב 👏");
                        
                        if (audioMessageAvailable){
                            $("#hearTheMessage").show()
                            notifyAudioMessage(aircraft)      
                        }

                        else {
                            $("#hearTheMessage").hide()
                        }
                    }
            }
            
        }
    }

    window.notifyUserIfNear = notifyUserIfNear;
})();


function notifyAudioMessage (aircraft) {
    let audioMessage = audioMessages[aircraft.aircraftTypeId];
    gtag('event', 'audioMessage', {
        'event_category': 'audioMessage',
        'event_label': 'airfract ' + aircraft.name
    });
    $("#youHaveVoicemessage").html("יש לך הודעה קולית מהטייס!");
    $("#voiceMessageImg").attr('src',"icons/voiceMessage/dictation_glyph.png");
    $('#audioMessageText').html(audioMessage.text);


    $('#audioSRC').on('playing', function () {
        $('#audioMessagePlayPause').attr('src', 'icons/pause.svg')
    });
    $('#audioSRC').on('pause', function () {
        $('#audioMessagePlayPause').attr('src', 'icons/play.svg')
    });
    
    $('#audioSRC').on('ended', function () {
        $('#audioSRC')[0].currentTime = 0
    });

    if(audioMessage.audioSrc){
        $("#audioSRC").attr("src",audioMessage.audioSrc);
    }
    else{
        $("#audioSRC").attr("src",'audio/efroni.mp3');
    }
}




// taken from https://stackoverflow.com/questions/14560999/using-the-haversine-formula-in-javascript
function haversineDistance(coords1, coords2) {
    function toRad(x) {
        return x * Math.PI / 180;
    }

    var lon1 = coords1.lon;
    var lat1 = coords1.lat;

    var lon2 = coords2.lon;
    var lat2 = coords2.lat;

    var R = 6371; // km

    var x1 = lat2 - lat1;
    var dLat = toRad(x1);
    var x2 = lon2 - lon1;
    var dLon = toRad(x2)
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;

    return d;
}

if (Cookies.get('seen_welcome_2021') != '1') {
    
    // $('.new-popup').show()
    $('.new-popup button, .new-popup .quiz, .new-popup .ar').on('click', () => {
        // $('.new-popup').fadeOut(200);
        Cookies.set('seen_welcome_2021', '1', { expires: 10000});
    })
    $('.new-popup .ar').on('click', ()=>openAR());
};


function isIOS() {
    return [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod'
    ].includes(navigator.platform)
        // iPad on iOS 13 detection
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

