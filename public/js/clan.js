// Klan elementleri
const clanNameInput = document.getElementById('clan-name');
const createClanBtn = document.getElementById('create-clan');
const joinClanBtn = document.getElementById('join-clan');
const clanList = document.getElementById('clan-list');
const clansUl = document.getElementById('clans');
const clanChat = document.getElementById('clan-chat');
const currentClanName = document.getElementById('current-clan-name');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message');

let currentClanId = null;

// Klan oluşturma
createClanBtn.addEventListener('click', () => {
    const clanName = clanNameInput.value.trim();
    
    if (!clanName) {
        alert('Lütfen bir klan adı girin');
        return;
    }
    
    const user = auth.currentUser;
    
    if (!user) {
        alert('Klan oluşturmak için giriş yapmalısınız');
        return;
    }
    
    db.collection('clans').add({
        name: clanName,
        createdBy: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        members: [user.uid]
    })
    .then((docRef) => {
        clanNameInput.value = '';
        currentClanId = docRef.id;
        loadClanChat(docRef.id, clanName);
    })
    .catch(error => {
        console.error('Klan oluşturma hatası:', error);
        alert('Klan oluşturulurken bir hata oluştu');
    });
});

// Klanlara katılma
joinClanBtn.addEventListener('click', () => {
    clanList.classList.toggle('hidden');
    if (!clanList.classList.contains('hidden')) {
        loadClans();
    }
});

// Klanları yükleme
function loadClans() {
    clansUl.innerHTML = '';
    
    db.collection('clans').get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                clansUl.innerHTML = '<li>Henüz hiç klan yok</li>';
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const clan = doc.data();
                const li = document.createElement('li');
                li.textContent = clan.name;
                li.addEventListener('click', () => {
                    joinClan(doc.id, clan.name);
                });
                clansUl.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Klanlar yüklenirken hata:', error);
        });
}

// Klana katılma
function joinClan(clanId, clanName) {
    const user = auth.currentUser;
    
    if (!user) {
        alert('Klana katılmak için giriş yapmalısınız');
        return;
    }
    
    db.collection('clans').doc(clanId).update({
        members: firebase.firestore.FieldValue.arrayUnion(user.uid)
    })
    .then(() => {
        currentClanId = clanId;
        loadClanChat(clanId, clanName);
        clanList.classList.add('hidden');
    })
    .catch(error => {
        console.error('Klana katılma hatası:', error);
        alert('Klana katılırken bir hata oluştu');
    });
}

// Klan sohbetini yükleme
function loadClanChat(clanId, clanName) {
    currentClanId = clanId;
    currentClanName.textContent = clanName;
    clanChat.classList.remove('hidden');
    messagesDiv.innerHTML = '';
    
    // Mesajları dinle
    db.collection('clans').doc(clanId).collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot((snapshot) => {
            messagesDiv.innerHTML = '';
            snapshot.forEach((doc) => {
                const message = doc.data();
                displayMessage(message);
            });
            // En son mesaja scroll yap
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        });
}

// Mesaj gösterme
function displayMessage(message) {
    const user = auth.currentUser;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.senderId === user.uid ? 'sent' : ''}`;
    
    const senderName = document.createElement('strong');
    senderName.textContent = message.senderName + ': ';
    
    const messageText = document.createElement('span');
    messageText.textContent = message.text;
    
    messageDiv.appendChild(senderName);
    messageDiv.appendChild(messageText);
    messagesDiv.appendChild(messageDiv);
}

// Mesaj gönderme
sendMessageBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const text = messageInput.value.trim();
    const user = auth.currentUser;
    
    if (!text) return;
    if (!user) {
        alert('Mesaj göndermek için giriş yapmalısınız');
        return;
    }
    if (!currentClanId) {
        alert('Bir klan seçmelisiniz');
        return;
    }
    
    // Kullanıcı adını al
    db.collection('users').doc(user.uid).get()
        .then((doc) => {
            const username = doc.exists ? doc.data().username : 'Anonim';
            
            // Mesajı kaydet
            return db.collection('clans').doc(currentClanId).collection('messages').add({
                text: text,
                senderId: user.uid,
                senderName: username,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            messageInput.value = '';
        })
        .catch(error => {
            console.error('Mesaj gönderme hatası:', error);
            alert('Mesaj gönderilirken bir hata oluştu');
        });
}
