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
	point.aircrafts.forEach(function(aircraft) {
		html += createTableRow(aircraft.aircraftId, aircraft.name, aircraft.icon, aircraft.aircraftType, aircraft.time, aircraft.aerobatic);
	}, this);
	$("#aircraftsList").html(html);
	$("#popupTitle").text(point.pointName);
	$("#popupHeader").css("background", color);
	$("#popupTitle").css("color", titleColor);
	$("#popupSubTitle").css("color", subtitleColor);	
	
	var popupHeight = $("#locationPopup").height();
    var targetHeight = minimized?100:200;
	var targetBottom = 0;
	if (popupHeight > targetHeight) 
		targetBottom = -(popupHeight - targetHeight);
	$("#locationPopup").css("bottom", -popupHeight);
	$("#locationPopup").show();
	$("#locationPopup").animate({
            bottom: targetBottom + "px"
        }, "fast");
		
	// $("#popupHeader").bind('touchmove', function(event) {
	//     var touch = event.targetTouches[0];
	    
	//     // Place element where the finger is
	//     $("#locationPopup").style.left = touch.pageX-25 + 'px';
	//     $("#locationPopup").style.top = touch.pageY-25 + 'px';
	//     event.preventDefault();
	//   }, false);
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

function createTableRow(aircraftId, name, icon, aircraftType, time, aerobatic) {
	var aerobaticIcon = "<div/>";
	if (aerobatic) {
		aerobaticIcon = "<img src=\"icons/aerobatic.png\" class=\"aerobaticIcon\"></img>";
		aircraftType = "מופע אווירובטי";
	}
	return "<div onclick='onAircraftSelected("+aircraftId+");' class=\"tableRow\"><img src=\"icons/aircrafts/" + icon + 
		   ".png\" class=\"aircraftIcon\"><div class=\"aircraftName\"><b>"+ name + 
		   "</b> " + aircraftType + "</div>"+ aerobaticIcon +"<div class=\"time\">"+ time.substring(0,5) +"</div></div>";
}

function showBasePopup(event,minute,baseName) {
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

$(document).ready(function() {
	//window.scrollTo(0,document.body.scrollHeight);
});