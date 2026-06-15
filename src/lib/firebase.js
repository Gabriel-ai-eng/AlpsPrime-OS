import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAeGJTPGCfK--mMCtOm8QxNKgrlWyl2ago",
  authDomain: "sextafeira-app.firebaseapp.com",
  databaseURL: "https://sextafeira-app-default-rtdb.firebaseio.com",
  projectId: "sextafeira-app",
  storageBucket: "sextafeira-app.firebasestorage.app",
  messagingSenderId: "1019978953980",
  appId: "1:1019978953980:web:2c0038879b25c7054fd379"
};

// Inicializa o Firebase e o Banco de Dados (Firestore)
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
