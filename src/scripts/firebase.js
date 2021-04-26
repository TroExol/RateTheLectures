import {firebaseConfig} from './config';

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore();
