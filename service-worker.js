// ServiceWorker version : 13 (increase this number every time you want the cache to updated)

'use strict';

function createCacheBustedRequest(url) {
  let request = new Request(url, {cache: 'reload'});
  // See https://fetch.spec.whatwg.org/#concept-request-mode
  // This is not yet supported in Chrome as of M48, so we need to explicitly check to see
  // if the cache: 'reload' option had any effect.
  if ('cache' in request) {
    return request;
  }

  // If {cache: 'reload'} didn't have any effect, append a cache-busting URL parameter instead.
  let bustedUrl = new URL(url, self.location.href);
  bustedUrl.search += (bustedUrl.search ? '&' : '') + 'cachebust=' + Date.now();
  return new Request(bustedUrl);
}

var baseCacheFileList = [
    '/',
    '/index.html',
    'js/utils.js',
    'js/functions.js',
    'manifest.json',
    '/css/jquery-ui.css',
    '/js/jquery.min.js',
    '/js/jquery-ui.min.js',
    '/js/jquery.mobile-events.js'
];

var cacheFileList = [
    '/',
    '/index.html',
    // 'js/utils.js',
    // 'js/functions.js',
    // 'manifest.json',
    '/css/jquery-ui.css',
    '/js/jquery.min.js',
    '/js/jquery-ui.min.js',
    '/js/jquery.mobile-events.js',
    'js/slidingMarker/jquery.easing.1.3.js',
    'js/slidingMarker/markerAnimate.js',
    'js/slidingMarker/SlidingMarker.min.js',
    'js/utils.js',
    'js/AnimationModule.js',
    'js/date.js',
    'js/functions.js',
    'js/map.js',
    'js/leaflet-map.js',
    'js/markerclusterer.js',
    'js/popups.js',
    'js/RotateIcon.js',
    'data/aircrafts.json',
    'data/aircrafts-info.json',
    'data/categories.json',
    'data/routes.json',
    'js/leaflet/leaflet.css',
    'js/leaflet/leaflet-src.esm.js.map',
    'js/leaflet/leaflet.js',
    'js/leaflet/leaflet-src.js',
    'js/leaflet/leaflet.js.map',
    'js/leaflet/leaflet-src.js.map',
    'js/leaflet/leaflet-src.esm.js',
    'js/leaflet/images/layers.png',
    'js/leaflet/images/marker-icon-2x.png',
    'js/leaflet/images/layers-2x.png',
    'js/leaflet/images/marker-shadow.png',
    'js/leaflet/images/marker-icon.png',
    'js/leaflet/leaflet.markercluster.js',
    'icons/search.svg',
    'icons/clear-button.svg',
    'icons/genericAircraft.svg',
    'css/map.css',
    'css/hamburgers.css',
    'manifest.json',
    'images/group4@2x.png',
    'animation/loading.gif',
    'animation/parachute-alert.gif',
    'images/h125.jpg',
    'images/duchifat.jpg',
    'animation/Splash-71 smaller.gif',
    'images/karnaf.jpg',
    'images/kukiya.jpg',
    'images/lavi.jpg',
    'images/nahshon.jpg',
    'images/oval4Copy2.png',
    'images/oval4Copy2@2x.png',
    'images/oval4Copy3.png',
    'images/oval4Copy3@2x.png',
    'images/aboutblack@2x.png',
    'images/adir.jpg',
    'images/oval4Copy4.png',
    'images/aeroplan.png',
    'images/oval4Copy4@2x.png',
    'images/airTractor.jpg',
    'images/ambraer.jpg',
    'images/oval4Copy5.png',
    'images/armament@2x.png',
    'images/oval4Copy5@2x.png',
    'images/arrowCopy.png',
    'images/arrowCopy@2x.png',
    'images/page1.png',
    'images/page1@2x.png',
    //'images/austrian-shimshon.jpg',  // to big file and it is not needed - don't need to cache it.
    'images/barak.jpg',
    'images/page1Copy.png',
    'images/baz.jpg',
    'images/page1Copy@2x.png',
    'images/boeing787.jpg',
    //'images/britain-shimshon.jpg',   // to big file and it is not needed - don't need to cache it.
    'images/page1Copy6.png',
    'images/c17.jpg',
    'images/page1Copy6@2x.png',
    'images/c295.jpg',
    'images/efroni.jpg',
    'images/parachuting.png',
    'images/peten.jpg',
    'images/raam.jpg',
    'images/eurofighter.jpg',
    'images/exitBase.png',
    'images/f16g.jpg',
    'images/reem.jpg',
    'images/group10.png',
    'images/saraf.jpg',
    'images/group10@2x.png',
    'images/shimshon.jpg',
    'images/sufa.jpg',
    'images/group11.png',
    'images/tzufit.jpg',
    'images/group11@2x.png',
    'images/yanshuf.jpg',
    'images/yasur.jpg',
    'images/group12.png',
    'images/stearman.jpg',
    'images/harvard.jpg',
    'images/generic.jpg',
    'images/group12@2x.png',
    'images/group13.png',
    'images/group13@2x.png',
    'images/group3.png',
    'images/group3@2x.png',
    'images/group4.png',
    "images/fire.jpg",
    "images/band.jpg",
    "images/kipa.jpg",
    "images/yahalom.jpg",
    "images/simulator.jpg",
    "images/669.jpg",
    "images/tisanim.jpg",
    "images/shoval.jpg",
    "images/eitan.jpg",
    "images/atalef.jpg",
    'fonts/heebo-v3-hebrew_latin-300.svg',
    'fonts/heebo-v3-hebrew_latin-300.woff2',
    'fonts/heebo-v3-hebrew_latin-700.svg',
    'fonts/heebo-v3-hebrew_latin-700.woff2',
    'fonts/heebo-v3-hebrew_latin-regular.svg',
    'fonts/heebo-v3-hebrew_latin-regular.woff2',
    'icons/aboutIcon.png',
    'icons/aboutIconSelected.png',
    'icons/aerobatic.png',
    'icons/aircraft-menu/adir.svg',
    'icons/aircraft-menu/aerobatic.svg',
    'icons/aircraft-menu/airTractor.svg',
    'icons/aircraft-menu/ambrear.svg',
    'icons/aircraft-menu/barak.svg',
    'icons/aircraft-menu/baz.svg',
    'icons/aircraft-menu/boeing747.svg',
    'icons/aircraft-menu/boeing787.svg',
    'icons/aircraft-menu/c17.svg',
    'icons/aircraft-menu/c295.svg',
    'icons/aircraft-menu/efroni.svg',
    'icons/aircraft-menu/eitam.svg',
    'icons/aircraft-menu/eurofighter.svg',
    'icons/aircraft-menu/f16g.svg',
    'icons/aircraft-menu/h125.svg',
    'icons/aircraft-menu/duchifat.svg',
    'icons/aircraft-menu/karnaf.svg',
    'icons/aircraft-menu/lavi.svg',
    'icons/aircraft-menu/nahshon.svg',
    'icons/aircraft-menu/parachutist.svg',
    'icons/aircraft-menu/peten copy.svg',
    'icons/aircraft-menu/peten.svg',
    'icons/aircraft-menu/raam.svg',
    'icons/aircraft-menu/reem.svg',
    'icons/aircraft-menu/saifan.svg',
    'icons/aircraft-menu/saraf.svg',
    'icons/aircraft-menu/shahaf.svg',
    'icons/aircraft-menu/shimshon.svg',
    'icons/aircraft-menu/shimshon-britian.svg',
    'icons/aircraft-menu/shimshon-ostrian.svg',
    'icons/aircraft-menu/sufa.svg',
    'icons/aircraft-menu/tzufit.svg',
    'icons/aircraft-menu/yanshuf.svg',
    'icons/aircraft-menu/yasur.svg',
    'icons/aircraft-menu/simulator.svg',
    'icons/aircraft-menu/diamond_launcher.svg',
    'icons/aircraft-menu/iron_launcher.svg',
    'icons/aircraft-menu/maintenance.svg',
    'icons/aircraft-menu/band.svg',
    'icons/aircraft-menu/fire_truck.svg',
    'icons/aircraft-menu/eitan.svg',
    'icons/aircraft-menu/shoval.svg',
    'icons/aircraft-menu/harvard.svg',
    'icons/aircraft-menu/stearman.svg',
    'icons/aircraft-menu/thyssen.svg',
    'icons/aircraft-menu/building.svg',
    'icons/aircraft-menu/atalef.svg',
    'icons/aircrafts/harvard.svg',
    'icons/aircrafts/stearman.svg',
    'icons/aircrafts/adir.png',
    'icons/aircrafts/adir.svg',
    'icons/aircrafts/airTractor.png',
    'icons/aircrafts/airTractor.svg',
    'icons/aircrafts/ambrear.png',
    'icons/aircrafts/ambrear.svg',
    'icons/aircrafts/atalef.png',
    'icons/aircrafts/atalef.svg',
    'icons/aircrafts/barak.png',
    'icons/aircrafts/barak.svg',
    'icons/aircrafts/baz.png',
    'icons/aircrafts/baz.svg',
    'icons/aircrafts/boeing747.png',
    'icons/aircrafts/boeing747.svg',
    'icons/aircrafts/boeing787.png',
    'icons/aircrafts/boeing787.svg',
    'icons/aircrafts/c17.png',
    'icons/aircrafts/c17.svg',
    'icons/aircrafts/c295.png',
    'icons/aircrafts/c295.svg',
    'icons/aircrafts/efroni.png',
    'icons/aircrafts/efroni.svg',
    'icons/aircrafts/eitam.png',
    'icons/aircrafts/eitam.svg',
    'icons/aircrafts/eurofighter.png',
    'icons/aircrafts/eurofighter.svg',
    'icons/aircrafts/f16.png',
    'icons/aircrafts/f16g.png',
    'icons/aircrafts/f16g.svg',
    'icons/aircrafts/h125.png',
    'icons/aircrafts/h125.svg',
    'icons/aircrafts/duchifat.svg',
    'icons/aircrafts/karnaf.png',
    'icons/aircrafts/karnaf.svg',
    'icons/aircrafts/lavi.png',
    'icons/aircrafts/lavi.svg',
    'icons/aircrafts/nahshon.png',
    'icons/aircrafts/nahshon.svg',
    'icons/aircrafts/parachutist.png',
    'icons/aircrafts/peten.png',
    'icons/aircrafts/peten.svg',
    'icons/aircrafts/raam.png',
    'icons/aircrafts/raam.svg',
    'icons/aircrafts/reem.png',
    'icons/aircrafts/reem.svg',
    'icons/aircrafts/saifan.png',
    'icons/aircrafts/saifan.svg',
    'icons/aircrafts/saraf.png',
    'icons/aircrafts/saraf.svg',
    'icons/aircrafts/shachaf.svg',
    'icons/aircrafts/shahaf.png',
    'icons/aircrafts/shimshon.png',
    'icons/aircrafts/shimshon.svg',
    'icons/aircrafts/shimshon-britian.png',
    'icons/aircrafts/shimshon-britian.svg',
    'icons/aircrafts/shimshon-ostrian.png',
    'icons/aircrafts/shimshon-ostrian.svg',
    'icons/aircrafts/sufa.png',
    'icons/aircrafts/sufa.svg',
    'icons/aircrafts/tzufit.png',
    'icons/aircrafts/tzufit.svg',
    'icons/aircrafts/yanshuf.png',
    'icons/aircrafts/yanshuf.svg',
    'icons/aircrafts/yasur.menu.svg',
    'icons/aircrafts/yasur.png',
    'icons/aircrafts/fire_truck.svg',
    'icons/aircrafts/building.svg',
    'icons/aircrafts/band.svg',
    'icons/aircrafts/diamond_launcher.svg',
    'icons/aircrafts/iron_launcher.svg',
    'icons/aircrafts/maintenance.svg',
    'icons/aircrafts/simulator.svg',
    'icons/arrow.svg',
    'icons/arrowBlack.png',
    'icons/arrowBlackUp.png',
    'icons/bigLogo.png',
    'icons/closeIcon.png',
    'icons/countries/austria.svg',
    'icons/countries/britian.svg',
    'icons/countries/canada.svg',
    'icons/countries/greece.svg',
    'icons/countries/italian.svg',
    'icons/countries/poland.svg',
    'icons/group2.png',
    'icons/group2@2x.png',
    'icons/groups/group_cyan.svg',
    'icons/groups/group_darkgray.svg',
    'icons/groups/group_red.svg',
    'icons/groups/group_white.svg',
    'icons/groups/group_yellow.svg',
    'icons/headerLogo.png',
    'icons/headerLogo.svg',
    'icons/home.svg',
    'icons/iaf.png',
    'icons/iaf-small.png',
    'icons/location.svg',
    'icons/logo.svg',
    'icons/logo192x192.png',
    'icons/point-3bb5f2.svg',
    'icons/point-64e1a5.svg',
    'icons/point-bb7aff.svg',
    'icons/point-f64b58.svg',
    'icons/pointPress-3bb5f2.svg',
    'icons/pointPress-64e1a5.svg',
    'icons/pointPress-bb7aff.svg',
    'icons/pointPress-f64b58.svg',
    'icons/show-3bb5f2.svg',
    'icons/show-64e1a5.svg',
    'icons/show-bb7aff.svg',
    'icons/show-f64b58.svg',
    'icons/showSelected-3bb5f2.svg',
    'icons/showSelected-64e1a5.svg',
    'icons/showSelected-bb7aff.svg',
    'icons/showSelected-f64b58.svg',
    'icons/transparent.png',
    'icons/waze.svg',
    'icons/slidepopup.png',
    'icons/drone.png',
    'screenshots/screenshot1.png',
    'images/Matas_vector_map.svg?v=2'
    // doesn't work with font files... I don't know why...
    // 'fonts/heebo-v3-hebrew_latin-300.svg',
    // 'fonts/heebo-v3-hebrew_latin-300.woff2',
    // 'fonts/heebo-v3-hebrew_latin-700.svg',
    // 'fonts/heebo-v3-hebrew_latin-700.woff2',
    // 'fonts/heebo-v3-hebrew_latin-regular.svg',
    // 'fonts/heebo-v3-hebrew_latin-regular.woff2',
    // 'fonts/heebo-v4-latin-500.eot',
    // 'fonts/heebo-v4-latin-500.svg',
    // 'fonts/heebo-v4-latin-500.ttf',
    // 'fonts/heebo-v4-latin-500.woff',
    // 'fonts/heebo-v4-latin-500.woff2'
];

