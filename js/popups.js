const { point } = require("leaflet");


var locationPopupExpanded = false;
var locationPopupCloseCallback = null;
var minimizedLocationPopupHeight = 100;
var locationPopupHeight = 200;

function initPopups() {
    $("#locationPopup").hide();
    $("#aircraftInfoPopup").hide();
    $("#basePopup").hide();

    // handle touch events on popups
    var popupHeader = $("#popupHeader");
    var locationPopup = $("#locationPopup");
    var aircraftListContainer = $("#aircraftListContainer");
    var normalHeight = 200;

    // popupHeader.on("click", function(event) {
    //     if (!locationPopupExpanded) {
    //         var maxHeight = Math.min($("#map").height(), $("#aircraftsList").height() + 50);
    //
    //         aircraftListContainer.animate({height: maxHeight - 50 + "px"}, "fast");
    //         locationPopup.animate({height: maxHeight + "px"}, "fast");
    //         locationPopupExpanded = true;
    //     } else {
    //         var maxHeight = normalHeight;
    //
    //         aircraftListContainer.animate({height: maxHeight - 50 + "px"}, "fast");
    //         locationPopup.animate({height: maxHeight + "px"}, "fast");
    //         locationPopupExpanded = false;
    //     }
    //     event.preventDefault();
    // });

    var dragStartTopY;
    var currHeight;
    var maxHeight;
    var delta;

    popupHeader.on("tapstart", function (event) {
        dragStartTopY = event.touches[0].clientY;
        currHeight = locationPopup.height();
        maxHeight = $("#map").height();
        event.preventDefault();
    });

    popupHeader.on("tapmove", function (event) {
        if (dragStartTopY != null) {
            delta = dragStartTopY - event.touches[0].clientY;
            var targetHeight = currHeight + delta;
            if (targetHeight >= maxHeight) {
                targetHeight = maxHeight;
            }

            locationPopup.height(targetHeight);
            aircraftListContainer.height(targetHeight - 50);
            event.preventDefault();
        }
    });

    popupHeader.on("tapend", function (event) {
        if (dragStartTopY != null) {
            var targetHeight = currHeight + delta;
            if (targetHeight < 100) {
                hideLocationPopup(null);
                getMapUndark();
                if (locationPopupCloseCallback != null)
                    locationPopupCloseCallback.call(this);
            } else if (targetHeight >= 0.5 * maxHeight) {
                locationPopup.animate({ height: maxHeight + "px" }, "fast");
                aircraftListContainer.animate({ height: maxHeight - 50 + "px" }, "fast");
            } else {
                locationPopup.animate({ height: normalHeight + "px" }, "fast");
                aircraftListContainer.animate({ height: normalHeight - 50 + "px" }, "fast");
            }
            dragStartTopY = null;
        }
    });

}

//on close for openBasePopup
function onCloseOpenBasePopup() {
    let basePopUpElement = $("#open-bases-popup");
    let fullHeight = window.innerHeight;
    let fullWidth = window.innerWidth;

    if( fullWidth <= 600 ) {
        basePopUpElement.animate({
            top: fullHeight + "px",
            height: "0px",
        }, "fast");
    } else {
        basePopUpElement.animate({
            left: `-${fullWidth}px`,
        }, "fast");
    }

}


function onGrab(event) {
    let headerHeight = document.getElementById('headerBg').clientHeight;
    let windowFullSize = window.innerHeight - headerHeight;
    let currentPosition =  windowFullSize - event.changedTouches[0].clientY;
    let popupMinimizedPosition = document.getElementById(`headerBg`).clientHeight + (document.getElementById(`map`).clientHeight * 0.55);
    let openBasePopupPosition = Number(document.getElementById('open-bases-popup').style.top.replace("px", ""));
    let dragPopUpElement = document.getElementById('header-base-popup');
    let bottomArea = windowFullSize * 0.4;
    let topArea = windowFullSize * 0.7;

    //phone onDrag event for open bases
    dragPopUpElement.addEventListener("touchmove", (event) => {

        document.getElementById('open-bases-popup').style.top = `${event.changedTouches[0].clientY}px`;

        if (currentPosition <= bottomArea) {
            document.getElementById('open-bases-popup').style.setProperty("overflow", "hidden");
        } else if (currentPosition > bottomArea && currentPosition <  topArea) {
            document.getElementById('open-bases-popup').style.setProperty("overflow", "hidden");
        } else {
            document.getElementById('open-bases-popup').style.setProperty("overflow", "scroll");
        }
    });
    
    //phone onDrag event for open bases
    dragPopUpElement.addEventListener("touchend", (event) => {
        if (currentPosition <= bottomArea) {
            document.getElementById('open-bases-popup').style.top = `${windowFullSize + headerHeight}px`;
        } else if (currentPosition > bottomArea && currentPosition < topArea) {
            document.getElementById('open-bases-popup').style.top = `${popupMinimizedPosition}px`;
        } else {
            document.getElementById('open-bases-popup').style.top = `${headerHeight}px`;
        }
    });
}

loadOpenBasesLocation();


