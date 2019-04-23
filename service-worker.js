// ServiceWorker version : 11 (increase this number every time you want the cache to updated)

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
    'css/map.css',
    'css/hamburgers.css',
    'manifest.json'
];

var cacheFileList = [
    '/?simulation=120',
    'images/group4@2x.png',
    'animation/loading.gif',
    'images/group4@3x.png',
    'animation/parachute-alert.gif',
    'images/h125.jpg',
    'animation/Splash.gif?v=1',
    'animation/Splash.gif',
    'animation/Splash.jpg',
    'images/karnaf.jpg',
    'images/kukiya.jpg',
    'images/lavi.jpg',
    'images/nahshon.jpg',
    'images/oval4Copy2.png',
    'images/oval4Copy2@2x.png',
    'images/oval4Copy2@3x.png',
    'images/oval4Copy3.png',
    'images/oval4Copy3@2x.png',
    'images/aboutblack@2x.png',
    'images/oval4Copy3@3x.png',
    'images/adir.jpg',
    'images/oval4Copy4.png',
    'images/aeroplan.png',
    'images/oval4Copy4@2x.png',
    'images/airTractor.jpg',
    'images/oval4Copy4@3x.png',
    'images/ambraer.jpg',
    'images/oval4Copy5.png',
    'images/armament@2x.png',
    'images/oval4Copy5@2x.png',
    'images/arrowCopy.png',
    'images/oval4Copy5@3x.png',
    'images/arrowCopy@2x.png',
    'images/page1.png',
    'images/arrowCopy@3x.png',
    'images/page1@2x.png',
    'images/austrian-shimshon.jpg',
    'images/page1@3x.png',
    'images/barak.jpg',
    'images/page1Copy.png',
    'images/baz.jpg',
    'images/page1Copy@2x.png',
    'images/boeing787.jpg',
    'images/page1Copy@3x.png',
    'images/britain-shimshon.jpg',
    'images/page1Copy6.png',
    'images/c17.jpg',
    'images/page1Copy6@2x.png',
    'images/c295.jpg',
    'images/page1Copy6@3x.png',
    'images/efroni.jpg',
    'images/parachuting.png',
    'images/efroniPic.png',
    'images/peten.jpg',
    'images/efroniPic@2x.png',
    'images/raam.jpg',
    'images/efroniPic@3x.png',
    'images/rectangle8.png',
    'images/eurofighter.jpg',
    'images/rectangle8@2x.png',
    'images/exitBase.png',
    'images/rectangle8@3x.png',
    'images/f16g.jpg',
    'images/reem.jpg',
    'images/group10.png',
    'images/saraf.jpg',
    'images/group10@2x.png',
    'images/shimshon.jpg',
    'images/group10@3x.png',
    'images/sufa.jpg',
    'images/group11.png',
    'images/tzufit.jpg',
    'images/group11@2x.png',
    'images/yanshuf.jpg',
    'images/group11@3x.png',
    'images/yasur.jpg',
    'images/group12.png',
    'images/stearman.jpg',
    'images/harvard.jpg',
    'images/generic.jpg',
    'images/group12@2x.png',
    'images/group12@3x.png',
    'images/group13.png',
    'images/group13@2x.png',
    'images/group13@3x.png',
    'images/group3.png',
    'images/group3@2x.png',
    'images/group3@3x.png',
    'images/group4.png',
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
    'icons/aircrafts/yasur.svg',
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
    'icons/entranceLogo.png',
    'icons/group2.png',
    'icons/group2@2x.png',
    'icons/group2@3x.png',
    'icons/groups/group_cyan.svg',
    'icons/groups/group_darkgray.svg',
    'icons/groups/group_red.svg',
    'icons/groups/group_white.svg',
    'icons/groups/group_yellow.svg',
    'icons/headerLogo.png',
    'icons/headerLogo.svg',
    'icons/homeIcon.png',
    'icons/iaf.png',
    'icons/iaf-small.png',
    'icons/location.svg',
    'icons/logo.svg',
    'icons/logo192x192.png',
    'icons/menuIcon.png',
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
    'icons/waze.png',
    'icons/slidepopup.png',
    'icons/drone.png',
    'screenshots/screenshot1.png',
    'images/Matas_vector_map.svg'
];

 self.addEventListener('install', function(e) {
     console.log("Loading all base files into cache.");
     e.waitUntil(self.skipWaiting()); // Activate worker immediately

     e.waitUntil(
         caches.open('matas').then(function(cache) {
             return cache.addAll(cacheFileList);
         })
     );

     // schedule additional file load to 15 seconds later to not interrupt the app load
     setTimeout(() => {
         console.log("Loading Extended Files to Cache...");
         caches.open('matas').then(cache => {
             cache.addAll(cacheFileList);
         });
     },15000)
 });

self.addEventListener('fetch', (event) => {
     event.respondWith(async function() {
         try {
             return await fetch(event.request);
         } catch (err) {
             return caches.match(event.request,{ignoreSearch: true});
         }
     }());
 });

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim()); // Become available to all pages
});


/**
 * Riding on onMessage event to schedule notifications when browser is closed
 */
self.addEventListener('message', event => {
    var sentNotifications = event.data.notificationOptions.data.sentNotifications;

    if (!sentNotifications.includes(event.data.notificationOptions.body)) {
        console.log(event.data);
        event.waitUntil(new Promise(function (resolve) {
            setTimeout(function () {
                self.registration.showNotification(event.data.notificationTitle, event.data.notificationOptions);
                resolve();
            }, event.data.notificationTime);
        }));
    }

    return;
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(new Promise(resolve => {
        clients.openWindow(event.notification.data.url).then(x => {
            resolve();
        });
    }));
});
