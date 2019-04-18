var locationPopupExpanded = false;
var locationPopupCloseCallback = null;

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
        maxHeight = Math.min($("#aircraftsList").height() + 50, $("#map").height());
        event.preventDefault();
    });

    popupHeader.on("tapmove", function (event) {
        if (dragStartTopY != null) {
            delta = dragStartTopY - event.touches[0].clientY;
            var targetHeight = currHeight + delta;
            if (targetHeight >= maxHeight)
                targetHeight = maxHeight;

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
                locationPopup.animate({height: maxHeight + "px"}, "fast");
                aircraftListContainer.animate({height: maxHeight - 50 + "px"}, "fast");
            } else {
                locationPopup.animate({height: normalHeight + "px"}, "fast");
                aircraftListContainer.animate({height: normalHeight - 50 + "px"}, "fast");
            }
            dragStartTopY = null;
        }
    });

}

function showLocationPopup(point, color, titleColor, subtitleColor, minimized = false, closeCallback) {
    locationPopupCloseCallback = closeCallback;

    // build popup html
    var html = "";
    locationPopupExpanded = false;

    var specials = new Map();
    specials.set("מטס", []);
    // let specialCats = categories.filter((cat) => cat.special);
    //
    // specialCats.forEach(specialCat => {
    //     let matchingAcs = point.aircrafts.filter((ac) => ac.category === specialCat.category);
    //     if (matchingAcs.length > 0) {
    //         html += createLocationPopupCategoryRow(specialCat);
    //
    //         matchingAcs.forEach((matchingAc) => {
    //             html += createTableRow(matchingAc.aircraftId,
    //                 matchingAc.name,
    //                 matchingAc.icon,
    //                 matchingAc.aircraftType,
    //                 matchingAc.time,
    //                 matchingAc.aerobatic,
    //                 matchingAc.parachutist, false, true);
    //
    //         });
    //     }
    // });
    // html += createLocationPopupCategoryRow({category: "מטס"});

    point.aircrafts.forEach((ac) => {
       if (ac.specialInAircraft) {
           if (!specials.has(ac.specialInAircraft)) {
               specials.set(ac.specialInAircraft, []);
           }

           specials.get(ac.specialInAircraft).push(ac);
       } else if (ac.specialInPath) {
           if (!specials.has(ac.specialInPath)) {
               specials.set(ac.specialInPath, []);
           }

           specials.get(ac.specialInPath).push(ac);
       } else {
           specials.get("מטס").push(ac);
       }
    });

    var tmp = specials.get("מטס");
    specials.delete("מטס");
    specials.set("מטס", tmp);

    specials.forEach((value, key) => {
       html += createLocationPopupCategoryRow(key);
       value.forEach((ac) => {
           html += createTableRow(ac.aircraftId,
               ac.name,
               ac.icon,
               ac.aircraftType,
               ac.time,
               ac.aerobatic || key === "מופעים אווירובטיים" || key === "חזרות" ,
               ac.parachutist,
               false,
               true);
       });
    });

    // point.aircrafts.forEach(function (aircraft) {
    //
    //     html += createTableRow(aircraft.aircraftId, aircraft.name, aircraft.icon, aircraft.aircraftType, aircraft.time, aircraft.aerobatic, aircraft.parachutist, false, true);
    // }, this);
    $("#aircraftsList").html(html);
    $("#popupTitle").text(point.pointName);

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

    if (!minimized)
        getMapDarker();

    var locationPopup = $("#locationPopup");

    // animate popup coming from bottom
    var targetHeight = minimized ? 100 : 200;

    locationPopup.height(0);
    locationPopup.show();
    locationPopup.animate({
        height: targetHeight + "px"
    }, "fast");

    // // add touch events on the list to allow user expand or collapse it
    $("#aircraftListContainer").scrollTop(0);

}

