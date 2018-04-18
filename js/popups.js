function initPopups() {
	$("#locationPopup").hide();
	$("#aircraftInfoPopup").hide();
	$("#basePopup").hide();

	$(window).resize(function() {
    	$('#content').height($(window).height() - 46);
	});

	$(window).trigger('resize');
}

function showLocationPopup(point, color, titleColor, subtitleColor, minimized=false) {
    // build popup html
    var html = "";
    point.aircrafts.forEach(function (aircraft) {
        html += createTableRow(aircraft.aircraftId, aircraft.name, aircraft.icon, aircraft.aircraftType, aircraft.time, aircraft.aerobatic, aircraft.parachutist, false, true);
    }, this);
    $("#aircraftsList").html(html);
    $("#popupTitle").text(point.pointName);
    $("#popupHeader").css("background", color);
    $("#popupTitle").css("color", titleColor);
    $("#popupSubTitle").css("color", subtitleColor);

    if (!minimized)
    	getMapDarker();

    var locationPopup = $("#locationPopup");

    var popupHeight = locationPopup.height();
    var targetHeight = minimized ? 100 : 200;
    var targetBottom = 0;
    if (popupHeight > targetHeight)
        targetBottom = -(popupHeight - targetHeight);
    locationPopup.css("bottom", -popupHeight);
    locationPopup.height(targetHeight);
    $("#aircraftListContainer").height(targetHeight-50);
    locationPopup.show();
    locationPopup.animate({
        bottom: targetBottom + "px"
    }, "fast");

    // add touch events on the list to allow user expand or collapse it
    var dragStartTopY = null;
    var maxDrag = (popupHeight - $("#map").height());
    var delta;
    var popupHeader = $("#popupHeader");
    var currentBottom = targetBottom;

    $("#aircraftListContainer").scrollTop(0);

    // popupHeader.on("click", function(event) {
    //     currentBottom = Math.min(-maxDrag, 0);
    //     locationPopup.animate({height: maxHeight + "px"}, "fast");
    // })

    // popupHeader.on("tapstart", function (event) {
    //     dragStartTopY = event.touches[0].clientY;
    //     event.preventDefault();
    // });
    //
    // popupHeader.on("tapmove", function (event) {
    //     if (dragStartTopY != null) {
    //         delta = dragStartTopY - event.touches[0].clientY;
		// 	if (currentBottom + delta < 0) {
		// 		if (currentBottom + delta > -maxDrag)
		// 			locationPopup.css("bottom", -maxDrag + "px");
		// 		else
		// 			locationPopup.css("bottom", currentBottom + delta + "px");
		// 	}
		// 	else
		// 		locationPopup.css("bottom", "0px");
    //         event.preventDefault();
    //     }
    // });
    // popupHeader.on("tapend", function (event) {
    //     if (dragStartTopY != null) {
    //         if (delta > 32) {
    //             // animate expand
    //             currentBottom = Math.min(-maxDrag, 0);
    //             locationPopup.animate({bottom: currentBottom + "px"}, "fast");
    //         } else if (delta < 32) {
    //             locationPopup.animate({bottom: targetBottom + "px"}, "fast");
    //             currentBottom = targetBottom;
		// 	} else {
    //             locationPopup.animate({bottom: currentBottom + "px"}, "fast");
		// 	}
    //
    //         event.preventDefault();
    //         dragStartTopY = null;
    //     }
    // });
}

function hideLocationPopup(callback) {
	hidePopup("#locationPopup", callback);
}