function showBaseLoactionPopup(pointId) {
    onCloseOpenBasePopup()
    deselectLocation()
    deselectAircraft()

    let point;

    baseData.forEach(element => {
        if (element.pointId === Number(pointId)) {
            point = element;
        }
    })


    let basePopUpElement = $("#open-bases-popup");
    let fullHeight = window.innerHeight;
    let fullWidth = window.innerWidth;
    const headerElement = document.getElementById(`headerBg`);
    const navBarHeaderElement = document.getElementById(`listHeader`);
    const mapElement = document.getElementById(`map`);
    let airplaneShowsElement = document.getElementById('airplanes-show');
    let html;

    if( fullWidth <= 600 ) {
        basePopUpElement.animate({
            height: fullHeight + "px",
            top: `${headerElement.clientHeight+(mapElement.clientHeight * 0.4)}px`,
        }, "fast");
    } else {
        document.getElementById('drag-button').style.display = 'none';
        basePopUpElement.animate({
            height: fullHeight + "px",
            left: "0px",
        }, "fast");
    }

    document.getElementById('open-bases-popup').style.display = 'block';
    document.getElementById('baseTheme').src = point.baseThemePath;
    document.getElementById('iconBase').src = point.iconBasePath;
    document.getElementById('waze-base-link').href = point.baseWazeDestinationLink;
    document.getElementById('baseName').innerHTML = point.baseName;
    document.getElementById('base-passage').innerHTML = point.basePassage;
    document.getElementById('baseArrivalTime').innerHTML = point.baseArrivalTime;
    document.getElementById('baseArrivalExplanation').innerHTML = point.baseArrivalExplanation;


    let mapButton = (point.baseMapPath !== '')?`<a href=${point.baseMapPath} target="_blank"><button class="base-map">למפת התערוכה</button></a>`:'';

    document.getElementById('base-map-button-handler').innerHTML = mapButton;

    


    // Close Event only when user doesn't click on openBasePopup it self.
    headerElement.addEventListener('click', function handleClick() {
        onCloseOpenBasePopup()
    });
    navBarHeaderElement.addEventListener('click', function handleClick() {
        onCloseOpenBasePopup()
    });






    let OpenBaseAircraftshtml = "";
    let OpenBaseAircraftspecials = new Map();

    OpenBaseAircraftspecials.set("מטס", []);

    let pointInSortedLocation;

    sortedLocations.forEach((e) => {
        if(e.pointId === point.pointId) {
            pointInSortedLocation = e;
        }
    });

    pointInSortedLocation.aircrafts.forEach((ac) => {
        if (ac.specialInAircraft) {
            if (!OpenBaseAircraftspecials.has(ac.specialInAircraft) && (getCurrentTime() < getActualPathTime(ac.date, ac.time))) {
                OpenBaseAircraftspecials.set(ac.specialInAircraft, []);
            }

            if (OpenBaseAircraftspecials.get(ac.specialInAircraft)) {
                OpenBaseAircraftspecials.get(ac.specialInAircraft).push(ac);
            }
        } else if (ac.specialInPath) {
            if (!OpenBaseAircraftspecials.has(ac.specialInPath)) {
                OpenBaseAircraftspecials.set(ac.specialInPath, []);
            }
            OpenBaseAircraftspecials.get(ac.specialInPath).push(ac);
        } else {
            OpenBaseAircraftspecials.get("מטס").push(ac);
        }
    });

    // Filter out empty categories
    OpenBaseAircraftspecials = new Map([...OpenBaseAircraftspecials].filter(([key, value]) => value.length > 0));

    let openBaseTmp = OpenBaseAircraftspecials.get("מטס");
    OpenBaseAircraftspecials.delete("מטס");

    // Check to see if aircraftList is empty in this location
    if (OpenBaseAircraftspecials.size === 0 && (!openBaseTmp || openBaseTmp.length === 0)) {
        airplaneShowsElement.innerHTML = '<div id="noAircraftMessage"> המטס כבר חלף מעל נקודה זו</div>'
    } else {
        OpenBaseAircraftspecials.set("מטס", openBaseTmp);

        OpenBaseAircraftspecials.forEach((value, key) => {
            if (value && value.length > 0) {
            OpenBaseAircraftshtml += createLocationPopupCategoryRow(key);
            value.forEach((ac) => {
                var date = undefined;

                if (ac.date) {
                    var split = ac.date.split('-');
                    date = split[2] + "/" + split[1] + "/" + split[0].substr(2, 2);
                }

                OpenBaseAircraftshtml += createTableRow(ac.aircraftId,
                    ac.name,
                    ac.icon,
                    ac.aircraftType,
                    ac.time,
                    ac.aerobatic || key === "מופעים אווירובטיים" || key === "חזרות",
                    ac.parachutist,
                    false,
                    true,
                    date,
                    false,
                    false,
                    ac.from);
                });
                airplaneShowsElement.innerHTML = OpenBaseAircraftshtml;
            }
        });  
    }
}