let firstTimeInstall = false;

 self.addEventListener('install', function(e) {
     firstTimeInstall = true;
     console.log("service-worker: install");
     e.waitUntil(self.skipWaiting()); // Activate worker immediately

     e.waitUntil(
         caches.open('matas').then(function(cache) {
             return cache.addAll(baseCacheFileList);
         })
     );
 });

self.addEventListener('fetch', (event) => {
     // console.log("service-worker: fetch - " + event.request.url);
     event.respondWith(async function() {
         try {
             return await fetch(event.request);
         } catch (err) {
             return caches.match(event.request,{ignoreSearch: true});
         }
     }());
 });

self.addEventListener('activate', event => {
    console.log("service-worker: activate");
    event.waitUntil(self.clients.claim()); // Become available to all pages
});

function areNotificationsAvailable() {
    return (Notification && Notification.permission === "granted");
}

self.addEventListener('sync', event => {
    console.log("service-worker: sync");
    event.waitUntil(new Promise((resolve) => {
        // schedule local push notifications
        if (areNotificationsAvailable()) {
            if (indexedDB) {
                console.log("opening database");
                var request = indexedDB.open('notifications', 1);
                request.onsuccess = function (event) {
                    console.log("success");
                    let notificationsDB = event.target.result;

                    // TODO: re-schedule timeout all of the notifications
                };
            }
        }
        resolve();
    }));
});

