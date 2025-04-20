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

// Sayfa yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', () => {
    // Modal dışına tıklayarak kapatma
    document.querySelectorAll('.auth-modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
                clearErrors();
            }
        });
    });
});

function clearErrors() {
    document.querySelectorAll('.error').forEach(el => {
        el.classList.add('hidden');
    });
}

// Klavye kısayolları
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.auth-modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        clearErrors();
    }
});