function showLocationPopup(point, color, titleColor, subtitleColor, minimized = false, closeCallback) {
    onCloseOpenBasePopup()
    window.location.hash = locationPopupHash;
    previousHash.push(locationPopupHash);

    locationPopupCloseCallback = closeCallback;

    gtag('event', 'map_point_open', {
        'event_category': 'popup_interaction',
        'event_label': point.pointName
    });

    // build popup html
    var html = "";
    locationPopupExpanded = false;

    var specials = new Map();

    specials.set("מטס", []);

    point.aircrafts.forEach((ac) => {
        if (ac.specialInAircraft) {
            if (!specials.has(ac.specialInAircraft) && (getCurrentTime() < getActualPathTime(ac.date, ac.time))) {
                specials.set(ac.specialInAircraft, []);
            }

            if (specials.get(ac.specialInAircraft)) {
                specials.get(ac.specialInAircraft).push(ac);
            }
        } else if (ac.specialInPath) {
            if (!specials.has(ac.specialInPath)) {
                specials.set(ac.specialInPath, []);
            }

            specials.get(ac.specialInPath).push(ac);
        } else {
            specials.get("מטס").push(ac);
        }
    });

    // Filter out empty categories
    specials = new Map([...specials].filter(([key, value]) => value.length > 0));

    var tmp = specials.get("מטס");
    specials.delete("מטס");

    // Check to see if aircraftList is empty in this location
    if (specials.size === 0 && (!tmp || tmp.length === 0)) {
        $("#noAircraftMessage").show();
    } else {
        $("#noAircraftMessage").hide();

        specials.set("מטס", tmp);

        specials.forEach((value, key) => {
            if (value && value.length > 0) {
                html += createLocationPopupCategoryRow(key);
                value.forEach((ac) => {
                    var date = undefined;

                    if (ac.date) {
                        var split = ac.date.split('-');
                        date = split[2] + "/" + split[1] + "/" + split[0].substr(2, 2);
                    }

                    html += createTableRow(ac.aircraftId,
                        ac.name,
                        ac.icon,
                        ac.aircraftType,
                        ac.time,
                        ac.aerobatic || key === "מופעים אווירובטיים" || key === "חזרות",
                        ac.parachutist,
                        false,
                        true,
                        date,
                        false,
                        false,
                        ac.from);
                });
            }
        });
    }

    // point.aircrafts.forEach(function (aircraft) {
    //
    //     html += createTableRow(aircraft.aircraftId, aircraft.name, aircraft.icon, aircraft.aircraftType, aircraft.time, aircraft.aerobatic, aircraft.parachutist, false, true);
    // }, this);
    $("#aircraftsList").html(html);
    $("#popupTitle").text(point.pointName);
    if (point.options && point.options.liveStream) {
        $("#liveStream").show();
    } else {
        $("#liveStream").hide();
    }
    // show a description of the location
    if (point.pointLocation)
        $("#popupSubTitle").text(point.pointLocation);
    else
        $("#popupSubTitle").text("");

    // show times of the activity (aircraft times or base activity times)
    if (!point.activeTimes && point.aircrafts.length > 0)
        $("#popupTime").text(point.aircrafts[0].time.substr(0, 5) + "-" + point.aircrafts[point.aircrafts.length - 1].time.substr(0, 5));
    else if (point.activeTimes)
        $("#popupTime").text(point.activeTimes);
    else
        $("#popupTime").text("");

    // enable waze link if available
    if (point.wazeLink) {
        $("#wazeLink").attr("href", point.wazeLink);
        $("#wazeLink").show();
    } else {
        $("#wazeLink").hide();
    }
    $("#popupHeader").css("background", "#F7F5F5");
    $("#popupTitle").css("color", "#2b2b2b");
    $("#popupSubTitle").css("color", "#2b2b2b");

    if (isPointAerobatic(point.pointId) && config.showCrowdingWarnings) {
        locationPopupHeight = 290;
        $("#noCrowdingWarning").show();
        $("#noCrowdingWarningText").text(config.noCrowdingLocationText);
    } else {
        locationPopupHeight = 200;
        $("#noCrowdingWarning").hide();
    }

    if (!minimized) {
        getMapDarker();
    }

    var locationPopup = $("#locationPopup");
    var targetHeight = 0;
    if (!isDesktop()) {
        targetHeight = minimized ? minimizedLocationPopupHeight : locationPopupHeight;
    }
    else {
        targetHeight = 350;
    }

    // animate popup coming from bottom
    locationPopup.height(0);
    locationPopup.show();
    locationPopup.animate({
        height: targetHeight + "px"
    }, "fast");

    // // add touch events on the list to allow user expand or collapse it
    $("#aircraftListContainer").scrollTop(0);

    // add register to notifications if available
    if (areNotificationsPossible()) {
        $("#registerToLocationNotifcations").show();
        if (isSubscribed(point.pointId)) {
            $('#registerCheckbox').prop('checked', true);
        } else {
            $('#registerCheckbox').prop('checked', false);
        }
        $("#registerCheckbox").off("click");
        $("#registerCheckbox").on("click", (event) => {
            if (!areNotificationsAvailable()) {
                Notification.requestPermission().then(function (result) {
                    if (result === 'granted') {
                        $("#registerCheckbox").prop('checked', true);
                        Notification.permission = result;
                        subscribe("point-" + point.pointId).then(() => {
                            locations[point.pointId].notify = true;
                        }).catch((e) => {
                            console.error(e);
                            // on failure - make it unchecked back again
                            $("#registerCheckbox").prop('checked', false);
                        });
                    } else {
                        $("#registerCheckbox").prop('checked', false);
                        return false;
                    }
                });
            } else {
                if (isSubscribed(point.pointId)) {
                    unsubscribe(point.pointId).then(() => {
                        locations[point.pointId].notify = false;
                        $("#registerCheckbox").prop('checked', false);
                    }).catch((e) => {
                        console.error(e);
                        // on failure - make it checked back again
                        $("#registerCheckbox").prop('checked', true);
                    });
                }
                else {
                    subscribe("point-" + point.pointId).then(() => {
                        locations[point.pointId].notify = true;
                        $("#registerCheckbox").prop('checked', true);
                    }).catch((e) => {
                        console.error(e);
                        // on failure - make it unchecked back again
                        $("#registerCheckbox").prop('checked', false);
                    });
                }
            }
        });
    } else {
        $("#registerToLocationNotifcations").hide();
    }

}

