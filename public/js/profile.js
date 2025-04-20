// Profil verilerini yükleme
async function loadProfilePage(userId) {
    try {
        const userDoc = await firebase.firestore().collection('users').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            updateProfileDisplay(userData);
        }
    } catch (error) {
        console.error('Profil yükleme hatası:', error);
        alert('Profil bilgileri yüklenirken hata oluştu');
    }
}

// Profil görünümünü güncelleme
function updateProfileDisplay(userData) {
    // Avatar ve temel bilgiler
    document.getElementById('profile-avatar-img').src = userData.profilePicture || 'images/default-profile.png';
    document.getElementById('profile-username').textContent = userData.username;
    document.getElementById('profile-email').textContent = userData.email;
    document.getElementById('profile-pic').src = userData.profilePicture || 'images/default-profile.png';
    
    // Üyelik tarihi
    if (userData.createdAt) {
        const joinDate = userData.createdAt.toDate();
        document.getElementById('member-since').textContent = joinDate.toLocaleDateString('tr-TR');
    }
    
    // İstatistikleri yükle
    loadProfileStats(userData.uid || firebase.auth().currentUser.uid);
}

// Avatar yükleme işlemi
document.getElementById('profile-avatar-img').addEventListener('click', () => {
    document.getElementById('avatar-upload').click();
});

document.getElementById('avatar-upload').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    try {
        // Dosya boyutu kontrolü (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Profil resmi maksimum 2MB boyutunda olabilir');
            return;
        }
        
        // Resim formatı kontrolü
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
            alert('Sadece JPG, PNG veya GIF formatında resimler yükleyebilirsiniz');
            return;
        }
        
        // Yükleme işlemi başlıyor
        const loadingIndicator = document.createElement('div');
        loadingIndicator.textContent = 'Yükleniyor...';
        loadingIndicator.style.position = 'fixed';
        loadingIndicator.style.top = '50%';
        loadingIndicator.style.left = '50%';
        loadingIndicator.style.transform = 'translate(-50%, -50%)';
        loadingIndicator.style.padding = '20px';
        loadingIndicator.style.background = 'rgba(0,0,0,0.7)';
        loadingIndicator.style.color = 'white';
        loadingIndicator.style.borderRadius = '5px';
        loadingIndicator.style.zIndex = '1000';
        document.body.appendChild(loadingIndicator);
        
        // Resmi yükle ve URL'yi al
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(`profile_pictures/${user.uid}/${Date.now()}_${file.name}`);
        await fileRef.put(file);
        const downloadURL = await fileRef.getDownloadURL();
        
        // Firestore'da güncelle
        await firebase.firestore().collection('users').doc(user.uid).update({
            profilePicture: downloadURL
        });
        
        // Sayfada güncelle
        updateProfileDisplay({
            ...(await firebase.firestore().collection('users').doc(user.uid).get()).data(),
            profilePicture: downloadURL
        });
        
        document.body.removeChild(loadingIndicator);
        showToast('Profil resmi başarıyla güncellendi!');
        
    } catch (error) {
        console.error('Profil resmi yükleme hatası:', error);
        alert('Profil resmi güncellenirken hata oluştu: ' + error.message);
    }
});

// Profil adı güncelleme
document.getElementById('edit-profile-btn').addEventListener('click', async () => {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    try {
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            
            // Modal içeriğini doldur
            document.getElementById('profile-username-input').value = userData.username || '';
            document.getElementById('profile-picture-preview').src = userData.profilePicture || 'images/default-profile.png';
            
            // Modalı göster
            document.getElementById('profile-modal').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Profil açma hatası:', error);
        alert('Profil bilgileri yüklenirken hata oluştu');
    }
});

// Profil bilgilerini kaydetme
document.getElementById('save-profile').addEventListener('click', async () => {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    const newUsername = document.getElementById('profile-username-input').value.trim();
    const newProfilePicture = document.getElementById('profile-picture-preview').src;
    
    if (!newUsername) {
        alert('Kullanıcı adı boş bırakılamaz');
        return;
    }
    
    try {
        // Yükleme işlemi başlıyor
        const saveButton = document.getElementById('save-profile');
        const originalText = saveButton.textContent;
        saveButton.textContent = 'Kaydediliyor...';
        saveButton.disabled = true;
        
        // Firestore'da güncelle
        await firebase.firestore().collection('users').doc(user.uid).update({
            username: newUsername,
            profilePicture: newProfilePicture
        });
        
        // Sayfada güncelle
        updateProfileDisplay({
            username: newUsername,
            profilePicture: newProfilePicture,
            email: user.email,
            createdAt: (await firebase.firestore().collection('users').doc(user.uid).get()).data().createdAt
        });
        
        // Modalı kapat
        document.getElementById('profile-modal').classList.add('hidden');
        showToast('Profil bilgileriniz başarıyla güncellendi!');
        
    } catch (error) {
        console.error('Profil güncelleme hatası:', error);
        alert('Profil güncellenirken hata oluştu: ' + error.message);
    } finally {
        saveButton.textContent = originalText;
        saveButton.disabled = false;
    }
});

// Toast mesajı gösterme
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.padding = '10px 20px';
    toast.style.background = 'rgba(0,0,0,0.7)';
    toast.style.color = 'white';
    toast.style.borderRadius = '5px';
    toast.style.zIndex = '1000';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}

// Kullanıcı değişikliklerini dinleme
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        loadProfilePage(user.uid);
    }
});
