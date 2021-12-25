import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'
import 'firebase/analytics'

// firebase init - add your own config here
const firebaseConfig = {
  apiKey: 'AIzaSyCi_pcjYmYT40dT7bzzi_3U8QA7lr3h-OA',
  authDomain: 'confess-aab5a.firebaseapp.com',
  projectId: 'confess-aab5a',
  storageBucket: 'confess-aab5a.appspot.com',
  messagingSenderId: '142598820206',
  appId: '1:142598820206:web:e3eecf6725c626acb1b17f',
}
firebase.initializeApp(firebaseConfig)
firebase.analytics()

// utils
const db = firebase.firestore()
const auth = firebase.auth()
const storage = firebase.storage()

// export utils/refs
export {
  db,
  auth,
  storage,
}
