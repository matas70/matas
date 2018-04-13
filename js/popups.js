function initPopups() {	
	$("#locationPopup").hide();  	
	$("#aircraftInfoPopup").hide();
  
	$(window).resize(function() {
    	$('#content').height($(window).height() - 46);
	});

	$(window).trigger('resize');
}

function showLocationPopup(point, color, titleColor, subtitleColor, minimized=false) {
    // build popup html
    var html = "";
    point.aircrafts.forEach(function (aircraft) {
        html += createTableRow(aircraft.aircraftId, aircraft.name, aircraft.icon, aircraft.aircraftType, aircraft.time, aircraft.aerobatic, aircraft.parachutist);
    }, this);
    $("#aircraftsList").html(html);
    $("#popupTitle").text(point.pointName);
    $("#popupHeader").css("background", color);
    $("#popupTitle").css("color", titleColor);
    $("#popupSubTitle").css("color", subtitleColor);

    var locationPopup = $("#locationPopup");

    var popupHeight = locationPopup.height();
    var targetHeight = minimized ? 100 : 200;
    var targetBottom = 0;
    if (popupHeight > targetHeight)
        targetBottom = -(popupHeight - targetHeight);
    locationPopup.css("bottom", -popupHeight);
    locationPopup.show();
    locationPopup.animate({
        bottom: targetBottom + "px"
    }, "fast");

    // add touch events on the list to allow user expand or collapse it
    var dragStartTopY = null;
    var maxDrag = popupHeight - (window.innerHeight - 64);
    var delta;
    var popupHeader = $("#popupHeader");
    var currentBottom = targetBottom;

    popupHeader.on("tapstart", function (event) {
        dragStartTopY = event.touches[0].clientY;
        event.preventDefault();
    });

    popupHeader.on("tapmove", function (event) {
        if (dragStartTopY != null) {
            delta = dragStartTopY - event.touches[0].clientY;
			if (currentBottom + delta < 0) {
				if (currentBottom + delta > -maxDrag)
					locationPopup.css("bottom", -maxDrag + "px");
				else
					locationPopup.css("bottom", currentBottom + delta + "px");
			}
			else
				locationPopup.css("bottom", "0px");
            event.preventDefault();
        }
    });
    popupHeader.on("tapend", function (event) {
        if (dragStartTopY != null) {
            if (delta > 32) {
                // animate expand
                currentBottom = Math.min(-maxDrag, 0);
                locationPopup.animate({bottom: currentBottom + "px"}, "fast");
            } else if (delta < 32) {
                locationPopup.animate({bottom: targetBottom + "px"}, "fast");
                currentBottom = targetBottom;
			} else {
                locationPopup.animate({bottom: currentBottom + "px"}, "fast");
			}

            event.preventDefault();
            dragStartTopY = null;
        }
    });
}

function hideLocationPopup(callback) { 
	hidePopup("#locationPopup", callback);
}

function showAircraftInfoPopup(aircraft) {
	$("#aircraftInfoName").text(aircraft.name);
	$("#aircraftInfoType").text(aircraft.type);
	$("#aircraftInfoStartTime").text(aircraft.path[0].time.substr(0,5));
	$("#aircraftInfoIcon").attr("src", "icons/aircrafts/"+aircraft.icon+".png");
	$("#aircraftInfoContentDescription").text(aircraft.description);
	$("#aircraftInfoContentClassification").text(aircraft.classification);
	$("#aircraftInfoContentCountry").text(aircraft.manufactured);
	$("#aircraftInfoContentDimensions").text(aircraft.dimensions);
	$("#aircraftInfoContentPerformance").text(aircraft.performance);
	$("#aircraftInfoContentWeight").text(aircraft.weight);
	$("#aircraftInfoContentEngine").text(aircraft.engine);
	$("#aircraftInfoBanner").attr("src", aircraft.image);

	if (!aircraft.armament) {
		$("#aircraftInfoContentArmamentContainer").css("display", "none");
	} else {
        $("#aircraftInfoContentArmamentContainer").css("display", "block");
        $("#aircraftInfoContentArmament").text(aircraft.armament);
	}

	$("#aircraftInfoMore").on("click", function() {
        // $("#aircraftInfoPopup").animate({height: $("#aircraftInfoPopup").get(0).scrollHeight}, 1000 );
        // window.open(infoUrl,'aircraftMoreInfo');
		var height = $(window).height();
        $("#aircraftInfoMore").css("display", "none");
        $("#aircraftInfoPopup").animate({"height": height + "px"}, 500);
        // $("#aircraftInfoPopup").css("height");
        // $("#aircraftInfoPopup").css("height", height + "px");
        $("#shrinkAircraftInfoPopup").css("display", "block");
        $("#expandedInfo").css("display", "block");
	});

    $("#shrinkAircraftInfoPopup").on("click", function() {
        $("#aircraftInfoMore").css("display", "block");
        $("#aircraftInfoMore").css("height", "32px");
        $("#expandedInfo").css("display", "none");
        $("#shrinkAircraftInfoPopup").css("display", "none");
        // $("#aircraftInfoPopup").animate({"height": "auto"}, 500);
        // $("#aircraftInfoPopup").animate({height: $("#aircraftInfoPopup").get(0).scrollHeight}, 1000 );
        var $aircraftInfoPopup = $('#aircraftInfoPopup');
        var curHeight = $aircraftInfoPopup.height();
        $aircraftInfoPopup.css('height', 'auto');
        var autoHeight = $aircraftInfoPopup.height();
        $aircraftInfoPopup.height(curHeight).animate({height: autoHeight}, 500, function(){ $aircraftInfoPopup.height('auto');});
    });
	
	var popupHeight = $("#locationPopup").height();	
	$("#aircraftInfoPopup").css("bottom", -popupHeight);
	$("#aircraftInfoPopup").show();
	$("#aircraftInfoPopup").animate({
            bottom: "0px"
        }, "fast");		
}

function hideAircraftInfoPopup(callback) { 
	hidePopup("#aircraftInfoPopup", function() {
			$("#aircraftInfoBanner").attr("src", "");
			callback.call(this);
	});
}

function hidePopup(popup, callback) {
	$(popup).animate({
            bottom: -$(popup).height() + "px"
        }, "fast", "swing", function() {
			$(popup).hide();
			callback.call(this);
	});	
}

function createTableRow(aircraftId, name, icon, aircraftType, time, aerobatic, parachutist) {
	var aerobaticIcon = "<div/>";
	if (aerobatic) {
		aerobaticIcon = "<img src=\"icons/aerobatic.png\" class=\"aerobaticIcon\"></img>";
		aircraftType = "מופע אווירובטי";
	} else if (parachutist) {
        aerobaticIcon = "<img src=\"icons/aircrafts/parachutist.png\" class=\"aerobaticIcon\"></img>";
        aircraftType = "הצנחת צנחנים";
	}
	return "<div onclick='onAircraftSelected("+aircraftId+");' class=\"tableRow\"><img src=\"icons/aircrafts/" + icon + 
		   ".png\" class=\"aircraftIcon\"><div class=\"aircraftName\"><b>"+ name + 
		   "</b> " + aircraftType + "</div>"+ aerobaticIcon +"<div class=\"time\">"+ time.substring(0,5) +"</div></div>";
}

$(document).ready(function() {
	//window.scrollTo(0,document.body.scrollHeight);
});