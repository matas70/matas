// Initialize Firebase
function registerToFirebaseNotifications() {
    console.log("registering to firebase notifications.");
    firebase.initializeApp({
        apiKey: "AIzaSyAB3thYpehBuQMoHm-LD9hUpvwaR3aJsTM",
        authDomain: "maps-ext-47253069.firebaseapp.com",
        databaseURL: "https://maps-ext-47253069.firebaseio.com",
        projectId: "maps-ext-47253069",
        storageBucket: "maps-ext-47253069.appspot.com",
        messagingSenderId: "504034859779"
    });

    const messaging = firebase.messaging();
    const functions = firebase.app().functions('europe-west1');

    const subscribeToTopic = functions.httpsCallable('subscribeToTopic');

    messaging.requestPermission().then(async () => {
        const topicName = "users";
        const keyString = `subscribedTo_${topicName}`;

        if (localStorage.getItem(keyString) !== null) {
            return;
        }

        let token = await messaging.getToken();
        subscribeToTopic({
            "token": token,
            "topic": topicName
        }).then(function () {
            localStorage.setItem(keyString, true);
            console.log("subscribed to " + topicName);
        });
    }).catch(function (err) {
        console.log(err);
    });

    messaging.onMessage((payload) => {
        /* handle notifications when app is on */
        console.log("payload: ", payload);
    });
}

function subscribe(pointId) {
    const messaging = firebase.messaging();
    const functions = firebase.app().functions('europe-west1');

    const subscribeToTopic = functions.httpsCallable('subscribeToTopic');

    messaging.requestPermission().then(async () => {
        let topicName = "point-"+pointId;

        if (localStorage.getItem(topicName)) {
            return;
        }

        let token = await messaging.getToken();
        subscribeToTopic({
            "token": token,
            "topic": topicName
        }).then(function () {
            localStorage.setItem(topicName, true);
            console.log("subscribed to " + topicName);
        });
    }).catch(function (err) {
        console.log(err);
    });
}

function unsubscribe(pointId) {
    const messaging = firebase.messaging();
    const functions = firebase.app().functions('europe-west1');

    const unsubscribeToTopic = functions.httpsCallable('unsubscribeToTopic');

    messaging.requestPermission().then(async () => {
        let topicName = "point-"+pointId;

        if (localStorage.getItem(topicName) !== "true") {
            return;
        }

        let token = await messaging.getToken();
        unsubscribeToTopic({
            "token": token,
            "topic": topicName
        }).then(function () {
            localStorage.setItem(topicName, true);
            console.log("unsubscribed from " + topicName);
        });
    }).catch(function (err) {
        console.log(err);
    });
}

function isSubscribed(pointId) {
    let topicName = "point-"+pointId;
    return localStorage.getItem(topicName);
}
