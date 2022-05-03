function HTMLMarker(attr){
	this.attr = attr;
    this.pos = attr.position;
    this.html = attr.html;
}

HTMLMarker.prototype = new google.maps.OverlayView();

HTMLMarker.prototype.onRemove= function(){
    if (this.div  != null) {
        this.div.parentNode.removeChild(this.div);
        this.clickableDiv.parentNode.removeChild(this.clickableDiv);
    }
};

//init your html element here
HTMLMarker.prototype.onAdd= function(){
    var panes = this.getPanes();

    // create visual marker (doesn't receive DOM events)
    this.div = document.createElement('DIV');
    if (this.attr.class) {
        this.div.className = this.attr.class;
    }
    this.div.style.position='absolute';
    this.div.innerHTML = this.html;
    this.div.style.zIndex = this.attr.zIndex;
    panes.markerLayer.appendChild(this.div);

    // create clickable marker (invisible but receives DOM events)
    this.clickableDiv = document.createElement('DIV');
    this.clickableDiv.style.position='absolute';
    this.clickableDiv.innerHTML = this.html;
    this.clickableDiv.style.zIndex = this.attr.zIndex;
    this.clickableDiv.style.opacity = 0;
    panes.overlayMouseTarget.appendChild(this.clickableDiv);
    google.maps.OverlayView.preventMapHitsFrom(this.clickableDiv);


    var self  = this;
    google.maps.event.addDomListener(this.clickableDiv, "click", function(event) {
        clickEvent = {latLng: self.pos};
        google.maps.event.trigger(self, "click", clickEvent);
    });
};

HTMLMarker.prototype.setVisible = function(visible) {
    if (this.div != null) {
        if (visible)
            this.div.style.display = "block";
        else
            this.div.style.display = "none";
    }
};

HTMLMarker.prototype.draw = function(){
    var overlayProjection = this.getProjection();
    var position = overlayProjection.fromLatLngToDivPixel(this.pos);
    var panes = this.getPanes();
    this.div.style.left = Math.round(position.x - this.div.offsetWidth / 2) + 'px';
    this.div.style.top = Math.round(position.y - this.div.offsetHeight / 2) + 'px';
    this.clickableDiv.style.left = Math.round(position.x - this.clickableDiv.offsetWidth / 2) + 'px';
    this.clickableDiv.style.top = Math.round(position.y - this.clickableDiv.offsetHeight / 2) + 'px';
};

HTMLMarker.prototype.getPosition = function() {
	return this.pos;
};

HTMLMarker.prototype.setPosition = function(pos) {
    this.pos = pos;
};

HTMLMarker.prototype.setIcon = function(html) {
	this.html = html;
	// Though this doesn't make the div appear magically, it help zooming onto the point to draw it later
	if (this.div) {
        this.div.innerHTML = this.html;
        this.clickableDiv.innerHTML = this.html;
	}
};
