// Firebase yapılandırması - EN BAŞTA OLMALI
const firebaseConfig = {
    apiKey: "AIzaSyC00q6G-85SykNhWF9MvP_qGm8jDoQiXps",
    authDomain: "quastidd.firebaseapp.com",
    projectId: "quastidd", // projectId URL değil, sadece ID olmalı
    storageBucket: "quastidd.firebasestorage.app",
    messagingSenderId: "998463462176",
    appId: "1:998463462176:web:8b659bf9ee4ddf9633d545"
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Giriş Formu İşlemleri
document.getElementById('login-btn').addEventListener('click', () => {
    document.getElementById('login-form').classList.remove('hidden');
});

document.getElementById('register-btn').addEventListener('click', () => {
    document.getElementById('register-form').classList.remove('hidden');
});

// Modal Kapatma Butonları
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        this.closest('.auth-modal').classList.add('hidden');
        document.querySelectorAll('.error').forEach(el => {
            el.classList.add('hidden');
        });
    });
});

// Kayıt İşlemi
document.getElementById('submit-register').addEventListener('click', async () => {
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    
    if (!username || !email || !password) {
        showError('register', 'Lütfen tüm alanları doldurun');
        return;
    }
    
    if (password.length < 6) {
        showError('register', 'Şifre en az 6 karakter olmalıdır');
        return;
    }
    
    try {
        // Firebase'de kullanıcı oluştur
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Firestore'da kullanıcı bilgilerini kaydet
        await db.collection('users').doc(userCredential.user.uid).set({
            username: username,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            profilePicture: 'images/default-profile.png'
        });
        
        // Başarılı kayıt
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('register-username').value = '';
        document.getElementById('register-email').value = '';
        document.getElementById('register-password').value = '';
        document.getElementById('register-error').classList.add('hidden');
        
        showToast('Kayıt başarılı! Giriş yapabilirsiniz.');
        
    } catch (error) {
        console.error('Kayıt hatası:', error);
        showError('register', error.message);
    }
});

// Giriş İşlemi
document.getElementById('submit-login').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showError('login', 'Lütfen tüm alanları doldurun');
        return;
    }
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';
        document.getElementById('login-error').classList.add('hidden');
    } catch (error) {
        console.error('Giriş hatası:', error);
        showError('login', error.message);
    }
});

// Hata Gösterme
function showError(modalId, message) {
    const errorElement = document.getElementById(`${modalId}-error`);
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

// Kullanıcı Durumunu Dinleme
auth.onAuthStateChanged(user => {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const profileBtn = document.getElementById('profile-btn');
    const mainContent = document.getElementById('main-content');
    const profileContainer = document.querySelector('.profile-container');
    
    if (user) {
        // Kullanıcı giriş yapmış
        loginBtn.classList.add('hidden');
        registerBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        profileBtn.classList.remove('hidden');
        mainContent.classList.remove('hidden');
        
        // Kullanıcı bilgilerini yükle
        loadUserProfile(user.uid);
        
    } else {
        // Kullanıcı giriş yapmamış
        loginBtn.classList.remove('hidden');
        registerBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        profileBtn.classList.add('hidden');
        mainContent.classList.add('hidden');
    }
});

// Çıkış İşlemi
document.getElementById('logout-btn').addEventListener('click', () => {
    auth.signOut().then(() => {
        console.log('Çıkış yapıldı');
        showToast('Başarıyla çıkış yapıldı');
    }).catch(error => {
        console.error('Çıkış hatası:', error);
        showToast('Çıkış yapılırken hata oluştu');
    });
});

// Kullanıcı Profilini Yükleme
async function loadUserProfile(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            
            // Header profil resmini güncelle
            document.getElementById('header-profile-pic').src = userData.profilePicture || 'images/default-profile.png';
            
            // Profil sayfasını güncelle
            document.getElementById('profile-avatar').src = userData.profilePicture || 'images/default-profile.png';
            document.getElementById('display-username').textContent = userData.username;
            document.getElementById('user-email').textContent = userData.email;
            
            // Üyelik tarihini formatla
            if (userData.createdAt) {
                const joinDate = userData.createdAt.toDate();
                document.getElementById('member-since').textContent = joinDate.getFullYear();
            }
            
            // İstatistikleri yükle
            loadProfileStats(userId);
        }
    } catch (error) {
        console.error('Profil yükleme hatası:', error);
    }
}

// Profil istatistiklerini yükleme
async function loadProfileStats(userId) {
    try {
        // Klan sayısını hesapla
        const clansQuery = await db.collection('clans')
            .where('members', 'array-contains', userId)
            .get();
        document.getElementById('clan-count').textContent = clansQuery.size;
        
        // Mesaj sayısını hesapla
        let messageCount = 0;
        for (const clanDoc of clansQuery.docs) {
            const messagesQuery = await db.collection('clans')
                .doc(clanDoc.id)
                .collection('messages')
                .where('senderId', '==', userId)
                .get();
            messageCount += messagesQuery.size;
        }
        document.getElementById('message-count').textContent = messageCount;
        
    } catch (error) {
        console.error('İstatistik yükleme hatası:', error);
    }
}

// Toast mesajı gösterme
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Tema değiştirme fonksiyonu
function setTheme(theme) {
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        }
    });
    
    document.body.classList.remove('orange-theme', 'green-theme', 'dark-theme');
    
    if (theme !== 'orange') {
        document.body.classList.add(`${theme}-theme`);
    }
}

// Sayfa yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('quastid-theme') || 'orange';
    setTheme(savedTheme);
    
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
