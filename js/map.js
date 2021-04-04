markersMap = {};
selectedLocation = null;
selectedLocationMarker = null;
selectedLocationMarkerIcon = null;
aerobaticPoints = null;


googleMaps = {
    // new production key
    MAP_URL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyBXqrBxK2oQ9phgZNso5oklGl5CwLJu5xo&callback=initMap&language=he&region=IL",

    setAircraftMarkerIcon: (marker, url, anchor = 36) => {
        if (anchor != null) {
            marker.setIcon({
                url: url,
                //scaledSize: new google.maps.Size(scale, scale),
                anchor: new google.maps.Point(anchor, anchor)
            });
        } else {
            marker.setIcon({
                url: url
            });
        }
    },

    setMarkerIcon : (marker, icon) => {
        marker.setIcon(icon);
    },

    createAircraftMarker: (position, name, hide, clickEvent) => {
        aircraftMarker = new SlidingMarker({
            position: position,
            map: map,
            title: name,
            easing: "linear",
            optimized: false,
            zIndex: 101
        });

        // add "clicked" event
        aircraftMarker.addListener('click', (event) => {
            var items = googleMaps.getItemsInCircle(googleMaps.getPixelPosition(event.latLng), 32);
            if (items.locations.length == 0 && items.aircrafts.length == 1) {
                clickEvent();
            } else {
                openMapClusterPopup($.merge(items.aircrafts, items.locations));
                //alert("found multiple items, aircrafts:"+items.aircrafts.length+" locations:"+items.locations.length);
            }
        });

        return aircraftMarker;
    },

    toggleAircraftMarkerVisibility: (marker, shouldShow) => {
        if (!shouldShow) {
            marker.setVisible(false);
        } else {
            marker.setVisible(true);
        }
    },

    currentHeadingMarker: null,
    currentPosition: null,
    currentHeading: null,

    createHeadingArea: (heading) => {
        return {
            path: "M0 0 L32 -64 L-32 -64 Z",
            strokeOpacity: 0,
            fillColor: "#f44242",
            fillOpacity: 0.4,
            scale: 1.5,
            rotation: -heading - 90,
            origin: new google.maps.Point(0, 0)
        };
    },

    createPositionIcon: () => {
        return {
            path: google.maps.SymbolPath.CIRCLE,
            strokeOpacity: 0.8,
            strokeColor: "black",
            strokeWeight: 1,
            fillColor: "#f44242",
            fillOpacity: 0.8,
            scale: 5,
            origin: new google.maps.Point(0, 0)
        };
    },

    createPositionMarker: (position) => {
        //var currentHeadingIcon = createHeadingArea(0);
        //drawMarker(currentPosition, currentHeadingIcon, false);

        var currentPositionIcon = mapAPI.createPositionIcon();
        return mapAPI.drawMarker(currentPosition, currentPositionIcon, true);
    },

    updateCurrentHeading: (heading) => {
        currentHeading = heading;
        currentHeadingMarker.setIcon(createHeadingArea(currentHeading));
        currentHeadingMarker.setMap(map);
    },

    /**
     * draws a marker on the map given a location and icon
     * @param position - the position to draw the marker
     * @param icon - the icon of the marker
     * @param shouldUseMap - should the map be
     */
    drawMarker: (position, icon, shouldUseMap) => {
        var marker = new SlidingMarker({
            position: position,
            map: shouldUseMap ? map : null,
            icon: icon
        });
        return marker;
    },

    /**
     * Sets the map's focus on the given location and zooms in on it
     * @param location
     */
    focusOnLocation: (location, zoom = 12) => {
        map.setCenter(location);
        map.setZoom(zoom);
    },

    // location markers
    getMarkerIcon: (color, clicked, aerobatic, label, point) => {
        color = color.toLowerCase();
        var iconUrl;

        if (!clicked) {
            iconUrl = googleMaps.getMarkerIconUrl(color, false, aerobatic, label, point);
        } else {
            iconUrl = googleMaps.getMarkerIconUrl(color, true, aerobatic, label, point);
        }
        var markerHtml = /*html*/`
            <div class="locationMarkerDivGmaps">
                <div class="locationIconContainer">
                    <img class="locationMarkerIcon" src="${iconUrl}">
                </div>
                <span class="locationMarkerLabel">${label}</span>
            </div>
        `;

        return markerHtml;
    },

    panTo: (map, location) => {
        map.panTo(location);
    },

    rad: (x) => {
        return x * Math.PI / 180;
    },

    distanceBetweenPixels: (p1, p2) => {
        var a = p1.x - p2.x;
        var b = p1.y - p2.y;
        var c = Math.sqrt(a * a + b * b);
        return c;
    },

    getPixelPosition: (position) => {
        var scale = Math.pow(2, map.getZoom());
        var nw = new google.maps.LatLng(
            map.getBounds().getNorthEast().lat(),
            map.getBounds().getSouthWest().lng()
        );
        var worldCoordinateNW = map.getProjection().fromLatLngToPoint(nw);
        var worldCoordinate = map.getProjection().fromLatLngToPoint(position);
        var pixelOffset = new google.maps.Point(
            Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
            Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
        );
        return pixelOffset;
    },

    getMarkerPosition: (marker) => {
        return {
            lat: marker.position.lat(),
            lng: marker.position.lng()
        };
    },

    getMarkerPixelPosition: (marker) => {
        return googleMaps.getPixelPosition(marker.getPosition());
    },

    getItemsInCircle: (pixel, radius) => {
        items = [];
        var aircraftsInCircle = $.map(aircrafts, (aircraft, index) => {
            var aircraftMarker = aircraftMarkers[aircraft.aircraftId];
            var aircraftPixel = googleMaps.getMarkerPixelPosition(aircraftMarker);
            if (aircraftMarker.getVisible() && aircraftMarker.map != null && googleMaps.distanceBetweenPixels(pixel, aircraftPixel) < radius) {
                return [aircraft];
            } else {
                return [];
            }
        });

        var locationsInCircle = $.map(locations, (location, index) => {
            if (location !== undefined && markersMap[location.pointId] !== undefined) {
                var locationMarker = markersMap[location.pointId];
                var aircraftPixel = googleMaps.getMarkerPixelPosition(locationMarker);
                if (googleMaps.distanceBetweenPixels(pixel, aircraftPixel) < radius) {
                    return [location];
                } else {
                    return [];
                }
            } else return [];
        });
        return {aircrafts: aircraftsInCircle, locations: locationsInCircle};
    },

    getMarkerIconUrl: (color, clicked, aerobatic, label, point) => {
        color = color.toLowerCase();
        iconUrl = "icons/point-" + color + ".svg";


        if (!clicked) {
            if(point && point.options && point.options.liveStream) {
                iconUrl = "icons/live-stream-point.svg";
            } else if (point && point.type === "hospital") {
                iconUrl = "icons/hospital.svg";
            } else if(aerobatic) {
                iconUrl = "icons/show-" + color + ".svg";
            } else {
                iconUrl = "icons/point-" + color + ".svg";
            }
        } else {
            if(point && point.options && point.options.liveStream) {
                iconUrl = "icons/live-stream-point.svg";
            } else if (point && point.type === "hospital") {
                iconUrl = "icons/hospital-clicked.svg";
            } else if(aerobatic) {
                iconUrl = "icons/showSelected-" + color + ".svg";
            } else {
                iconUrl = "icons/pointPress-" + color + ".svg";
            }
        }

        return iconUrl;
    },

    drawRouteOnMap: (route) => {
        // create the line path
        var path = [];
        for (var i = 0; i < route.points.length; i++) {
            path[i] = convertLocation(route.points[i].N, route.points[i].E);
        }

        // add lines as data layer
        var data = new google.maps.Data.LineString(path);
        var dropShadowFeature = new google.maps.Data.Feature();
        dropShadowFeature.setGeometry(data);
        dropShadowFeature.setProperty("type", "dropShadow");
        dropShadowFeature.setProperty("visibile", route.visible);

        var pathFeature = new google.maps.Data.Feature();
        pathFeature.setGeometry(data);
        pathFeature.setProperty("zIndex", route.routeId);
        pathFeature.setProperty("color", "#" + route.color.toLowerCase());
        pathFeature.setProperty("type", "path");
        pathFeature.setProperty("visibile", route.visible);

        map.data.add(dropShadowFeature);
        map.data.add(pathFeature);

        var allMarkers = [];
        var specialMarkers = [];

        // create the points marker
        route.points.forEach((point) => {
            if (!point.hidden) {
                var markerIcon;
                var markerIconClicked;
                var aerobatic = isPointAerobatic(point.pointId);
                var location = convertLocation(point.N, point.E);


                var markerHtml = googleMaps.getMarkerIcon(route.color, false, aerobatic, point.pointName, point);
                var markerHtmlClicked = googleMaps.getMarkerIcon(route.color, true, aerobatic, point.pointName, point);

                // draw marker for this location
                var marker = new HTMLMarker({
                    position: new google.maps.LatLng(location.lat, location.lng),
                    html: markerHtml,
                    zIndex: 100,
                    class: "htmlMarker"
                });

                marker.addListener('click', (event) => {
                    var items = googleMaps.getItemsInCircle(googleMaps.getPixelPosition(event.latLng), 32);
                    if (items.locations.length === 1 && items.aircrafts.length === 0) {
                        if (selectedLocation === location) {
                            deselectLocation();
                        } else {
                            // first hide the previous popup
                            if (selectedLocation != null) {
                                deselectLocation(() => {
                                    // then show a new popup
                                    selectLocation(point.pointId, location, marker, markerHtml, markerHtmlClicked, "#" + route.color.toLowerCase(), "#" + route.primaryTextColor, "#" + route.secondaryTextColor);
                                });
                            } else {
                                // then show a new popup
                                selectLocation(point.pointId, location, marker, markerHtml, markerHtmlClicked, "#" + route.color.toLowerCase(), "#" + route.primaryTextColor, "#" + route.secondaryTextColor);
                            }
                        }
                    } else {
                        openMapClusterPopup($.merge(items.aircrafts, items.locations));
                        // alert("found multiple items, aircrafts:"+items.aircrafts.length+" locations:"+items.locations.length);
                    }
                });
                markersMap[point.pointId] = marker;
                if (!isPointAerobatic(point.pointId))
                    allMarkers.push(marker);
                else
                    marker.setMap(map);
            }
        }, this);

        var markerCluster = new MarkerClusterer(map, allMarkers,
            {
                gridSize: 100,
                styles: [
                    {
                        url: "icons/point-" + route.color.toLowerCase() + ".svg",
                        textSize: 1,
                        textColor: "#" + route.color.toLowerCase(),
                        width: 38,
                        height: 38,
                        zIndex: 100
                    },
                    {
                        url: "icons/point-" + route.color.toLowerCase() + ".svg",
                        textSize: 1,
                        textColor: "#" + route.color.toLowerCase(),
                        width: 38,
                        height: 38,
                        zIndex: 100
                    },
                    {
                        url: "icons/point-" + route.color.toLowerCase() + ".svg",
                        textSize: 1,
                        textColor: "#" + route.color.toLowerCase(),
                        width: 38,
                        height: 38,
                        zIndex: 100
                    },
                    {
                        url: "icons/point-" + route.color.toLowerCase() + ".svg",
                        textSize: 1,
                        textColor: "#" + route.color.toLowerCase(),
                        width: 38,
                        height: 38,
                        zIndex: 100
                    },
                    {
                        url: "icons/point-" + route.color.toLowerCase() + ".svg",
                        textSize: 1,
                        textColor: "#" + route.color.toLowerCase(),
                        width: 38,
                        height: 38,
                        zIndex: 100
                    }],
            });
    },

    drawRoutesOnMap: (routes) => {
        // set style options for routes
        map.data.setStyle((feature) => {
            var color = feature.getProperty('color');
            var ftype = feature.getProperty('type');
            var visible = feature.getProperty('visibile');
            var zIndex = feature.getProperty('zIndex');

            if (ftype == "path") {
                return {
                    geodesic: true,
                    strokeColor: color,
                    strokeOpacity: visible ? 1.0 : 0.5,
                    strokeWeight: 3,
                    fillOpacity: 0,
                    zIndex: zIndex,
                };
            } else if (ftype == "dropShadow") {
                return {
                    geodesic: true,
                    strokeOpacity: visible ? 0.5 : 0.0,
                    strokeColor: "black",
                    strokeWeight: 6,
                    fillOpacity: 0,
                    zIndex: 0
                };
            }
            return {};
        });
        aerobaticPoints = getAerobaticsPoints();

        // add all routes
        routes.forEach((route) => {
            googleMaps.drawRouteOnMap(route);
        }, this);
    },

    loadPlugins: (callback) => {
        $.when(
            $.getScript("js/slidingMarker/jquery.easing.1.3.js"),
            $.getScript("js/slidingMarker/markerAnimate.js"),
            $.getScript("js/markerclusterer.js"),
            $.getScript("js/slidingMarker/SlidingMarker.min.js"),
            $.getScript("js/HTMLMarker.js"),

            $.Deferred(function (deferred) {
                $(deferred.resolve);
            })
        ).done(function () {
            callback.call(this);
        });
    },

    createMapObject: (clickCallback) => {
        map = new google.maps.Map(document.getElementById('map'),
            {
                center: {lat: 31.20, lng: 34.97},
                zoom: ($(window).height() > 950) ? 8 : 7,
                minZoom: 7,
                gestureHandling: 'greedy',
                disableDefaultUI: true,
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [
                              { visibility: "off" }
                        ]
                    }
                ]
            });

        map.addListener('click', clickCallback);
        return map;
    },

    updateMarkerPosition: (marker, position, animationDuration) => {
        marker.setDuration(animationDuration);
        marker.setPosition(position);
    },

    setZoomCallback: (zoomCallback) => {
        google.maps.event.addListener(map, 'zoom_changed', zoomCallback);
    },

    getZoomLevel: () => {
        return map.getZoom();
    },

    getMapFromMarker: (marker) => {
        return marker.getMap();
    },

    isMarkerVisible: (marker) => {
        return marker.getVisible();
    },
    panALittle: () => {
        map.panTo(map.getCenter());
    },
    getMarkerHtml: (marker) => {
        return marker.html;
    },
    setMarkerHtml: (marker, html) => {
        marker.html = html;
        return marker;
    },
    getMarkerIconHtml: (markerIcon) => {
        return markerIcon;
    },
    setMarkerIconHtml: (markerIcon, html) => {
        markerIcon = html;
        return markerIcon;
    },
    getMarkerIconToSet: (marker) => {
        return marker.html;
    },
    circleClassName:  "",
};
