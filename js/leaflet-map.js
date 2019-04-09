leafletMaps = {
    MAP_URL : "",

    setAircraftMarkerIcon : (marker, url, anchor = 36) => {
        marker.setIcon(L.icon({
            iconUrl: url,
            iconAnchor: anchor != null ? undefined : [anchor, anchor],
            className: "marker-fix"
        }));
    },

    setMarkerIcon : (marker, icon) => {
        marker.setIcon(icon);
    },

    selectedLocation : null,
    selectedLocationMarker : null,
    selectedLocationMarkerIcon : null,

    createAircraftMarker : (position, name, hide, clickEvent) => {
        var marker = L.marker(position, {
            title: name,
            opacity: hide ? 0 : 1,
        });

        marker.on('click', (event) => {
            var items = leafletMaps.getItemsInCircle(leafletMaps.getPixelPosition(event.latlng), 32);
            if (items.locations.length == 0 && items.aircrafts.length == 1) {
                clickEvent();
            }
            else {
                openMapClusterPopup($.merge(items.aircrafts, items.locations));
            }
        });

        marker.addTo(map);

        return marker;
    },

    toggleAircraftMarkerVisibility : (marker, shouldShow) => {
        marker.setOpacity(shouldShow ? 1 : 0);
    },

    currentHeadingMarker : null,
    currentPosition : null,
    currentHeading : null,

    createPositionMarker : (position) => {
        marker = L.circleMarker(position,
            {
                radius: 8,
                fillColor: "#f44242",
                fillOpacity: 0.8,
                strokeOpacity: 0.8,
                strokeColor: "black",
                strokeWeight: 1
            });
        marker.addTo(map);
        return marker;
    },

    /**
     * draws a marker on the map given a location and icon
     * @param position - the position to draw the marker
     * @param icon - the icon of the marker
     * @param shouldUseMap - should the map be
     */
    drawMarker : (position, icon, isVisible) => {
        var marker = L.marker(position, {
            title: name,
            opacity: isVisible ? 0 : 1,
            icon: L.icon({iconUrl: icon})
        });

        marker.addTo(map);

        return marker;
    },

    /**
     * Sets the map's focus on the given location and zooms in on it
     * @param location
     */
    focusOnLocation : (location, zoom = 12) => {
        map.panTo(location, {animate: false})
        map.setZoom(zoom);
    },

    // location markers
    getMarkerIcon : (color, clicked) => {
        if (!clicked)
            return L.icon({
                iconUrl: "icons/pointSmall-" + color + ".png",
                iconAnchor: [14, 14]
            });
        else return L.icon({
            iconUrl: "icons/pointPress-" + color + ".png",
            iconAnchor: [20, 20]
        });
    },

    panTo : (map, location) => {
        map.panTo(location);
    },

    markersMap : {},

    rad : function (x) {
        return x * Math.PI / 180;
    },

    distanceBetweenPixels : (p1, p2) => {
        var a = p1.x - p2.x;
        var b = p1.y - p2.y;
        var c = Math.sqrt(a * a + b * b);
        return c;
    },

    getPixelPosition : (position) => {
        return map.latLngToContainerPoint(position);
    },

    getMarkerPosition : (marker) => {
        return {
            lat: marker.getLatLng().lat,
            lng: marker.getLatLng().lng
        };
    },

    getMarkerPixelPosition : (marker) => {
        return leafletMaps.getPixelPosition(marker.getLatLng());
    },

    getItemsInCircle : (pixel, radius) => {
        items = [];
        var aircraftsInCircle = $.map(aircrafts, function (aircraft, index) {
            var aircraftMarker = aircraftMarkers[aircraft.aircraftId];
            var aircraftPixel = leafletMaps.getMarkerPixelPosition(aircraftMarker);
            if (aircraftMarker.options.opacity > 0 && leafletMaps.distanceBetweenPixels(pixel, aircraftPixel) < radius) {
                return [aircraft];
            } else {
                return [];
            }
        });

        var locationsInCircle = $.map(locations, function (location, index) {
            if (location !== undefined && markersMap[location.pointId] !== undefined) {
                var locationMarker = markersMap[location.pointId];
                var aircraftPixel = leafletMaps.getMarkerPixelPosition(locationMarker);
                if (leafletMaps.distanceBetweenPixels(pixel, aircraftPixel) < radius) {
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
        if (route.visible) {
            var pathLine = L.polyline(path, {color: "#" + route.color, weight: 4, riseOffset: route.routeId});
            var pathShadow = L.polyline(path, {color: "black", weight: 5, opacity: 0.5, riseOffset: 0});
            pathShadow.addTo(map);
            pathLine.addTo(map);
        }

        var markerIcon = leafletMaps.getMarkerIcon(route.color, false);
        var markerIconClicked = leafletMaps.getMarkerIcon(route.color, true);
        //
        // // create the points marker
        route.points.forEach((point) => {
            if (!point.hidden) {
                // draw marker for this location
                var location = convertLocation(point.N, point.E);
                var marker = L.marker(location, {
                    icon: markerIcon,
                    riseOffset: route.routeId,
                    title: "לחץ כדי להציג את רשימת המטוסים במיקום זה"
                });

                marker.on('click', (event) => {
                    var items = leafletMaps.getItemsInCircle(leafletMaps.getPixelPosition(event.latlng), 32);
                    if (items.locations.length == 1 && items.aircrafts == 0) {
                        if (selectedLocation == location) {
                            deselectLocation();
                        } else {
                            // first hide the previous popup
                            if (selectedLocation != null) {
                                deselectLocation(() => {
                                    // then show a new popup
                                    selectLocation(point.pointId, location, marker, markerIcon, markerIconClicked, "#" + route.color, "#" + route.primaryTextColor, "#" + route.secondaryTextColor);
                                });
                            } else {
                                // then show a new popup
                                selectLocation(point.pointId, location, marker, markerIcon, markerIconClicked, "#" + route.color, "#" + route.primaryTextColor, "#" + route.secondaryTextColor);
                            }
                        }
                    } else {
                        openMapClusterPopup($.merge(items.aircrafts, items.locations));
                    }
                });

                marker.addTo(map);

                markersMap[point.pointId] = marker;
            }
        }, this);

        // TODO: support clusters
        // var markers = $.map(markersMap, function(value, index) {
        //     return [value];
        // });
        //
        // var markerCluster = new MarkerClusterer(map, markers,
        //     {
        //         styles: [
        //             {url: "icons/pointSmall-"+route.color+".png", textSize: 1, textColor: "#" + route.color, width: 27, height:27},
        //             {url: "icons/pointSmall-"+route.color+".png", textSize: 1,  textColor: "#" + route.color, width: 27, height:27},
        //             {url: "icons/pointSmall-"+route.color+".png", textSize: 1,  textColor: "#" + route.color, width: 27, height:27},
        //             {url: "icons/pointSmall-"+route.color+".png", textSize: 1,  textColor: "#" + route.color, width: 27, height:27},
        //             {url: "icons/pointSmall-"+route.color+".png", textSize: 1,  textColor: "#" + route.color, width: 27, height:27}],
        //         zIndex: route.routeId
        //     });
    },

    drawRoutesOnMap : (routes) => {
        map.invalidateSize();

        // add all routes
        routes.forEach((route) => {
            leafletMaps.drawRouteOnMap(route);
        }, this);
    },

    loadPlugins : () => {
        // $.getScript("js/slidingMarker/jquery.easing.1.3.js");
        // $.getScript("js/slidingMarker/markerAnimate.js");
        // $.getScript("js/markerclusterer.js");
        // $.getScript("js/slidingMarker/SlidingMarker.min.js");
    },

    addOfflineMap : (map) => {
        L.imageOverlay('/images/Matas_vector_map.svg', [[26.7, 30.7], [36, 39.48]]).addTo(map)
    },
    
    createMapObject : (clickCallback) => {
        var map = L.map('map').setView([32.00, 35.00], 8);

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibGVvMjEyIiwiYSI6ImNqdTc5b2c2bjFta2c0M25yYTM4Mzl4cmYifQ.2WIyCJuvt3ErquZS1A3tCg', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox.streets',
            accessToken: 'pk.eyJ1IjoibGVvMjEyIiwiYSI6ImNqdTc5b2c2bjFta2c0M25yYTM4Mzl4cmYifQ.2WIyCJuvt3ErquZS1A3tCg'
        }).addTo(map);

        map.on('click', clickCallback);

        leafletMaps.addOfflineMap(map);

        return map;
    },

    updateMarkerPosition : (marker, position, animationDuration) => {
        // TODO: set duration of animation when using sliding marker - marker.setDuration(animationDuration);
        marker.setLatLng(position);
    },

    setZoomCallback : (zoomCallback) => {
        map.on('zoom', function () {
            zoomCallback();
        });
    },

    getZoomLevel : () => {
        return map.getZoom();
    },

    getMapFromMarker : (marker) => {
        return map;
    },

    isMarkerVisible : (marker) => {
        return marker.options.alpha > 0;
    }    
}