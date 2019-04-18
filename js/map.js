markersMap = {};
selectedLocation = null;
selectedLocationMarker = null;
selectedLocationMarkerIcon = null;
aerobaticPoints = null;

googleMaps = {
    //const MAP_URL : "https://maps.googleapis.com/maps/api/js?key=AIzaSyCUHnpGpGO0nDr7Hy3nsnk85eIM75jGBd4&callback=initMap&language=he&region=IL";
    // new production key
    MAP_URL : "https://maps.googleapis.com/maps/api/js?key=AIzaSyC9SvKqEi2KwCecVLbG6257Xuu9SZf0azk&callback=initMap&language=he&region=IL",

    setAircraftMarkerIcon : (marker, url, anchor = 36) => {
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

    createAircraftMarker : (position, name, hide, clickEvent) => {
        aircraftMarker = new SlidingMarker({
            position: position,
            map: hide ? null : map,
            title: name,
            easing: "linear",
            optimized: false,
            zIndex: 9
        });

        // add "clicked" event
        aircraftMarker.addListener('click', (event) => {
            var items = googleMaps.getItemsInCircle(googleMaps.getPixelPosition(event.latLng), 32);
            if (items.locations.length == 0 && items.aircrafts.length == 1) {
                clickEvent();
            }
            else {
                openMapClusterPopup($.merge(items.aircrafts, items.locations));
                //alert("found multiple items, aircrafts:"+items.aircrafts.length+" locations:"+items.locations.length);
            }
        });


        return aircraftMarker;
    },

    toggleAircraftMarkerVisibility : (marker, shouldShow) => {
        if (!shouldShow) {
            marker.setMap(null);
        } else if (!marker.getMap()) {
            marker.setMap(map);
        }
    },

    currentHeadingMarker : null,
    currentPosition : null,
    currentHeading : null,

    createHeadingArea : (heading) => {
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

    createPositionIcon : () => {
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

    createPositionMarker : (position) => {
        //var currentHeadingIcon = createHeadingArea(0);
        //drawMarker(currentPosition, currentHeadingIcon, false);

        var currentPositionIcon = mapAPI.createPositionIcon();
        return mapAPI.drawMarker(currentPosition, currentPositionIcon, true);
    },

    updateCurrentHeading : (heading) => {
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
    drawMarker : (position, icon, shouldUseMap) => {
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
    focusOnLocation : (location, zoom = 12) => {
        map.setCenter(location);
        map.setZoom(zoom);
    },

    // location markers
    getMarkerIcon : (color, clicked, aerobatic) => {
        color = color.toLowerCase();

        if (!clicked){
            if(!aerobatic) {
                return {
                    url: "icons/point-" + color + ".svg",
                    // The anchor for this image is the center of the circle
                    anchor: new google.maps.Point(19, 19)
                };
            } else {
                return {
                    url: "icons/show-" + color + ".svg",
                    // The anchor for this image is the center of the circle
                    anchor: new google.maps.Point(22, 19)
                };
            }
        } else {
            if(!aerobatic){
                return {
                    url: "icons/pointPress-" + color + ".svg",
                    // The anchor for this image is the center of the circle
                    anchor: new google.maps.Point(22, 22)
                };
            } else {
                return {
                    url: "icons/showSelected-" + color + ".svg",
                    // The anchor for this image is the center of the circle
                    anchor: new google.maps.Point(22, 19)
                };
            }
        }
    },

    panTo : (map, location) => {
        map.panTo(location);
    },

    rad : (x) => {
        return x * Math.PI / 180;
    },

    distanceBetweenPixels : (p1, p2) => {
        var a = p1.x - p2.x;
        var b = p1.y - p2.y;
        var c = Math.sqrt(a * a + b * b);
        return c;
    },

    getPixelPosition : (position) => {
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

    getMarkerPosition : (marker) => {
        return {
            lat: marker.position.lat(),
            lng: marker.position.lng()
        };
    },

    getMarkerPixelPosition : (marker) => {
        return googleMaps.getPixelPosition(marker.getPosition());
    },

    getItemsInCircle : (pixel, radius) => {
        items = [];
        var aircraftsInCircle = $.map(aircrafts, (aircraft, index) => {
            var aircraftMarker = aircraftMarkers[aircraft.aircraftId];
            var aircraftPixel = googleMaps.getMarkerPixelPosition(aircraftMarker);
            if (aircraftMarker.map != null && googleMaps.distanceBetweenPixels(pixel, aircraftPixel) < radius) {
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

    drawRouteOnMap : (route) => {
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

        // create the points marker
        route.points.forEach((point) => {
            if (!point.hidden) {
                var markerIcon;
                var markerIconClicked;
                if (isPointAerobatic(point.pointId)) {
                    markerIcon = googleMaps.getMarkerIcon(route.color.toLowerCase(), false, true);
                    markerIconClicked = googleMaps.getMarkerIcon(route.color.toLowerCase(), true, true);
                } else {
                    markerIcon = googleMaps.getMarkerIcon(route.color.toLowerCase(), false, false);
                    markerIconClicked = googleMaps.getMarkerIcon(route.color.toLowerCase(), true, false);
                }
                var location = convertLocation(point.N, point.E);

                // draw marker for this location
                var marker = new google.maps.Marker({
                    position: location,
                    map: null,
                    title: "לחץ כדי להציג את רשימת המטוסים במיקום זה",
                    icon: markerIcon,
                    optimized: false,
                    zIndex: route.routeId
                });

                marker.addListener('click', (event) => {
                    var items = googleMaps.getItemsInCircle(googleMaps.getPixelPosition(event.latLng), 32);
                    if (items.locations.length == 1 && items.aircrafts == 0) {
                        if (selectedLocation == location) {
                            deselectLocation();
                        } else {
                            // first hide the previous popup
                            if (selectedLocation != null) {
                                deselectLocation(() => {
                                    // then show a new popup
                                    selectLocation(point.pointId, location, marker, markerIcon, markerIconClicked, "#" + route.color.toLowerCase(), "#" + route.primaryTextColor, "#" + route.secondaryTextColor);
                                });
                            } else {
                                // then show a new popup
                                selectLocation(point.pointId, location, marker, markerIcon, markerIconClicked, "#" + route.color.toLowerCase(), "#" + route.primaryTextColor, "#" + route.secondaryTextColor);
                            }
                        }
                    } else {
                        openMapClusterPopup($.merge(items.aircrafts, items.locations));
                        // alert("found multiple items, aircrafts:"+items.aircrafts.length+" locations:"+items.locations.length);
                    }
                });
                markersMap[point.pointId] = marker;
            }
        }, this);

        var markers = $.map(markersMap, (value, index) => {
            if (!isPointAerobatic(Number.parseInt(index))) return [value];
            else {
                value.setMap(map);
                return null;
            }
        });


        var markerCluster = new MarkerClusterer(map, markers,
            {
                styles: [
                    {
                        url: "icons/point-" + route.color.toLowerCase() + ".svg",
                        textSize: 1,
                        textColor: "#" + route.color.toLowerCase(),
                        width: 38,
                        height: 38
                    },
                    {
                        url: "icons/point-" + route.color.toLowerCase() + ".svg",
                        textSize: 1,
                        textColor: "#" + route.color.toLowerCase(),
                        width: 38,
                        height: 38
                    },
                    {
                        url: "icons/point-" + route.color.toLowerCase() + ".svg",
                        textSize: 1,
                        textColor: "#" + route.color.toLowerCase(),
                        width: 38,
                        height: 38
                    },
                    {
                        url: "icons/point-" + route.color.toLowerCase() + ".svg",
                        textSize: 1,
                        textColor: "#" + route.color.toLowerCase(),
                        width: 38,
                        height: 38
                    },
                    {
                        url: "icons/point-" + route.color.toLowerCase() + ".svg",
                        textSize: 1,
                        textColor: "#" + route.color.toLowerCase(),
                        width: 38,
                        height: 38
                    }],
                zIndex: route.routeId
            });
    },

    drawRoutesOnMap : (routes) => {
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
                    strokeOpacity: visible ? 1.0 : 0.2,
                    strokeWeight: 3,
                    fillOpacity: 0,
                    zIndex: zIndex,
                };
            } else if (ftype == "dropShadow") {
                return {
                    geodesic: true,
                    strokeOpacity: visible ? 0.1 : 0.0,
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

    loadPlugins : () => {
        $.getScript("js/slidingMarker/jquery.easing.1.3.js");
        $.getScript("js/slidingMarker/markerAnimate.js");
        $.getScript("js/markerclusterer.js");
        $.getScript("js/slidingMarker/SlidingMarker.min.js");
    },

    createMapObject : (clickCallback) => {
        map = new google.maps.Map(document.getElementById('map'),
            {
                center: {lat: 32.00, lng: 35.00},
                zoom: 8,
                gestureHandling: 'greedy',
                disableDefaultUI: true
            });

        map.addListener('click', clickCallback);
        return map;
    },

    updateMarkerPosition : (marker, position, animationDuration) => {
        marker.setDuration(animationDuration);
        marker.setPosition(position);
    },

    setZoomCallback : (zoomCallback) => {
        google.maps.event.addListener(map, 'zoom_changed', zoomCallback);
    },

    getZoomLevel : () => {
        return map.getZoom();
    },

    getMapFromMarker : (marker) => {
        return marker.getMap();
    },

    isMarkerVisible : (marker) => {
        return marker.getMap() != null;
    }
}
