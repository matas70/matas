importScripts('https://www.gstatic.com/firebasejs/5.10.1/firebase-app.js',
              'https://www.gstatic.com/firebasejs/5.10.1/firebase-messaging.js');

var config = {
    messagingSenderId: "504034859779"
};

firebase.initializeApp(config);

const messaging = firebase.messaging();
