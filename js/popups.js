function initPopups() {
	$("#locationPopup").hide();
}

function showLocationPopup(point) {
	// build popup html
	html = "";
	point.aircrafts.forEach(function(aircraft) {
		html += createTableRow(aircraft.name, aircraft.icon, aircraft.aircraftType, aircraft.time);
	}, this);
	$("#aircraftsList").html(html);
	$("#popupTitle").text(point.pointName);	
	$("#locationPopup").show();
	$("#map").css("bottom", $("#locationPopup").height());
}

function hideLocationPopup(point) { 
	$("#locationPopup").hide();
	$("#map").css("bottom", 0);
}

function createTableRow(name, icon, aircraftType, time) {
	return "<div class=\"tableRow\"><img src=\"icons/aircrafts/" + icon + 
		   ".png\" class=\"aircraftIcon\"><div class=\"aircraftName\"><b>"+ name + 
		   "</b> " + aircraftType + "</div><div class=\"time\">"+ time.substring(0,5) +"</div></div>";
}