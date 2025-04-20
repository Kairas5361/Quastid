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

// Tema değiştirme fonksiyonları
function setTheme(theme) {
    // Aktif butonu güncelle
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        }
    });
    
    // Tema class'larını kaldır
    document.body.classList.remove('orange-theme', 'green-theme', 'dark-theme');
    
    // Seçilen temayı uygula
    if (theme !== 'orange') {
        document.body.classList.add(`${theme}-theme`);
    }
}

// Sayfa yüklendiğinde kullanıcı durumunu ve temayı kontrol et
document.addEventListener('DOMContentLoaded', () => {
    // Kullanıcının tercih ettiği temayı yükle
    const savedTheme = localStorage.getItem('quastid-theme') || 'orange';
    setTheme(savedTheme);
    
    // Tema butonlarına event listener ekle
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            setTheme(theme);
            localStorage.setItem('quastid-theme', theme);
        });
    });

    // Firebase auth state listener
    auth.onAuthStateChanged(user => {
        if (user) {
            // Kullanıcı giriş yapmış
            document.getElementById('login-btn').classList.add('hidden');
            document.getElementById('register-btn').classList.add('hidden');
            document.getElementById('logout-btn').classList.remove('hidden');
            document.getElementById('auth-forms').classList.add('hidden');
            document.getElementById('main-content').classList.remove('hidden');
            
            // Klan bilgilerini yükle
            if (typeof loadClans === 'function') {
                loadClans();
            }
        } else {
            // Kullanıcı giriş yapmamış
            document.getElementById('login-btn').classList.remove('hidden');
            document.getElementById('register-btn').classList.remove('hidden');
            document.getElementById('logout-btn').classList.add('hidden');
            document.getElementById('main-content').classList.add('hidden');
        }
    });
});

// Çıkış yap butonu
document.getElementById('logout-btn').addEventListener('click', () => {
    auth.signOut().then(() => {
        console.log('Çıkış yapıldı');
    }).catch(error => {
        console.error('Çıkış hatası:', error);
    });
});
