import app from 'firebase/app'
import 'firebase/database'
const firebaseConfig = app.initializeApp({
    apiKey: "AIzaSyBqCpOe1TMRtiQhLx_B-t6PeCIpr2A0IW8",
    authDomain: "distancing-monitor.firebaseapp.com",
    databaseURL: "https://distancing-monitor.firebaseio.com",
    projectId: "distancing-monitor",
    storageBucket: "distancing-monitor.appspot.com",
    messagingSenderId: "910006418103",
    appId: "1:910006418103:web:2bd91e9c538c0f64e82b32"
  });
  export const database = firebaseConfig.database()
  export const firebase = firebaseConfig
  export default firebaseConfig