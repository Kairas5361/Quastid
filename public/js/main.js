// Firebase yapılandırması
const firebaseConfig = {
    apiKey: "AIzaSyC00q6G-85SykNhWF9MvP_qGm8jDoQiXps",
    authDomain: "quastidd.firebaseapp.com",
    projectId: "https://quastidd-default-rtdb.firebaseio.com",
    storageBucket: "quastidd.firebasestorage.app",
    messagingSenderId: "998463462176",
    appId: "1:998463462176:web:8b659bf9ee4ddf9633d545"
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Tema değiştirme fonksiyonu
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

// Sayfa yüklendiğinde çalışacak kodlar
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

    // Modal dışına tıklayarak kapatma
    document.querySelectorAll('.auth-modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
                document.querySelectorAll('.error').forEach(el => {
                    el.classList.add('hidden');
                });
            }
        });
    });

    // Klavye kısayolları
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.auth-modal').forEach(modal => {
                modal.classList.add('hidden');
            });
            document.querySelectorAll('.error').forEach(el => {
                el.classList.add('hidden');
            });
        }
    });
});
