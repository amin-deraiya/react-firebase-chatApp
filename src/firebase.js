// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { getFirestore } from 'firebase/firestore'
import 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyDildmT7gCxr8RENg1rbHW9hwQvD-fac00',
  authDomain: 'chat-app-6e3f1.firebaseapp.com',
  projectId: 'chat-app-6e3f1',
  storageBucket: 'chat-app-6e3f1.appspot.com',
  messagingSenderId: '624261162783',
  appId: '1:624261162783:web:6339c27ee2af13dee6722a',
  measurementId: 'G-ZJEGZRZG9M',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const storage = getStorage(app)
export const db = getFirestore(app)
export default app
