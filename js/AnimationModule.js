var _delay = 30,    //Time in ms between each frame of the animation
    EARTH_RADIUS_KM = 6378.1;

this.BaseAnimation = function (renderFrameCallback, duration) {
    var _timerId,
        frameIdx = 0,
        _isPaused = false;

    //Varify value
    duration = (duration && duration > 0) ? duration : 1000;

    this.play = function () {
        if (renderFrameCallback) {
            if (_timerId) {
                _isPaused = false;
            } else {
                _timerId = setInterval(function () {
                    if (!_isPaused) {
                        var progress = (frameIdx * _delay) / duration;

                        renderFrameCallback(progress, frameIdx);

                        if (progress >= 1) {
                            reset();
                        }

                        frameIdx++;
                    }
                });
            }
        }
    };

    this.pause = function () {
        _isPaused = true;
    };

    this.stop = function () {
        reset();
    };

    function reset() {
        if (_timerId != null) {
            clearInterval(_timerId);
        }

        frameIdx = 0;
        _isPaused = false;
    }
};


this.PathAnimation = function (path, intervalCallback, isGeodesic, duration) {
    var _totalDistance = 0,
        _intervalLocs = [path[0]],
        _intervalIdx = [0],
        _frameCount = Math.ceil(duration / _delay), idx;

    var progress, dlat, dlon;

    if (isGeodesic) {
        //Calcualte the total distance along the path in KM's.
        for (var i = 0; i < path.length - 1; i++) {
            _totalDistance += haversineDistance(path[i], path[i + 1]);
        }
    }else{
        //Calcualte the total distance along the path in degrees.
        for (var i = 0; i < path.length - 1; i++) {
            dlat = (path[i + 1].latitude - path[i].latitude);
            dlon = (path[i + 1].longitude - path[i].longitude);

            _totalDistance += Math.sqrt(dlat*dlat + dlon*dlon);
        }
    }

    //Pre-calculate midpoint locations for smoother rendering.
    for (var f = 0; f < _frameCount; f++) {
        progress = (f * _delay) / duration;

        var travel = progress * _totalDistance;
        var alpha;
        var dist = 0;
        var dx = travel;

        for (var i = 0; i < path.length - 1; i++) {

            if(isGeodesic){
                dist += haversineDistance(path[i], path[i + 1]);
            }else {
                dlat = (path[i + 1].latitude - path[i].latitude);
                dlon = (path[i + 1].longitude - path[i].longitude);
                alpha = Math.atan2(dlat * Math.PI / 180, dlon * Math.PI / 180);
                dist += Math.sqrt(dlat * dlat + dlon * dlon);
            }

            if (dist >= travel) {
                idx = i;
                break;
            }

            dx = travel - dist;
        }

        if (dx != 0 && idx < path.length - 1) {
            if (isGeodesic) {
                var bearing = calculateBearing(path[idx], path[idx + 1]);
                _intervalLocs.push(calculateCoord(path[idx], bearing, dx));
            }else{
                dlat = dx * Math.sin(alpha);
                dlon = dx * Math.cos(alpha);

                _intervalLocs.push(new Microsoft.Maps.Location(path[idx].latitude + dlat, path[idx].longitude + dlon));
            }

            _intervalIdx.push(idx);
        }
    }

    //Ensure the last location is the last coordinate in the path.
    _intervalLocs.push(path[path.length - 1]);
    _intervalIdx.push(path.length - 1);

    return new BaseAnimation(
        function (progress, frameIdx) {

            if (intervalCallback) {
                intervalCallback(_intervalLocs[frameIdx], _intervalIdx[frameIdx], frameIdx);
            }
        }, duration);
};