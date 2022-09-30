const firebase = require("firebase")


const firebaseConfig = {
    apiKey: "AIzaSyDgRtysO7fjt-nRuCjHlyewupT54ZSY-Yc",
    authDomain: "fir-e6846.firebaseapp.com",
    projectId: "fir-e6846",
    storageBucket: "fir-e6846.appspot.com",
    messagingSenderId: "341520349800",
    appId: "1:341520349800:web:e77b7b9f87f023f2bd99dd",
    measurementId: "G-38LVE365DB"
  };

  firebase.initializeApp(firebaseConfig)

  let db = firebase.database()

  const User = db.collection("Users")
///////
const registrationTokens = [
  'bk3RNwTe3H0:CI2k_HHwgIpoDKCIZvvDMExUdFQ3P1...',
  // ...
  'ecupwIfBy1w:APA91bFtuMY7MktgxA3Au_Qx7cKqnf...'
];

const payload = {
  data: {
    score: '850',
    time: '2:45'
  }
};

getMessaging().sendToDevice(registrationTokens, payload)
  .then((response) => {
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });

  module.exports = User