function hideLocationPopup(callback) {
    var locationPopup = $("#locationPopup");
    locationPopup.animate({ height: "0px" }, "fast", function () {
        locationPopup.hide();
        if (callback != null)
            callback.call(this);
    });
    $("#aircraftListContainer").animate({ height: "150px" }, "fast");

    window.location.hash = mainHash;
    previousHash.push(mainHash);
}

function removeDuplicatesBy(keyFn, array) {
    var mySet = new Set();
    return array.filter(function (x) {
        var key = keyFn(x), isNew = !mySet.has(key);
        if (isNew) mySet.add(key);
        return isNew;
    });
}
//
// function compareLocationName(point1, point2) {
//     var name1 = locations[point1.pointid];
//     var name2 = locations[point2.pointId];
//     locations[point1.pointId].pointName - locations[point2.pointId].pointName);
// }

function fillAircraftSchedule(aircraft, showAllPoints = false) {
    var html = "";
    var aircraftPath = [];

    if (showAllPoints) {
        // Gathers all of the locations an aircraft type passes by, and removes duplicate points. It then sorts alphabetically location name
        aircraftPath =
            removeDuplicatesBy((point => point.pointId),
                [].concat.apply([],
                    aircrafts.filter(otherAircraft => otherAircraft.aircraftTypeId === aircraft.aircraftTypeId)
                        .map(relevantAircraft => relevantAircraft.path)))
                .sort((point1, point2) => locations[point1.pointId].pointName.localeCompare(locations[point2.pointId].pointName));
    } else {
        aircraftPath = aircraft.path;
    }

    aircraftPath.forEach(location => {
        html += createScheduleRow(aircraft, location);
    });


    $("#aircraftSchedule").html(html);
}

function setAircraftScheduleHeight() {
    let winHeight = $(window).height();
    let imgHeight = $('#aircraftInfoBannerContainer').innerHeight();
    let containerHeight = $('#aircraftIconContainer').innerHeight();
    let contentHeight = $('#aircraftContentSeparator').innerHeight();
    let divHeight = winHeight - imgHeight - containerHeight - contentHeight - 7;

    $('#aircraftSchedule').css('max-height', divHeight + 'px');
}

function manageAircraftTabs(elem) {
    $(".aircraftMenuLink").removeClass("active");
    $(elem.target).addClass("active");
    var currentAttrValue = $(elem.currentTarget).attr('href');
    previousHash.push(currentAttrValue);

    if (currAircraftTab != currentAttrValue) {
        $("hr.aircraftLineSeparator").toggleClass("two")
    }

    if (!globalCollapse) {
        $("#aircraftInfoMore").css("display", "none");
        var height = $(window).height();
        $("#aircraftInfoPopup").animate({ "height": height + "px" }, 500);
        $("#shrinkAircraftInfoPopup").css("display", "block");
        $("#expandedInfo").css("display", "block");
        $("aircraftScheduleContent").height('auto');
    }

    currAircraftTab = currentAttrValue;
    setTimeout(() => {
        $('.aircraftTabs ' + currentAttrValue).show().siblings().hide();
    }, 0);
}

function toggleAircraftContentSeparator(shouldShow) {
    if (shouldShow) {
        $(".aircraftContentSeparator").show();
        $("hr.aircraftLineSeparator").show();
    } else {
        $(".aircraftContentSeparator").hide();
        $("hr.aircraftLineSeparator").hide();
    }
}

