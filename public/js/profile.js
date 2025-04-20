// Profil verilerini yükleme
async function loadProfilePage(userId) {
    try {
        const userDoc = await firebase.firestore().collection('users').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            
            // Profil bilgilerini güncelle
            document.getElementById('profile-avatar-img').src = userData.profilePicture || 'images/default-profile.png';
            document.getElementById('profile-username').textContent = userData.username;
            document.getElementById('profile-email').textContent = userData.email;
            
            // Üyelik tarihini formatla
            if (userData.createdAt) {
                const joinDate = userData.createdAt.toDate();
                document.getElementById('member-since').textContent = joinDate.toLocaleDateString('tr-TR');
            }
            
            // Klan ve mesaj istatistiklerini yükle
            loadProfileStats(userId);
            
            // Son aktiviteleri yükle
            loadRecentActivity(userId);
        }
    } catch (error) {
        console.error('Profil yükleme hatası:', error);
    }
}

// Profil istatistiklerini yükleme
async function loadProfileStats(userId) {
    try {
        // Klan sayısını al
        const clansQuery = await firebase.firestore().collection('clans')
            .where('members', 'array-contains', userId)
            .get();
        
        document.getElementById('clan-count').textContent = clansQuery.size;
        
        // Mesaj sayısını al
        const messagesQuery = await firebase.firestore().collectionGroup('messages')
            .where('senderId', '==', userId)
            .get();
        
        document.getElementById('message-count').textContent = messagesQuery.size;
    } catch (error) {
        console.error('İstatistik yükleme hatası:', error);
    }
}

// Son aktiviteleri yükleme
async function loadRecentActivity(userId) {
    try {
        const activityList = document.getElementById('activity-list');
        activityList.innerHTML = '';
        
        // Son mesajları al (en fazla 5 tane)
        const messagesQuery = await firebase.firestore().collectionGroup('messages')
            .where('senderId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();
        
        if (messagesQuery.empty) {
            activityList.innerHTML = '<li>Henüz aktivite yok</li>';
            return;
        }
        
        // Klan isimlerini önceden yükle
        const clanNames = {};
        const clanPromises = [];
        
        messagesQuery.forEach(doc => {
            const clanId = doc.ref.parent.parent.id;
            if (!clanNames[clanId]) {
                clanPromises.push(
                    firebase.firestore().collection('clans').doc(clanId).get()
                        .then(clanDoc => {
                            if (clanDoc.exists) {
                                clanNames[clanId] = clanDoc.data().name;
                            }
                        })
                );
            }
        });
        
        await Promise.all(clanPromises);
        
        // Aktivite listesini oluştur
        messagesQuery.forEach(doc => {
            const message = doc.data();
            const clanId = doc.ref.parent.parent.id;
            const clanName = clanNames[clanId] || 'Bilinmeyen Klan';
            
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="activity-icon">💬</span>
                <div>
                    <strong>${clanName}</strong> klanına mesaj gönderdin
                    <div class="activity-time">${formatTime(message.timestamp.toDate())}</div>
                </div>
            `;
            activityList.appendChild(li);
        });
    } catch (error) {
        console.error('Aktivite yükleme hatası:', error);
    }
}

// Tarihi formatlama
function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // 1 dakikadan az
        return 'Az önce';
    } else if (diff < 3600000) { // 1 saatten az
        return `${Math.floor(diff / 60000)} dakika önce`;
    } else if (diff < 86400000) { // 1 günden az
        return `${Math.floor(diff / 3600000)} saat önce`;
    } else {
        return date.toLocaleDateString('tr-TR');
    }
}

// Profil resmi yükleme
document.getElementById('profile-avatar-img').addEventListener('click', () => {
    document.getElementById('avatar-upload').click();
});

document.getElementById('avatar-upload').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    try {
        // Resmi yükle ve URL'yi al
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(`profile_pictures/${user.uid}/${file.name}`);
        await fileRef.put(file);
        const downloadURL = await fileRef.getDownloadURL();
        
        // Firestore'da güncelle
        await firebase.firestore().collection('users').doc(user.uid).update({
            profilePicture: downloadURL
        });
        
        // Sayfada güncelle
        document.getElementById('profile-avatar-img').src = downloadURL;
        document.getElementById('profile-pic').src = downloadURL;
        
        alert('Profil resmi başarıyla güncellendi!');
    } catch (error) {
        console.error('Profil resmi yükleme hatası:', error);
        alert('Profil resmi güncellenirken hata oluştu');
    }
});

// Klanlarım butonu
document.getElementById('my-clans-btn').addEventListener('click', () => {
    document.querySelector('.profile-container').classList.add('hidden');
    document.getElementById('clan-section').classList.remove('hidden');
});

// Profil düzenleme butonu
document.getElementById('edit-profile-btn').addEventListener('click', () => {
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
        
        // Sayfada güncelle
        document.getElementById('profile-username').textContent = username;
        document.getElementById('profile-email').textContent = email;
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
