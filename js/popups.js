function initPopups() {	
	$("#locationPopup").hide();  	
	$("#aircraftInfoPopup").hide();
  
	$(window).resize(function() {
    	$('#content').height($(window).height() - 46);
	});

	$(window).trigger('resize');
}

function showLocationPopup(point, color, titleColor, subtitleColor) {
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
	var targetHeight = 200;
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

function showAircraftInfoPopup(aircraftName, aircraftType, iconName, imageName, time, infoUrl) {		
	$("#aircraftInfoName").text(aircraftName);
	$("#aircraftInfoType").text(aircraftType);
	$("#aircraftInfoStartTime").text(time.substr(0,5));
	$("#aircraftInfoIcon").attr("src", "icons/aircrafts/"+iconName+".png");
	$("#aircraftInfoBanner").attr("src", imageName);
	$("#aircraftInfoMore").on("click", function() {
	  window.open(infoUrl,'aircraftMoreInfo');
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

$(document).ready(function() {
	//window.scrollTo(0,document.body.scrollHeight);
});