function showAircraftInfoPopup(aircraft, collapse) {
    $("#cockpitVideo").hide();
    if (aircraft.icon === "efroni")
        $("#cockpitVideo").show();
        
    $("#aircraftInfoName").text(aircraft.name);
    $("#aircraftInfoType").text(aircraft.type);

    if (aircraft.name === 'צופית' | aircraft.name === 'עפרוני' | aircraft.name === 'ברק' | aircraft.name === 'אדיר' | aircraft.name === 'קרנף' | aircraft.name === 'לביא' | aircraft.name === 'בז' | aircraft.name === 'סופה' | aircraft.name === 'שמשון') {
        $("#aircraftInfo3D").show();
    } else $("#aircraftInfo3D").hide();
    
    if (aircraft.aerobatic) {
        $("#aircraftInfoTimeLabel").text("תחילת מופע");
        $("#aircraftInfoEventIcon").show();
    } else if (!aircraft.special) {
        $("#aircraftInfoTimeLabel").text("זמן המראה");
        $("#aircraftInfoEventIcon").hide();
    } else {
        $("#aircraftInfoTimeLabel").text(aircraft.special);
        $("#aircraftInfoEventIcon").hide();
    }

    var startTime = aircraft.path[0].from ? aircraft.path[0].from : aircraft.path[0].time;
    var endTime = aircraft.path[0].from ? aircraft.path[aircraft.path.length - 1].time : aircraft.path[0].time;
    $("#aircraftInfoStartTime").text((startTime != endTime ? (roundToMinute(startTime) + " - ") : "") + roundToMinute(endTime));
    $("#aircraftInfoIcon").attr("src", "icons/aircraft-menu/" + aircraft.icon + ".svg");
    $("#aircraftInfoContentDescription").text(aircraft.description);
    $("#aircraftInfoContentClassification").text(aircraft.classification);

    if (aircraft.manufactured) {
        $("#aircraftInfoContentCountry").text(aircraft.manufactured);
        $("#aircraftInfoCountry").show();
    } else {
        $("#aircraftInfoCountry").hide();
    }

    aircraftUsdzObjData = [
        { name: "lavie",hebName: "לביא"},
        { name: "baz",hebName: "בז"},
        { name: "sofa",hebName: "סופה"},
        { name: "tsofit",hebName: "צופית"},
        { name: "f35",hebName: "אדיר"},
        { name: "shimshon",hebName: "שמשון"},
        { name: "karnaf",hebName: 'קרנף'},
        { name: "efroni",hebName:'עפרוני'},
        //{ name: "bazi"},
        //{ name: "barak"},
        //{ name: "peten"},
    ];   

    let currAircraftName = aircraftUsdzObjData.find(obj => obj.hebName === aircraft.name);

    if(currAircraftName !== undefined){
        document.getElementById('aircraftInfo3D').innerHTML =
    "<button id='ARButton' onclick='openAR(" + JSON.stringify(currAircraftName.name) + ")'></button>";
    }else{
        document.getElementById('aircraftInfo3D').innerHTML =
        "<button id='ARButton' onclick='openAR()'></button>";
    }
    
    if (aircraft.dimensions) {
        $("#aircraftInfoContentDimensions").text(aircraft.dimensions);
        $("#aircraftInfoDimensions").show();
    } else {
        $("#aircraftInfoDimensions").hide();
    }

    if (aircraft.performance) {
        $("#aircraftInfoContentPerformance").text(aircraft.performance);
        $("#aircraftInfoPerformance").show();
    } else {
        $("#aircraftInfoPerformance").hide();
    }

    if (aircraft.weight) {
        $("#aircraftInfoContentWeight").text(aircraft.weight);
        $("#aircraftInfoWeight").show();
    } else {
        $("#aircraftInfoWeight").hide();
    }

    if (aircraft.engine) {
        $("#aircraftInfoContentEngine").text(aircraft.engine);
        $("#aircraftInfoEngine").show();
    } else {
        $("#aircraftInfoEngine").hide();
    }

    if (aircraft.armament) {
        $("#aircraftInfoContentArmament").text(aircraft.armament);
        $("#aircraftInfoArmament").show();
    } else {
        $("#aircraftInfoArmament").hide();
    }

    $("#aircraftInfoBanner").attr("src", aircraft.image);
    $("#aircraftInfoBannerBackground").attr("src", aircraft.image);

    getMapDarker();

    // Clears event handlers
    $("#aircraftInfoMore").off("click");
    $("#shrinkAircraftInfoPopup").off("click")

    // Collapse==true <=> The info popup is not extended.
    // I know it's confusing but I'm too lazy to fix it.
    if (!collapse) {
        // Lots of code to set the correct state of html elements according to collapse/extended
        toggleAircraftContentSeparator(false);
        $("#aircraftInfoMore").on("click", function () {
            window.location.hash = moreInfoHash;
            previousHash.push(moreInfoHash);

            toggleAircraftContentSeparator(true);
            $("#aircraftInfoButton").click();
            var height = $(window).height();
            $("#aircraftInfoMore").css("display", "none");
            $("#aircraftInfoPopup").animate({ "height": height + "px" }, 500);
            $("#shrinkAircraftInfoPopup").css("display", "block");
            $("#expandedInfo").css("display", "block");
        });

        $("#shrinkAircraftInfoPopup").on("click", function () {
            toggleAircraftContentSeparator(false);
            $("#aircraftInfoMore").css("display", "block");
            $("#aircraftInfoMore").css("height", "32px");
            $("#expandedInfo").css("display", "none");
            $("#shrinkAircraftInfoPopup").css("display", "none");
            var $aircraftInfoPopup = $('#aircraftInfoPopup');
            var curHeight = $aircraftInfoPopup.height();
            $aircraftInfoPopup.css('height', 'auto');
            $('.aircraftTabs #aircraftInfoContent').show().siblings().hide();

            var autoHeight = $aircraftInfoPopup.height();
            $aircraftInfoPopup.height(curHeight).animate({ height: autoHeight }, 500, function () {
                $aircraftInfoPopup.height('auto');
            });
        });
    } else {
        // Lots of code to set the correct state of html elements according to collapse/extended
        toggleAircraftContentSeparator(true);
        var height = $(window).height();
        $("#aircraftInfoMore").css("display", "none");
        $("#aircraftInfoPopup").height("0px");
        $("#aircraftInfoPopup").animate({ "height": height + "px" }, 500);
        $("#shrinkAircraftInfoPopup").css("display", "block");
        $("#expandedInfo").css("display", "block");

        $("#shrinkAircraftInfoPopup").on("click", function () {
            hideAircraftInfoPopup();
        });
    }

    var popupHeight = $("#locationPopup").height();
    $("#aircraftInfoPopup").css("bottom", -popupHeight);
    $("#aircraftInfoPopup").show();
    $("#aircraftInfoPopup").animate({
        bottom: "0px"
    }, "fast");

    setTimeout(function () {
        if (!isDesktop()) {
            // Hide only on mobile 
            $("#listView").hide();
        }

    }, 500);

    gtag('event', 'aircraft_info_open', {
        'event_category': 'popup_interaction',
        'event_label': aircraft.name
    });
}

