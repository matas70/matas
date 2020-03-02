const NOTIFICATIONS_URL = 'https://matas-notifications.azurewebsites.net';

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

    subscribe("users");

    const messaging = firebase.messaging();
    messaging.onMessage((payload) => {
        /* handle notifications when app is on */
        console.log("payload: ", payload);
    });
}

function subscribe(topicName) {
    return new Promise((resolve, reject)=>
    {
        const messaging = firebase.messaging();

        messaging.requestPermission().then(async () => {
            // let topicName = "point-" + pointId;

            // if it already subscribed, there is no need to subscribe again
            if (localStorage.getItem(topicName) === "true") {
                return;
            }

            let token = await messaging.getToken();
            fetch(`${NOTIFICATIONS_URL}/subscribeToTopic/${token}/${topicName}`, {mode: "no-cors"}).then(function (response) {
                localStorage.setItem(topicName, "true");
                console.log("subscribed to " + topicName);
                resolve();
            }).catch((err) => {
                console.log(err);
                reject();
            });
        }).catch(function (err) {
            console.log(err);
            reject();
        });
    });
}

function unsubscribe(pointId) {
    return new Promise((resolve, reject)=>
    {
        const messaging = firebase.messaging();

        messaging.requestPermission().then(async () => {
            let topicName = "point-" + pointId;

            // if it already unsubscribed, there is no need to unsubscribe again
            if (localStorage.getItem(topicName) === "false" || !localStorage.getItem(topicName)) {
                return;
            }

            let token = await messaging.getToken();
            fetch(`${NOTIFICATIONS_URL}/unsubscribeToTopic/${token}/${topicName}`, {mode: "no-cors"}).then(function () {
                localStorage.setItem(topicName, "false");
                console.log("unsubscribed from " + topicName);
                resolve();
            }).catch((err) => {
                console.log(err);
                reject();
            });
        }).catch(function (err) {
            console.log(err);
            reject();
        });
    });
}

function isSubscribed(pointId) {
    let topicName = "point-"+pointId;
    return localStorage.getItem(topicName)==="true";
}
