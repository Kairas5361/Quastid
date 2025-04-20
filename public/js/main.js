// Firebase yapılandırması
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM elementleri
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const authForms = document.getElementById('auth-forms');
const mainContent = document.getElementById('main-content');

// Sayfa yüklendiğinde kullanıcı durumunu kontrol et
auth.onAuthStateChanged(user => {
    if (user) {
        // Kullanıcı giriş yapmış
        loginBtn.classList.add('hidden');
        registerBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        authForms.classList.add('hidden');
        mainContent.classList.remove('hidden');
        
        // Klan bilgilerini yükle
        loadClans();
    } else {
        // Kullanıcı giriş yapmamış
        loginBtn.classList.remove('hidden');
        registerBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        mainContent.classList.add('hidden');
    }
});

// Çıkış yap butonu
logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        console.log('Çıkış yapıldı');
    }).catch(error => {
        console.error('Çıkış hatası:', error);
    });
});