function hideAircraftInfoPopup(callback) {
    hidePopup("#aircraftInfoPopup", function () {
        $("#aircraftInfoBanner").attr("src", "");
        if (callback) {
            callback.call(this);
        }
    });
    $("#listView").show();
    $("#expandedInfo").css("display", "none");
    $("#aircraftInfoMore").css("display", "block");
    $("#shrinkAircraftInfoPopup").css("display", "none");
    $("#aircraftInfoPopup").css('height', 'auto');
    $('.aircraftTabs #aircraftInfoContent').show().siblings().hide();
    $("#aircraftInfoName").css('font-size', "");

    if (!isMenuOpen) {
        window.location.hash = mainHash;
        previousHash.push(mainHash);
    }
}

function hidePopup(popup, callback) {
    getMapUndark();
    $(popup).animate({
        bottom: -$(popup).height() + "px"
    }, "fast", "swing", function () {
        $(popup).hide();
        callback.call(this);
    });
}

function createParachutistRow(location, time, from) {
    return "<div onclick=\"selectPointFromSchedule(" + location.pointId + ")\" class=\"tableRow aerobatic\"><img src=\"icons/aircraft-menu/parachutist.svg\" class=\"parachutistIcon\"></img> <div class=\"aircraftName\"><b>"
        + location.pointName + "</b></div><div class=\"time\">" + roundToMinute(time) + (from ? " - " + roundToMinute(from) : "") + "</div></div>";
}

function createAerobaticRow(location, time, from) {
    return "<div onclick=\"selectPointFromSchedule(" + location.pointId + ")\" class=\"tableRow aerobatic\"><img src=\"icons/aircraft-menu/aerobatic.svg\" class=\"aerobaticIcon\"></img> <div class=\"aircraftName\"><b>"
        + location.pointName + "</b></div><div class=\"time\">" + roundToMinute(time) + (from ? " - " + roundToMinute(from) : "") + "</div></div>";
}

function createCategoryLocationRow(location, time, from) {
    return "<div onclick=\"selectPointFromSchedule(" + location.pointId + ")\" class=\"tableRow indented\"><div class=\"aircraftName\"><b>"
        + location.pointName + "</b></div><div class=\"time\">" + (from ? (roundToMinute(from) + " - ") : "") + roundToMinute(time) + "</div></div>";
}

function createLocationScheduleRow(aircraft, location, time, from) {
    return `<div onclick="selectPointFromSchedule(${location.pointId})" class=\"scheduleRow\"><img src=\"icons/point-${location.color}.svg\" class=\"aircraftIcon\"></img> <div class=\"aircraftName\"><b>
            ${location.pointName} </b></div><div class=\"time\"> ${roundToMinute(time)} ${(from ? " - " + roundToMinute(from) : "")} </div></div>`;
}

function selectPointFromSchedule(pointId, minimized = false) {
    closeAllPopups();
    toggleListView(null, true);
    selectPoint(pointId, minimized);
}

function createScheduleRow(aircraft, location) {
    var fullPoint = locations[location.pointId];
    if (!fullPoint.hidden) {
        if (aircraft.aerobatic) {
            return createAerobaticRow(fullPoint, location.time, location.from);
        } else if (aircraft.parachutist) {
            return createParachutistRow(fullPoint, location.time, location.from);
        } else {
            return createLocationScheduleRow(aircraft, fullPoint, location.time, location.from);
        }
    }

    return "";
}


function createTableRow(aircraftId, name, icon, aircraftType, time, aerobatic, special, collapse, displayTime = true, date, showSchedule = false, showAllPoints = false, from) {
    aircraftUsdzObjData = [
        { name: "lavie",hebName: "לביא"},
        { name: "baz",hebName: "בז"},
        { name: "sofa",hebName: "סופה"},
        { name: "tsofit",hebName: "צופית"},
        { name: "f35",hebName: "אדיר"},
        { name: "shimshon",hebName: "שמשון"},
        { name: "karnaf",hebName: 'קרנף'},
        { name: "efroni",hebName:'עפרוני'},
        //{ name: "bazi"},
        //{ name: "barak"},
        //{ name: "peten"},
    ];    
    
    var aerobaticIcon = "<div/>";
    var classname = "";
    let currAircraftName = aircraftUsdzObjData.find(obj => obj.hebName === name);
    if (name === 'צופית' | name === 'עפרוני' | name === 'ברק' | name === 'אדיר' | name === 'קרנף' | name === 'לביא' | name === 'בז' | name === 'סופה' | name === 'שמשון'&& currAircraftName !== undefined) {
        classname = "<button class=\"show\" id=\"ARButton\" onclick='openAR("+ JSON.stringify(currAircraftName.name) +")'></button>"
    } else classname = "<button class=\"hide\" id=\"ARButton\" onclick='openAR("+ JSON.stringify(currAircraftName)+")'></button>"
    if (aerobatic) {
        aerobaticIcon = "<img src=\"icons/aircraft-menu/aerobatic.svg\" class=\"aerobaticTableIcon\"></img>";
        //aircraftType = "מופע אווירובטי";
    } else if (special === "הצנחת צנחנים") {
        aerobaticIcon = "<img src=\"icons/aircraft-menu/parachutist.svg\" class=\"aerobaticTableIcon\"></img>";
        aircraftType = "הצנחת צנחנים";
    }
    return "<div onclick='onAircraftSelected(" + aircraftId + "," + collapse.toString() + "," + showSchedule + "," + showAllPoints + ");' class=\"tableRow\"><img src=\"icons/aircraft-menu/" + icon +
        ".svg\" class=\"aircraftIcon\"><div class=\"aircraftName\"><b>" + name +
        "</b> " + aircraftType + "</div>" + aerobaticIcon + "<div class='date'>" + (date ? date : '') + "</div>" + classname + "<div class=\"time\">" +
        (displayTime ? roundToMinute(time) : "") + (displayTime && from ? (" - " + roundToMinute(from)) : "") + "</div></div></div></div>";
       
}

