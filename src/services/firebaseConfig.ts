
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBSdyhsLRgOhgeCl0McZPaV-e0J2k3Nhig",
  authDomain: "sololevelingtracker.firebaseapp.com",
  projectId: "sololevelingtracker",
  storageBucket: "sololevelingtracker.firebasestorage.app",
  messagingSenderId: "909773511459",
  appId: "1:909773511459:web:dbc7cad212611fc00c0a96",
  measurementId: "G-094ZW9G3TE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
