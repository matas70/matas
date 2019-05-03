// Initialize Firebase
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
    
    if(localStorage.getItem(keyString) !== null) {
        return;
    }

    let token = await messaging.getToken();
    subscribeToTopic({
        "token": token,
        "topic": topicName
    }).then(function() {
        localStorage.setItem(keyString, true);
    });
}).catch(function(err) {
    
});

messaging.onMessage((payload) => {
    /* handle notifications when app is on */
    // console.log("payload: ", payload);
});