function hideLocationPopup(callback) {
    var locationPopup = $("#locationPopup");
    locationPopup.animate({height: "0px"}, "fast", function () {
        locationPopup.hide();
        if (callback != null)
            callback.call(this);
    });
    $("#aircraftListContainer").animate({height: "150px"}, "fast");
}

function fillAircraftSchedule(aircraft, collapse) {
    var html = "";
    aircraft.path.sort((point1, point2) => Date.parse(point1.time) - Date.parse(point2.time)).forEach(location => {
        html += createScheduleRow(aircraft, location);
    });

    $("#aircraftSchedule").html(html);
}

function manageAircraftTabs(elem) {
    $(".aircraftMenuLink").removeClass("active");
    $(elem.target).addClass("active");
    var currentAttrValue = $(elem.currentTarget).attr('href');
    if (currTab != currentAttrValue) {
        $("hr.aircraftLineSeparator").toggleClass("two")
    }

    if (!globalCollapse) {
        $("#aircraftInfoMore").css("display", "none");
        var height = $(window).height();
        $("#aircraftInfoPopup").animate({"height": height + "px"}, 500);
        $("#shrinkAircraftInfoPopup").css("display", "block");
        $("#expandedInfo").css("display", "block");
        $("aircraftScheduleContent").height('auto');
    }

    currTab = currentAttrValue;
    $('.aircraftTabs ' + currentAttrValue).show().siblings().hide();
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
    $("#aircraftInfoName").text(aircraft.name);
    $("#aircraftInfoType").text(aircraft.type);

    if (aircraft.aerobatic) {
        $("#aircraftInfoTimeLabel").text("תחילת מופע");
        $("#aircraftInfoEventIcon").show();
    } else {
        $("#aircraftInfoTimeLabel").text("זמן המראה");
        $("#aircraftInfoEventIcon").hide();
    }

    $("#aircraftInfoStartTime").text(roundToMinute(aircraft.path[0].time));
    $("#aircraftInfoIcon").attr("src", "icons/aircraft-menu/" + aircraft.icon + ".svg");
    $("#aircraftInfoContentDescription").text(aircraft.description);
    $("#aircraftInfoContentClassification").text(aircraft.classification);
    $("#aircraftInfoContentCountry").text(aircraft.manufactured);
    $("#aircraftInfoContentDimensions").text(aircraft.dimensions);
    $("#aircraftInfoContentPerformance").text(aircraft.performance);
    $("#aircraftInfoContentWeight").text(aircraft.weight);
    $("#aircraftInfoContentEngine").text(aircraft.engine);
    $("#aircraftInfoBanner").attr("src", aircraft.image);

    getMapDarker();

    if (!aircraft.armament) {
        $("#aircraftInfoContentArmamentContainer").css("display", "none");
    } else {
        $("#aircraftInfoContentArmamentContainer").css("display", "flex");
        $("#aircraftInfoContentArmament").text(aircraft.armament);
    }

    // Clears event handlers
    $("#aircraftInfoMore").off("click");
    $("#shrinkAircraftInfoPopup").off("click")

    // Collapse==true <=> The info popup is not extended.
    // I know it's confusing but I'm too lazy to fix it.
    if (!collapse) {
        // Lots of code to set the correct state of html elements according to collapse/extended
        toggleAircraftContentSeparator(false);
        $("#aircraftInfoMore").on("click", function () {
            toggleAircraftContentSeparator(true);
            $("#aircraftInfoButton").click();
            var height = $(window).height();
            $("#aircraftInfoMore").css("display", "none");
            $("#aircraftInfoPopup").animate({"height": height + "px"}, 500);
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
            $aircraftInfoPopup.height(curHeight).animate({height: autoHeight}, 500, function () {
                $aircraftInfoPopup.height('auto');
            });
        });
    } else {
        // Lots of code to set the correct state of html elements according to collapse/extended
        toggleAircraftContentSeparator(true);
        var height = $(window).height();
        $("#aircraftInfoMore").css("display", "none");
        $("#aircraftInfoPopup").height("0px");
        $("#aircraftInfoPopup").animate({"height": height + "px"}, 500);
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
        $("#listView").hide();
    }, 500);
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

