// Örnek veriler (gerçek uygulamada bir API'dan alınır)
const sampleClans = [
    {
        id: '1',
        name: 'Oyun Severler',
        description: 'Tüm oyun severler burada toplanıyor! FPS, RPG, MMO fark etmez, hepimiz oyun seviyoruz.',
        tags: ['oyun', 'fps', 'rpg'],
        createdBy: 'gameMaster',
        createdAt: '2023-05-15',
        members: ['gameMaster', 'player1', 'player2'],
        messages: [
            { user: 'gameMaster', text: 'Hoş geldiniz oyun severler!', time: '2023-05-15T10:30:00' },
            { user: 'player1', text: 'Merhaba! Yeni oyun önerisi olan var mı?', time: '2023-05-15T11:15:00' },
            { user: 'player2', text: 'Ben şu anda Cyberpunk oynuyorum, çok güzel!', time: '2023-05-15T11:45:00' }
        ]
    },
    {
        id: '2',
        name: 'Yazılım Geliştiriciler',
        description: 'Yazılım dünyasındaki son gelişmeler, projeler ve işbirlikleri için bir araya geldik.',
        tags: ['yazılım', 'programlama', 'teknoloji'],
        createdBy: 'devLeader',
        createdAt: '2023-04-10',
        members: ['devLeader', 'coder123', 'webMaster'],
        messages: [
            { user: 'devLeader', text: 'Bugün React 18 yayınlandı, deneyen var mı?', time: '2023-04-10T09:20:00' },
            { user: 'webMaster', text: 'Evet, yeni özellikler çok heyecan verici!', time: '2023-04-10T10:05:00' }
        ]
    },
    {
        id: '3',
        name: 'Film ve Dizi Tutkunları',
        description: 'Film ve dizi önerileri, yorumlar ve tartışmalar için mükemmel bir topluluk.',
        tags: ['film', 'dizi', 'sinema'],
        createdBy: 'movieBuff',
        createdAt: '2023-06-22',
        members: ['movieBuff', 'seriesFan', 'cinemaLover'],
        messages: [
            { user: 'movieBuff', text: 'Bu hafta vizyona giren filmler hakkında ne düşünüyorsunuz?', time: '2023-06-22T14:30:00' },
            { user: 'cinemaLover', text: 'Özellikle yeni Nolan filmini merakla bekliyorum.', time: '2023-06-22T15:10:00' }
        ]
    }
];

const sampleUsers = [
    { username: 'gameMaster', email: 'gamemaster@example.com', password: 'password123' },
    { username: 'player1', email: 'player1@example.com', password: 'password123' },
    { username: 'devLeader', email: 'dev@example.com', password: 'password123' }
];

// LocalStorage'dan verileri al veya örnek verileri kullan
function getClans() {
    const storedClans = localStorage.getItem('clans');
    return storedClans ? JSON.parse(storedClans) : sampleClans;
}

function getUsers() {
    const storedUsers = localStorage.getItem('users');
    return storedUsers ? JSON.parse(storedUsers) : sampleUsers;
}

// Verileri LocalStorage'a kaydet
function saveClans(clans) {
    localStorage.setItem('clans', JSON.stringify(clans));
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Kullanıcı işlemleri
function registerUser(username, email, password) {
    const users = getUsers();
    if (users.some(user => user.username === username)) {
        return { success: false, message: 'Bu kullanıcı adı zaten alınmış.' };
    }
    if (users.some(user => user.email === email)) {
        return { success: false, message: 'Bu email adresi zaten kayıtlı.' };
    }
    
    const newUser = { username, email, password };
    users.push(newUser);
    saveUsers(users);
    return { success: true, user: newUser };
}

function loginUser(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return { success: false, message: 'Kullanıcı adı veya şifre hatalı.' };
    }
    return { success: true, user };
}

// Klan işlemleri
function createClan(name, description, tags, createdBy) {
    const clans = getClans();
    const newClan = {
        id: Date.now().toString(),
        name,
        description,
        tags: tags.split(',').map(tag => tag.trim()),
        createdBy,
        createdAt: new Date().toISOString(),
        members: [createdBy],
        messages: []
    };
    clans.push(newClan);
    saveClans(clans);
    return newClan;
}

function joinClan(clanId, username) {
    const clans = getClans();
    const clan = clans.find(c => c.id === clanId);
    if (!clan) return false;
    
    if (!clan.members.includes(username)) {
        clan.members.push(username);
        saveClans(clans);
    }
    return true;
}

function leaveClan(clanId, username) {
    const clans = getClans();
    const clan = clans.find(c => c.id === clanId);
    if (!clan) return false;
    
    clan.members = clan.members.filter(member => member !== username);
    saveClans(clans);
    return true;
}

function addMessageToClan(clanId, username, message) {
    const clans = getClans();
    const clan = clans.find(c => c.id === clanId);
    if (!clan) return false;
    
    clan.messages.push({
        user: username,
        text: message,
        time: new Date().toISOString()
    });
    saveClans(clans);
    return true;
}

// Diğer yardımcı fonksiyonlar
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}
