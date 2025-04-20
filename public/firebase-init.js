// Firebase yapılandırma bilgileriniz
const firebaseConfig = {
    apiKey: "AIzaSyABCD...",
    authDomain: "klan-uygulamasi.firebaseapp.com",
    databaseURL: "https://klan-uygulamasi-default-rtdb.firebaseio.com",
    projectId: "klan-uygulamasi",
    storageBucket: "klan-uygulamasi.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcd1234..."
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);

// Firebase servislerine referanslar
const database = firebase.database();
const auth = firebase.auth();

// Diğer dosyalardan erişebilmek için export edin
export { database, auth };
