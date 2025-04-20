// Firebase Authentication İşlemleri

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
        clearErrors();
    });
});

// Hataları Temizleme
function clearErrors() {
    document.querySelectorAll('.error').forEach(el => {
        el.classList.add('hidden');
    });
}

// Hata Gösterme
function showError(modalId, message) {
    const errorElement = document.getElementById(`${modalId}-error`);
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

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
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        
        // Firestore'da kullanıcı bilgilerini kaydet
        await firebase.firestore().collection('users').doc(userCredential.user.uid).set({
            username: username,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            profilePicture: 'images/default-profile.png'
        });
        
        // Başarılı kayıt
        document.getElementById('register-form').classList.add('hidden');
        clearForm('register');
        alert('Kayıt başarılı! Giriş yapabilirsiniz.');
        
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
        await firebase.auth().signInWithEmailAndPassword(email, password);
        document.getElementById('login-form').classList.add('hidden');
        clearForm('login');
    } catch (error) {
        console.error('Giriş hatası:', error);
        showError('login', error.message);
    }
});

// Formları Temizleme
function clearForm(formType) {
    if (formType === 'login') {
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';
    } else if (formType === 'register') {
        document.getElementById('register-username').value = '';
        document.getElementById('register-email').value = '';
        document.getElementById('register-password').value = '';
    }
    clearErrors();
}

// Kullanıcı Durumunu Dinleme
firebase.auth().onAuthStateChanged(user => {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const profileBtn = document.getElementById('profile-btn');
    const mainContent = document.getElementById('main-content');
    
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
    firebase.auth().signOut().then(() => {
        console.log('Çıkış yapıldı');
    }).catch(error => {
        console.error('Çıkış hatası:', error);
    });
});

// Kullanıcı Profilini Yükleme
async function loadUserProfile(userId) {
    try {
        const userDoc = await firebase.firestore().collection('users').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            document.getElementById('display-name').textContent = userData.username;
            document.getElementById('profile-pic').src = userData.profilePicture;
        }
    } catch (error) {
        console.error('Profil yükleme hatası:', error);
    }
}