function showAircraftInfoPopup(aircraft, collapse) {
	$("#aircraftInfoName").text(aircraft.name);
	$("#aircraftInfoType").text(aircraft.type);
	$("#aircraftInfoStartTime").text(roundToMinute(aircraft.path[0].time));
	$("#aircraftInfoIcon").attr("src", "icons/aircraft-menu/"+aircraft.icon+".svg");
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

	// Clears event handlersh
    $("#aircraftInfoMore").off("click");
    $("#shrinkAircraftInfoPopup").off("click")

	if (!collapse) {
        $("#aircraftInfoMore").on("click", function () {
            var height = $(window).height();
            $("#aircraftInfoMore").css("display", "none");
            $("#aircraftInfoPopup").animate({"height": height + "px"}, 500);
            $("#shrinkAircraftInfoPopup").css("display", "block");
            $("#expandedInfo").css("display", "block");
        });

        $("#shrinkAircraftInfoPopup").on("click", function () {
            $("#aircraftInfoMore").css("display", "block");
            $("#aircraftInfoMore").css("height", "32px");
            $("#expandedInfo").css("display", "none");
            $("#shrinkAircraftInfoPopup").css("display", "none");
            var $aircraftInfoPopup = $('#aircraftInfoPopup');
            var curHeight = $aircraftInfoPopup.height();
            $aircraftInfoPopup.css('height', 'auto');
            var autoHeight = $aircraftInfoPopup.height();
            $aircraftInfoPopup.height(curHeight).animate({height: autoHeight}, 500, function () {
                $aircraftInfoPopup.height('auto');
            });
        });
    } else {
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

    setTimeout(function() {
        $("#listView").hide();
    }, 500);
}

function hideAircraftInfoPopup(callback) {
	hidePopup("#aircraftInfoPopup", function() {
			$("#aircraftInfoBanner").attr("src", "");
			if (callback) {
                callback.call(this);
            }
	});
    $("#listView").show();
}

function hidePopup(popup, callback) {
    getMapUndark();
	$(popup).animate({
            bottom: -$(popup).height() + "px"
        }, "fast", "swing", function() {
			$(popup).hide();
			callback.call(this);
	});
}

function createParachutistRow(name, time) {
    return "<div class=\"tableRow aerobatic\"><img src=\"icons/aircrafts/parachutist.png\" class=\"parachutistIcon\"></img> <div class=\"aircraftName\"><b>" + name +
        "</b></div><div class=\"time\">" +roundToMinute(time)+ "</div></div>";
}

function createAerobaticRow(name, time) {
    return "<div class=\"tableRow aerobatic\"><img src=\"icons/aerobatic.png\" class=\"aerobaticIcon\"></img> <div class=\"aircraftName\"><b>"+ name +
        "</b></div><div class=\"time\">"+ roundToMinute(time) +"</div></div>";
}

function createTableRow(aircraftId, name, icon, aircraftType, time, aerobatic, parachutist, collapse, displayTime=true) {
	var aerobaticIcon = "<div/>";
	if (aerobatic) {
		aerobaticIcon = "<img src=\"icons/aerobatic.png\" class=\"aerobaticTableIcon\"></img>";
		aircraftType = "מופע אווירובטי";
	} else if (parachutist) {
        aerobaticIcon = "<img src=\"icons/aircrafts/parachutist.png\" class=\"aerobaticTableIcon\"></img>";
        aircraftType = "הצנחת צנחנים";
	}

	return "<div onclick='onAircraftSelected("+aircraftId+ "," + collapse.toString() + ");' class=\"tableRow\"><img src=\"icons/aircraft-menu/" + icon +
		   ".svg\" class=\"aircraftIcon\"><div class=\"aircraftName\"><b>"+ name +
		   "</b> " + aircraftType + "</div>" + (displayTime ? "<div class=\"time\">"+roundToMinute(time) +"</div></div>" : "" + aerobaticIcon + "</div></div>");
}

function createLocationRow(location, displayFirstAircraft) {
    return "<a class='locationRow' href='javascript:void(0);'><div id='location"+location.pointId+"' class='locationRow' onclick='expandLocation("+location.pointId+");'>" +
                "<div class='locationName'>"+location.pointName+"</div>" +
                "<div class='nextAircraftSection'>"+
                    (displayFirstAircraft ? "<div class='smallAircraftName'>"+location.aircrafts[0].name+"</div>" : "") +
                    "<div class='nextAircraftTime'>"+roundToMinute(location.aircrafts[0].time)+"</div>" +
                    "<div class='expandArrow'><img src='icons/arrowBlack.png'></div>" +
                    "<div class='collapseArrow'><img src='icons/arrowBlackUp.png'></div>" +
                "</div>" +
           "</div></a>" +
           "<div id='locationSpace"+location.pointId+"' class='locationSpace'></div>" +
           "<div class='locationPadding'></div>";
}

function expandLocation(pointId) {
    var location = locations[pointId];
    var locationSpace = $("#locationSpace"+pointId);
    if (locationSpace.html()==="") {
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
        $("#location"+pointId).children(".nextAircraftSection").children(".expandArrow").hide();
        $("#location"+pointId).children(".nextAircraftSection").children(".collapseArrow").show();
    } else {
        locationSpace.slideUp("fast", function() {
            locationSpace.html("");
            $("#location"+pointId).children(".nextAircraftSection").children(".expandArrow").show();
            $("#location"+pointId).children(".nextAircraftSection").children(".collapseArrow").hide();
        });
    }

}

function showIncompatibleDevicePopup() {
    $("#aboutButton").hide();
    $("#homeButton").hide();
    $("#incompatibleBrowserPopup").show();
}

function showBasePopup(isAerobatics,minute,baseName) {
	var html="<b class=\"baseData\">";
	var desc;
	if (isAerobatics){
	    html+="מופע אווירובטי";
        $("#showAeroplanIcon").show();
        $("#showParachutingIcon").hide();
        desc="יחל ב";
    }
    else{
	    html+="הצנחות";
        $("#showAeroplanIcon").hide();
        $("#showParachutingIcon").show();
        desc="יחלו ב";
    }
    html+="</b><br class=\"baseData\">";
	html+=desc;
	html+=baseName;
	html+=" בעוד ";
	html+=minute;
	html+=" דק'";
    $("#showData").html(html);
    $("#basePopup").css("top", -64);
    $("#basePopup").show();
    $("#basePopup").animate({
        top: 64 + "px"
    }, 600);
}

function hideBasePopup() {
    $("#basePopup").animate({
        top: -64 + "px"
    }, "fast", "swing", function() {
        $("#basePopup").hide();
    });
}

function getMapDarker() {
    $mapDark = $(".map-dark");
    $mapDark .animate({
        opacity: 0.4},200);
    $mapDark .css("pointer-events","all");
}

function getMapUndark() {
    $mapDark = $(".map-dark");
    $mapDark.animate({
        opacity: 0.1},200);
    $mapDark.css("pointer-events","none");
}

function createClusterLocationRow(location) {
    return "<div onclick='selectPoint(" + location.pointId + ");' class=\"tableRow\"><img src=\"icons/group2.png\" class=\"locationIcon\"><div class=\"aircraftName\"><b>"
        + location.pointName + "</b></div></div></div>";
}

function openMapClusterPopup(arrayOfObjects) {
    console.log("opened")
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

$(document).ready(function() {
	//window.scrollTo(0,document.body.scrollHeight);
});