function createParachutistRow(location, time) {
    return "<div onclick=\"selectPointFromSchedule(" + location.pointId + ", true)\" class=\"tableRow aerobatic\"><img src=\"icons/aircraft-menu/parachutist.svg\" class=\"parachutistIcon\"></img> <div class=\"aircraftName\"><b>"
        + location.pointName + "</b></div><div class=\"time\">" + roundToMinute(time) + "</div></div>";
}

function createAerobaticRow(location, time) {
    return "<div onclick=\"selectPointFromSchedule(" + location.pointId + ", true)\" class=\"tableRow aerobatic\"><img src=\"icons/aircraft-menu/aerobatic.svg\" class=\"aerobaticIcon\"></img> <div class=\"aircraftName\"><b>"
        + location.pointName + "</b></div><div class=\"time\">" + roundToMinute(time) + "</div></div>";
}

function createLocationScheduleRow(aircraft, location, time) {
    return `<div onclick="selectPointFromSchedule(${location.pointId}, true)" class=\"tableRow\"><img src=\"icons/group2@2x.png\" class=\"aircraftIcon\"></img> <div class=\"aircraftName\"><b>
            ${location.pointName} </b></div><div class=\"time\"> ${roundToMinute(time)} </div></div>`;
}

function selectPointFromSchedule(pointId, minimized = false) {
    closeAllPopups();
    toggleListView(null, true);
    selectPoint(pointId, minimized);
}

function createScheduleRow(aircraft, location) {
    var fullPoint = locations[location.pointId];
    if (aircraft.aerobatic) {
        return createAerobaticRow(fullPoint, location.time);
    } else if (aircraft.parachutist) {
        return createParachutistRow(fullPoint, location.time);
    } else if (!fullPoint.hidden) {
        return createLocationScheduleRow(aircraft, fullPoint, location.time);
    }

    return "";
}

function createTableRow(aircraftId, name, icon, aircraftType, time, aerobatic, parachutist, collapse, displayTime = true) {
    var aerobaticIcon = "<div/>";
    if (aerobatic) {
        aerobaticIcon = "<img src=\"icons/aircraft-menu/aerobatic.svg\" class=\"aerobaticTableIcon\"></img>";
        aircraftType = "מופע אווירובטי";
    } else if (parachutist) {
        aerobaticIcon = "<img src=\"icons/aircraft-menu/parachutist.svg\" class=\"aerobaticTableIcon\"></img>";
        aircraftType = "הצנחת צנחנים";
    }

    return "<div onclick='onAircraftSelected(" + aircraftId + "," + collapse.toString() + ");' class=\"tableRow\"><img src=\"icons/aircraft-menu/" + icon +
        ".svg\" class=\"aircraftIcon\"><div class=\"aircraftName\"><b>" + name +
        "</b> " + aircraftType + "</div>" + aerobaticIcon + "<div class=\"time\">" + (displayTime ? roundToMinute(time) : "") + "</div></div></div></div>";
}

function createLocationRow(location, displayFirstAircraft) {
    if (location.aircrafts.length == 0)
        displayFirstAircraft = false;

    return "<a class='locationRow' href='javascript:void(0);'><div id='location" + location.pointId + "' class='locationRow' onclick='expandLocation(" + location.pointId + ");'>" +
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

function expandLocation(pointId) {
    var location = locations[pointId];
    var locationSpace = $("#locationSpace" + pointId);
    if (locationSpace.html() === "") {
        var html = "";
        var lastAircraft = "";
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
                    true);
                lastAircraft = aircraft.name;
            }
        }, this);
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

}

function showIncompatibleDevicePopup() {
    $("#aboutButton").hide();
    $("#homeButton").hide();
    $("#incompatibleBrowserPopup").show();
}

function showConfirmationPopup(title, messageBody) {
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
            // scheduleFlightStartNotification();
        }
    });
}

