import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "mispacepgmanager",
  appId: "1:628733556792:web:ce5078118781de1ed34ecd",
  apiKey: "AIzaSyAFhxJHKmV1bU9jIXNtrDY-2YvbjjZuBzY",
  authDomain: "mispacepgmanager.firebaseapp.com",
  storageBucket: "mispacepgmanager.firebasestorage.app",
  messagingSenderId: "628733556792"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
