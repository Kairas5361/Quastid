// Giriş formu elementleri
const loginForm = document.querySelector('.auth-form:first-child');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const submitLogin = document.getElementById('submit-login');
const cancelLogin = document.getElementById('cancel-login');

// Kayıt formu elementleri
const registerForm = document.querySelector('.auth-form:last-child');
const registerUsername = document.getElementById('register-username');
const registerEmail = document.getElementById('register-email');
const registerPassword = document.getElementById('register-password');
const submitRegister = document.getElementById('submit-register');
const cancelRegister = document.getElementById('cancel-register');

// Giriş yap butonu
document.getElementById('login-btn').addEventListener('click', () => {
    authForms.classList.remove('hidden');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
});

// Kayıt ol butonu
document.getElementById('register-btn').addEventListener('click', () => {
    authForms.classList.remove('hidden');
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
});

// Giriş formu iptal
cancelLogin.addEventListener('click', () => {
    authForms.classList.add('hidden');
    loginEmail.value = '';
    loginPassword.value = '';
});

// Kayıt formu iptal
cancelRegister.addEventListener('click', () => {
    authForms.classList.add('hidden');
    registerUsername.value = '';
    registerEmail.value = '';
    registerPassword.value = '';
});

// Giriş yapma işlemi
submitLogin.addEventListener('click', () => {
    const email = loginEmail.value;
    const password = loginPassword.value;
    
    if (!email || !password) {
        showError('Lütfen tüm alanları doldurun');
        return;
    }
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            authForms.classList.add('hidden');
            loginEmail.value = '';
            loginPassword.value = '';
        })
        .catch(error => {
            showError(error.message);
        });
});

// Kayıt olma işlemi
submitRegister.addEventListener('click', () => {
    const username = registerUsername.value;
    const email = registerEmail.value;
    const password = registerPassword.value;
    
    if (!username || !email || !password) {
        showError('Lütfen tüm alanları doldurun');
        return;
    }
    
    if (password.length < 6) {
        showError('Şifre en az 6 karakter olmalıdır');
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Kullanıcı bilgilerini Firestore'a kaydet
            return db.collection('users').doc(userCredential.user.uid).set({
                username: username,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            authForms.classList.add('hidden');
            registerUsername.value = '';
            registerEmail.value = '';
            registerPassword.value = '';
        })
        .catch(error => {
            showError(error.message);
        });
});

// Hata mesajı gösterme
function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error';
    errorElement.textContent = message;
    
    const currentForm = document.querySelector('.auth-form:not(.hidden)');
    const existingError = currentForm.querySelector('.error');
    
    if (existingError) {
        currentForm.removeChild(existingError);
    }
    
    currentForm.insertBefore(errorElement, currentForm.firstChild);
    
    setTimeout(() => {
        if (errorElement.parentNode) {
            errorElement.parentNode.removeChild(errorElement);
        }
    }, 5000);
}