var notificationTitle = 'מטס עצמאות 71';
var notificationOptions =
    {
        body: '',
        icon: '../icons/logo192x192.png',
        dir: "rtl",
        lang: 'he',
        //TODO: add badge here
        badge: '../icons/logo192x192.png',
        vibrate: [300, 100, 400],
        data: {url: 'https://matas-iaf.com', sentNotifications: []}
    };

var notificationMessage =
    {
        "notificationTitle": notificationTitle,
        "notificationOptions": notificationOptions,
        "notificationTime": 500
    };

function createNotificationMessage(title, options, time) {
    notificationMessage.notificationTitle = title;
    notificationMessage.notificationOptions = options;
    notificationMessage.notificationTime = time;

    return notificationMessage;
}

function scheduleFlightStartNotification() {
    var FIVE_MINUTES_IN_MILLISECONDS = 5 * 60 * 1000;

    // Five minutes before flight start
    var remainingTime = actualStartTime - FIVE_MINUTES_IN_MILLISECONDS - getCurrentTime();

    // Only display the message when we have 5 minutes or more remaining
    if (remainingTime >= 0 && Notification.permission === 'granted') {
        notificationOptions.body = 'המטס יתחיל בעוד 5 דקות!';
        notificationOptions.icon = '../icons/logo192x192.png';

        // TODO: push notifications
        // // We only schedule if we haven't already
        // if (!localStorage.getItem(notificationOptions.body)) {
        //     localStorage.setItem(notificationOptions.body, notificationOptions.body);
        //     navigator.serviceWorker.controller.postMessage(createNotificationMessage(notificationTitle, notificationOptions, remainingTime));
        //     notificationOptions.data.sentNotifications.push(notificationOptions.body);
        // }
    }
}

function getEventName(isAerobatics) {
    return isAerobatics ? 'מופע אווירובטי' : 'הצנחות';
}

function getEventDescription(isAerobatics, locationName, minutes) {
    var desc = isAerobatics ? 'יחל ב' : 'יחלו ב';
    return `${desc}${locationName} בעוד ${minutes} דקות`;
}

function showBasePopup(isAerobatics, minutes, locationName) {
    var html = "<b class=\"baseData\">";
    html += getEventName(isAerobatics);

    if (isAerobatics) {
        $("#showAeroplanIcon").show();
        $("#showParachutingIcon").hide();
    } else {
        $("#showAeroplanIcon").hide();
        $("#showParachutingIcon").show();
    }

    html += "</b><br class=\"baseData\">";
    // var eventDetails = `${desc}${baseName} בעוד ${minute} דקות`;
    html += getEventDescription(isAerobatics, locationName, minutes);
    $("#showData").html(html);
    $("#basePopup").css("top", -64);
    $("#basePopup").show();
    $("#basePopup").animate({
        top: 64 + "px"
    }, 600);
}

function getEventIcon(isAerobatics) {
    return isAerobatics ? 'images/aeroplan.png' : 'images/parachuting.png';
}

function hideBasePopup() {
    $("#basePopup").animate({
        top: -64 + "px"
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
    return "<div onclick='selectPoint(" + location.pointId + ");' class=\"tableRow\"><img src=\"icons/group2.png\" class=\"locationIcon\"><div class=\"aircraftName\"><b>"
        + location.pointName + "</b></div></div></div>";
}

function openMapClusterPopup(arrayOfObjects) {
    getMapDarker();

    var contentDiv = $("#mapClusterPopupContent");
    var html = "";
    var lastAircraft = "";

    contentDiv.on("click", "*", () => closeMapClusterPopup(false));

    // Populating the popup
    arrayOfObjects.forEach((obj) => {
        // In the case of aircraft
        if (obj.aircraftId && obj.name != lastAircraft) {
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
    closeMapClusterPopup(true);
}

$(document).ready(function () {
    //window.scrollTo(0,document.body.scrollHeight);
});
