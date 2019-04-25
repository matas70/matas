function HTMLMarker(attr){
	this.attr = attr;
    this.pos = attr.position;
    this.html = attr.html;
}

HTMLMarker.prototype = new google.maps.OverlayView();

HTMLMarker.prototype.onRemove= function(){
    this.div.parentNode.removeChild(this.div);
};

//init your html element here
HTMLMarker.prototype.onAdd= function(){
    this.div = document.createElement('DIV');
    this.div.className = "htmlMarker";
    this.div.style.position='absolute';
    this.div.innerHTML = this.html;
    this.div.style.zIndex = this.attr.zIndex;
    var panes = this.getPanes();
    panes.overlayLayer.appendChild(this.div);
    var self  = this;
    google.maps.event.addDomListener(this.div, "click", function(event) {
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
    this.div.style.left = (position.x - this.div.offsetWidth / 2) + 'px';
    this.div.style.top = (position.y - this.div.offsetHeight / 2) + 'px';
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
	}
};
