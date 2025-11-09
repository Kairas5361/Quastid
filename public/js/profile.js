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
        showToast('Profil bilgileri yüklenirken hata oluştu');
    }
}

// Profil görünümünü güncelleme
function updateProfileDisplay(userData) {
    // Avatar ve temel bilgiler
    document.getElementById('profile-avatar').src = userData.profilePicture || 'images/default-profile.png';
    document.getElementById('display-username').textContent = userData.username;
    document.getElementById('user-email').textContent = userData.email;
    document.getElementById('header-profile-pic').src = userData.profilePicture || 'images/default-profile.png';
    
    // Üyelik tarihi
    if (userData.createdAt) {
        const joinDate = userData.createdAt.toDate();
        document.getElementById('member-since').textContent = joinDate.getFullYear();
    }
}

// Avatar yükleme işlemi
document.getElementById('profile-avatar').addEventListener('click', () => {
    document.getElementById('avatar-upload').click();
});

// Avatar upload input'u eklenmeli
const avatarUpload = document.createElement('input');
avatarUpload.type = 'file';
avatarUpload.id = 'avatar-upload';
avatarUpload.accept = 'image/*';
avatarUpload.classList.add('hidden');
document.body.appendChild(avatarUpload);

avatarUpload.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    try {
        // Dosya boyutu kontrolü (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showToast('Profil resmi maksimum 2MB boyutunda olabilir');
            return;
        }
        
        // Resim formatı kontrolü
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
            showToast('Sadece JPG, PNG veya GIF formatında resimler yükleyebilirsiniz');
            return;
        }
        
        // Yükleme işlemi
        showToast('Profil resmi yükleniyor...');
        
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
        
        showToast('Profil resmi başarıyla güncellendi!');
        
    } catch (error) {
        console.error('Profil resmi yükleme hatası:', error);
        showToast('Profil resmi güncellenirken hata oluştu');
    }
});

// Profil düzenleme butonu
document.getElementById('edit-profile-btn').addEventListener('click', async () => {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    try {
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            
            // Modal içeriğini doldur
            document.getElementById('username-input').value = userData.username || '';
            document.getElementById('profile-picture-preview').src = userData.profilePicture || 'images/default-profile.png';
            
            // Modalı göster
            document.getElementById('profile-modal').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Profil açma hatası:', error);
        showToast('Profil bilgileri yüklenirken hata oluştu');
    }
});

// Profil bilgilerini kaydetme
document.getElementById('save-profile-btn').addEventListener('click', async () => {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    const newUsername = document.getElementById('username-input').value.trim();
    
    if (!newUsername) {
        showToast('Kullanıcı adı boş bırakılamaz');
        return;
    }
    
    try {
        const saveButton = document.getElementById('save-profile-btn');
        const originalText = saveButton.textContent;
        saveButton.textContent = 'Kaydediliyor...';
        saveButton.disabled = true;
        
        // Firestore'da güncelle
        await firebase.firestore().collection('users').doc(user.uid).update({
            username: newUsername
        });
        
        // Sayfada güncelle
        updateProfileDisplay({
            username: newUsername,
            profilePicture: document.getElementById('profile-picture-preview').src,
            email: user.email,
            createdAt: (await firebase.firestore().collection('users').doc(user.uid).get()).data().createdAt
        });
        
        // Modalı kapat
        document.getElementById('profile-modal').classList.add('hidden');
        showToast('Profil bilgileriniz başarıyla güncellendi!');
        
    } catch (error) {
        console.error('Profil güncelleme hatası:', error);
        showToast('Profil güncellenirken hata oluştu');
    } finally {
        const saveButton = document.getElementById('save-profile-btn');
        saveButton.textContent = 'Kaydet';
        saveButton.disabled = false;
    }
});

// Modal kapatma butonları
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('profile-modal').classList.add('hidden');
});

document.getElementById('cancel-edit-btn').addEventListener('click', () => {
    document.getElementById('profile-modal').classList.add('hidden');
});

// Profil resmi değiştirme butonu
document.getElementById('change-avatar-btn').addEventListener('click', () => {
    document.getElementById('profile-picture-upload').click();
});

document.getElementById('profile-picture-upload').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    try {
        if (file.size > 2 * 1024 * 1024) {
            showToast('Profil resmi maksimum 2MB boyutunda olabilir');
            return;
        }
        
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
            showToast('Sadece JPG, PNG veya GIF formatında resimler yükleyebilirsiniz');
            return;
        }
        
        showToast('Profil resmi yükleniyor...');
        
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(`profile_pictures/${user.uid}/${Date.now()}_${file.name}`);
        await fileRef.put(file);
        const downloadURL = await fileRef.getDownloadURL();
        
        // Önizlemeyi güncelle
        document.getElementById('profile-picture-preview').src = downloadURL;
        
        showToast('Profil resmi başarıyla yüklendi!');
        
    } catch (error) {
        console.error('Profil resmi yükleme hatası:', error);
        showToast('Profil resmi yüklenirken hata oluştu');
    }
});

// Toast mesajı gösterme
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Kullanıcı değişikliklerini dinleme
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        loadProfilePage(user.uid);
    }
});