function createLocationRow(location, displayFirstAircraft, isSearchBar = false) {
    
    if (location.aircrafts.length == 0 &&  !location.pointName.includes('תצפית למטס'))
        return "";

    return "<a class='locationRow' href='javascript:void(0);'><div id='location" + location.pointId + "' class='locationRow' onclick='expandLocation(" + location.pointId + "," + isSearchBar + ");'>" +
        "<div class='locationName'>" + location.pointName + "</div>" +
        "<div class='nextAircraftSection'>" +
        (displayFirstAircraft ? "<div class='smallAircraftName'>" + location.aircrafts[0].name + "</div>" : "") +
        "<div class='nextAircraftTime'>" + (displayFirstAircraft ? roundToMinute(location.aircrafts[0].time) : "") + "</div>" +
        "<div class='expandArrow'><img src='icons/arrowBlack.png'></div>" +
        "<div class='collapseArrow'><img src='icons/arrowBlackUp.png'></div>" +
        "</div>" +
        "</div></a>" +
        "<div id='locationSpace" + location.pointId + "' class='locationSpace'></div>" +
        "<div class='locationPadding'></div>";
}

function expandLocation(pointId, isSearchBar = false) {
    var location = locations[pointId];

    var locationSpace = isSearchBar ? $("#search-view #locationSpace" + pointId) : $("#locationSpace" + pointId);
    if (locationSpace.html() === "") {
        var html = "";
        var lastAircraft = "";
        if(location.pointName.includes('תצפית למטס')) {
            html+=createViewPointMessage();
        }
        else if (location.aircrafts.length == 0) {
            html += createNoAircraftMessageRow();
        } else {
            location.aircrafts.forEach(function (aircraft) {
                if (aircraft.name !== lastAircraft) {
                    html += createTableRow(aircraft.aircraftId,
                        aircraft.name,
                        aircraft.icon,
                        aircraft.aircraftType,
                        aircraft.time,
                        aircraft.aerobatic,
                        aircraft.parachutist,
                        true,
                        true,
                        undefined,
                        false,
                        false,
                        aircraft.from);
                    lastAircraft = aircraft.name;
                }
            }, this);
        }

        locationSpace.html(html);
        locationSpace.slideDown();
        $("#location" + pointId).children(".nextAircraftSection").children(".expandArrow").hide();
        $("#location" + pointId).children(".nextAircraftSection").children(".collapseArrow").show();
    } else {
        locationSpace.slideUp("fast", function () {
            locationSpace.html("");
            $("#location" + pointId).children(".nextAircraftSection").children(".expandArrow").show();
            $("#location" + pointId).children(".nextAircraftSection").children(".collapseArrow").hide();
        });
    }


    gtag('event', 'location_expand', {
        'event_category': 'search_interaction',
        'event_label': location.pointName
    });
}

function createNoAircraftMessageRow() {
    return `<div id="noAircraftMessageRow">אין מטוסים נוספים הצפויים לעבור בנקודה זו השנה</div>`
}

function createViewPointMessage() {
    return `<div id="noAircraftMessageRow">על מנת לראות איזה מטוסים יעברו מול נקודת התצפית כנס למפה בזמן המטס</div>`
}

function showIncompatibleDevicePopup() {
    $("#aboutButton").hide();
    $("#homeButton").hide();
    $("#incompatibleBrowserPopup").show();
}

function showConfirmationPopup() {
    getMapDarker();
    closeAllPopups();
    $('#confirmationPopup').show();
}

function hideConfirmationPopup() {
    $('#confirmationPopup').fadeOut();
    getMapUndark();
    Notification.requestPermission().then(function (result) {
        if (result === 'granted') {
            Notification.permission = result;
            registerToFirebaseNotifications();
        }
    });
}

function showNoCrowdingPopup() {
    getMapDarker();
    closeAllPopups();
    $('#noCrowdingPopupBody').text(config.noCrowdingGeneralText);
    $('#noCrowdingPopup').show();
}


function hideNoCrowdingPopup() {
    $('#noCrowdingPopup').fadeOut();
    getMapUndark();
}

function showBasePopup(isAerobatics, special1, special2, minutes, locationName) {
    var html = "<b class=\"baseData\">";
    html += getEventName(isAerobatics, special1, special2);
    $(".baseEventIcon").hide();
    $("#basePopup").off('click');

    if (isAerobatics || special1 === "מופעים אוויריים" || special2 === "מופעים אוויריים") {
        $("#showAeroplanIcon").show();
        $("#showParachutingIcon").hide();
        $("#popupHeaderIcon").hide();
    } else if (special1 === "הצנחת צנחנים" || special2 === "הצנחת צנחנים") {
        $("#showAeroplanIcon").hide();
        $("#showParachutingIcon").show();
        $("#popupHeaderIcon").hide();
    }

    html += "</b><br class=\"baseData\">";
    html += getEventDescription(isAerobatics, locationName, minutes);
    $("#showData").html(html);
    $("#basePopup").css("top", -64).css("opacity", 0);
    $(".alert-header").show();
    $("#basePopup").show();
    animateBasePopup();
}

