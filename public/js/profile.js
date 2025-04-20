// Profil Yönetimi

// Profil butonuna tıklama
document.getElementById('profile-btn').addEventListener('click', () => {
    openProfileModal();
});

// Profil modalını açma
async function openProfileModal() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    try {
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            
            document.getElementById('profile-username').value = userData.username;
            document.getElementById('profile-email').value = user.email;
            document.getElementById('profile-password').value = '';
            document.getElementById('profile-picture-preview').src = userData.profilePicture;
            
            document.getElementById('profile-modal').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Profil açma hatası:', error);
    }
}

// Profil resmi yükleme
document.getElementById('profile-picture-preview').addEventListener('click', () => {
    document.getElementById('profile-picture-upload').click();
});

document.getElementById('profile-picture-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('profile-picture-preview').src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Profil bilgilerini kaydetme
document.getElementById('save-profile').addEventListener('click', async () => {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    const username = document.getElementById('profile-username').value.trim();
    const email = document.getElementById('profile-email').value.trim();
    const password = document.getElementById('profile-password').value;
    const profilePicture = document.getElementById('profile-picture-preview').src;
    
    if (!username || !email) {
        showError('profile', 'Lütfen kullanıcı adı ve e-posta girin');
        return;
    }
    
    try {
        // E-posta güncelleme
        if (email !== user.email) {
            await user.updateEmail(email);
        }
        
        // Şifre güncelleme (eğer girilmişse)
        if (password && password.length >= 6) {
            await user.updatePassword(password);
        }
        
        // Firestore'da profil bilgilerini güncelle
        const updateData = {
            username: username,
            email: email,
            profilePicture: profilePicture
        };
        
        await firebase.firestore().collection('users').doc(user.uid).update(updateData);
        
        // Profil resmini ve kullanıcı adını sayfada güncelle
        document.getElementById('display-name').textContent = username;
        document.getElementById('profile-pic').src = profilePicture;
        
        // Modalı kapat
        document.getElementById('profile-modal').classList.add('hidden');
        alert('Profil bilgileriniz güncellendi!');
        
    } catch (error) {
        console.error('Profil güncelleme hatası:', error);
        showError('profile', error.message);
    }
});

function showError(modalId, message) {
    const errorElement = document.getElementById(`${modalId}-error`);
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}