function notifyForEventOnLocation(locationName, timeBefore, showType) {
    // Let's check if the browser supports notifications
    if (areNotificationsAvailable()) {
        // Let's check whether notification permissions have already been granted
        if (Notification.permission === "granted") {


            let title = "מטס עצמאות 2019"
            let text;
            if (showType === "flight") text = `בעוד ${timeBefore} דקות יחלוף המטס מעל יישוב ${locationName}`;
            else if (showType === "airShow") text = `בעוד ${timeBefore} דקות יחל מופע אווירי ב${locationName}`;
            else if (showType === "aerobaticShow") text = `בעוד ${timeBefore} דקות יחל מופע אווירובטי ב${locationName}`;

            let notificationOptions =
                {
                    body: text,
                    icon: '../icons/logo192x192.png',
                    dir: "rtl",
                    lang: 'he',
                    badge: '../icons/logo192x192.png',
                    vibrate: [300, 100, 400],
                    data: {url: 'https://matas-iaf.com'}
                };

            // If it's okay let's create a notification
            self.registration.showNotification(title, notificationOptions);
        }
    }
}

/**
 * Riding on onMessage event to schedule notifications when browser is closed
 */
self.addEventListener('message', event => {
    console.log("service-worker: message - " + event.data.action);
    if (event.data.action === "loadCache" && firstTimeInstall) {
        console.log("Loading Extended Files to Cache...");
        event.waitUntil(caches.open('matas').then(cache => {
                cache.addAll(cacheFileList).catch((reason)=> {
                    console.error(reason);
                })
            }));
    }
});

self.addEventListener('notificationclick', function(event) {
    console.log("service-worker: notificationclick");
    event.notification.close();
    event.waitUntil(new Promise(resolve => {
        clients.openWindow(event.notification.data.url).then(x => {
            resolve();
        });
    }));
});