function animateBasePopup() {
    var topHeight = searchOpen ? -64 + "px" : 0 + "px";
    $("#basePopup").animate({
        top: topHeight,
        opacity: 1
    }, 600);
}

function openExternal(link) {
    var win = window.open(link);
    if (win) {
        win.focus();
    }
}

function showGenericPopup(title, subtitle, iconId = "genericAircraftIcon", link = undefined, after = () => {}) {
    var html = "<b class=\"baseData\">";
    html += title;

    $(".baseEventIcon").hide();
    $(".alert-header").hide();
    $(`#${iconId}`).show();
    if (link) {
        $("#basePopup").click(() => {
            if(link === 'ar.html'){
                openAR('barak');
            }else{
                openExternal(link);
            }
        });
    } else {
        $("#basePopup").off('click');
    }

    html += "</b><br class=\"baseData\">";
    // var eventDetails = `${desc}${baseName} בעוד ${minute} דקות`;
    html += subtitle;
    $("#showData").html(html);
    $("#basePopup").css("top", -64).css("opacity", 0);
    $("#basePopup").show();
    animateBasePopup();

    after();
}

function getEventIcon(isAerobatics) {
    return isAerobatics ? 'images/aeroplan.png' : 'images/parachuting.png';
}

function hideBasePopup() {
    $("#basePopup").off('click');
    $("#basePopup").animate({
        top: -64 + "px",
        opacity: 0
    }, "fast", "swing", function () {
        $("#basePopup").hide();
    });
}

function getMapDarker() {
    $mapDark = $(".map-dark");
    $mapDark.animate({
        opacity: 0.4
    }, 200);
    $mapDark.css("pointer-events", "all");
}

function getMapUndark() {
    $mapDark = $(".map-dark");
    $mapDark.animate({
        opacity: 0.1
    }, 200);
    $mapDark.css("pointer-events", "none");
}

function createClusterLocationRow(location) {
    return `<div onclick='selectPoint(` + location.pointId + ");' class=\"tableRow\"><img src=\"icons/point-" + location.color + ".svg\" class=\"locationIcon\"><div class=\"aircraftName\"><b>"
        + location.pointName + "</b></div></div></div>";
}

function openMapClusterPopup(arrayOfObjects) {
    window.location.hash = clusterHash;
    previousHash.push(clusterHash);
    getMapDarker();
    closeAllPopups();

    var contentDiv = $("#mapClusterPopupContent");
    var html = "";
    var lastAircraft = "";

    contentDiv.on("click", "*", () => closeMapClusterPopup(false));

    // Populating the popup
    arrayOfObjects.forEach((obj) => {
        // In the case of aircraft
        if (obj.aircraftId && obj.name !== lastAircraft) {
            html += createTableRow(obj.aircraftId, obj.name, obj.icon, obj.type, obj.path[0].time, obj.aerobatic, obj.parachutist, false, false);
            lastAircraft = obj.name;
        } else if (obj.pointId) {
            html += createClusterLocationRow(obj)
        }
    });

    contentDiv.html(html);
    contentDiv.scrollTop(0);

    $("#mapClusterPopupFooter").on("click", () => closeMapClusterPopup(true))
    $("#mapClusterPopup").fadeIn();
}

function closeMapClusterPopup(clearMap) {
    // deselectLocation();
    if (clearMap) {
        getMapUndark();
    }
    $("#mapClusterPopup").fadeOut();
}

function closeAllPopups() {
    deselectLocation();
    deselectAircraft();
    //closeVoiceMessagePopup();
    if (!isDesktop()) {
        closeMapClusterPopup(true);
    }
}

$(document).ready(function () {
    //window.scrollTo(0,document.body.scrollHeight);
});

function closeGotoVoiceMessagePopup() {
    $("#gottoVoiceMessagePopup").hide();
}

function showAudioMessagePopup() {
    $("#gottoVoiceMessagePopup").hide();
    $("#myModal").show();
    $("#myModal")[0].style.display = "flex";
    playAudioMessageAndTracker()
}

function closeVoiceMessagePopup() {
    $("#audioSRC")[0].pause();
    $("#audioSRC")[0].currentTime = 0;
    $("#myModal").hide();
    $("#gottoVoiceMessagePopup").hide();
}

var audioPLay;
function playAudioMessageAndTracker() {
    if ($("#audioSRC")[0].src !== "") {
        $("#audioSRC")[0].play();
        audioPLay = true;
    }
}

function playBTN() {
    if ($("#audioSRC")[0].src !== "") {
        if (audioPLay) {
            audioPLay = false;
            $("#audioSRC")[0].pause();
        }
        else {
            audioPLay = true;
            $("#audioSRC")[0].play();
        }
    }
}

function updateAudioMessageTime() {
    activeVoiceMessage = $("#audioSRC")[0];
    var currentSeconds = (Math.floor(activeVoiceMessage.currentTime % 60) < 10 ? '0' : '') + Math.floor(activeVoiceMessage.currentTime % 60);
    var currentMinutes = Math.floor(activeVoiceMessage.currentTime / 60);

    $("#audioTime")[0].innerHTML = currentMinutes + ":" + currentSeconds;

    var percentageOfSong = (activeVoiceMessage.currentTime / activeVoiceMessage.duration);
    var percentageOfSlider = $('#audioTrack')[0].offsetWidth * percentageOfSong;

    $('#trackerPoint')[0].style.left = Math.round(percentageOfSlider) + "px";
}

function isDesktop() {
    return $(window).width() > 600;
}