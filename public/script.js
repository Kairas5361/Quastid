// Uygulama Kontrolcüsü
const App = {
    // Uygulama durumu
    state: {
        currentUser: null,
        currentClan: null,
        clans: [],
        users: []
    },

    // DOM elementleri
    elements: {
        // Navigation
        homeLink: document.getElementById('home-link'),
        clansLink: document.getElementById('clans-link'),
        createClanLink: document.getElementById('create-clan-link'),
        exploreClansBtn: document.getElementById('explore-clans-btn'),
        
        // Auth Elements
        loginBtn: document.getElementById('login-btn'),
        registerBtn: document.getElementById('register-btn'),
        logoutBtn: document.getElementById('logout-btn'),
        usernameDisplay: document.getElementById('username-display'),
        
        // Sections
        homeSection: document.getElementById('home-section'),
        clansSection: document.getElementById('clans-section'),
        createClanSection: document.getElementById('create-clan-section'),
        clanDetailSection: document.getElementById('clan-detail-section'),
        
        // Modals
        loginModal: document.getElementById('login-modal'),
        registerModal: document.getElementById('register-modal'),
        closeModalButtons: document.querySelectorAll('.close-modal'),
        
        // Forms
        loginForm: document.getElementById('login-form'),
        registerForm: document.getElementById('register-form'),
        createClanForm: document.getElementById('create-clan-form'),
        clanChatForm: document.getElementById('clan-chat-form'),
        clanChatInput: document.getElementById('clan-chat-input'),
        
        // Clan Lists
        trendingClansGrid: document.getElementById('trending-clans'),
        allClansGrid: document.getElementById('all-clans'),
        clanSearch: document.getElementById('clan-search'),
        
        // Clan Detail Elements
        clanDetailName: document.getElementById('clan-detail-name'),
        clanDetailDescription: document.getElementById('clan-detail-description'),
        clanDetailTags: document.getElementById('clan-detail-tags'),
        clanMemberCount: document.getElementById('clan-member-count'),
        clanCreatedDate: document.getElementById('clan-created-date'),
        joinClanBtn: document.getElementById('join-clan-btn'),
        leaveClanBtn: document.getElementById('leave-clan-btn'),
        clanChatMessages: document.getElementById('clan-chat-messages'),
        clanMembersList: document.getElementById('clan-members-list')
    },

    // Uygulama başlatma
    init: function() {
        this.loadData();
        this.checkAuth();
        this.setupEventListeners();
        this.renderHomePage();
    },

    // Verileri yükle
    loadData: function() {
        this.state.clans = this.getClans();
        this.state.users = this.getUsers();
    },

    // LocalStorage işlemleri
    getClans: function() {
        const storedClans = localStorage.getItem('clans');
        return storedClans ? JSON.parse(storedClans) : sampleClans;
    },

    getUsers: function() {
        const storedUsers = localStorage.getItem('users');
        return storedUsers ? JSON.parse(storedUsers) : sampleUsers;
    },

    saveClans: function() {
        localStorage.setItem('clans', JSON.stringify(this.state.clans));
    },

    saveUsers: function() {
        localStorage.setItem('users', JSON.stringify(this.state.users));
    },

    // Auth işlemleri
    checkAuth: function() {
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.state.currentUser = JSON.parse(user);
            this.updateAuthUI();
        }
    },

    updateAuthUI: function() {
        const { currentUser } = this.state;
        const { 
            loginBtn, registerBtn, logoutBtn, 
            usernameDisplay, createClanLink 
        } = this.elements;

        if (currentUser) {
            loginBtn.classList.add('hidden');
            registerBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
            usernameDisplay.classList.remove('hidden');
            usernameDisplay.textContent = currentUser.username;
            createClanLink.classList.remove('hidden');
        } else {
            loginBtn.classList.remove('hidden');
            registerBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
            usernameDisplay.classList.add('hidden');
            createClanLink.classList.add('hidden');
        }
    },

    registerUser: function(username, email, password) {
        const { users } = this.state;
        
        if (users.some(user => user.username === username)) {
            return { success: false, message: 'Bu kullanıcı adı zaten alınmış.' };
        }
        
        if (users.some(user => user.email === email)) {
            return { success: false, message: 'Bu email adresi zaten kayıtlı.' };
        }
        
        const newUser = { username, email, password };
        this.state.users.push(newUser);
        this.saveUsers();
        
        return { success: true, user: newUser };
    },

    loginUser: function(username, password) {
        const { users } = this.state;
        const user = users.find(u => u.username === username && u.password === password);
        
        if (!user) {
            return { success: false, message: 'Kullanıcı adı veya şifre hatalı.' };
        }
        
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.state.currentUser = user;
        this.updateAuthUI();
        
        return { success: true, user };
    },

    logoutUser: function() {
        localStorage.removeItem('currentUser');
        this.state.currentUser = null;
        this.updateAuthUI();
        
        if (this.elements.clanDetailSection.classList.contains('active-section')) {
            this.elements.clanChatForm.classList.add('hidden');
        }
    },

    // Klan işlemleri
    createClan: function(name, description, tags) {
        const { currentUser, clans } = this.state;
        
        const newClan = {
            id: Date.now().toString(),
            name,
            description,
            tags: tags.split(',').map(tag => tag.trim()),
            createdBy: currentUser.username,
            createdAt: new Date().toISOString(),
            members: [currentUser.username],
            messages: []
        };
        
        clans.push(newClan);
        this.saveClans();
        return newClan;
    },

    joinClan: function(clanId) {
        const { currentUser, clans } = this.state;
        const clan = clans.find(c => c.id === clanId);
        
        if (!clan || !currentUser) return false;
        
        if (!clan.members.includes(currentUser.username)) {
            clan.members.push(currentUser.username);
            this.saveClans();
            return true;
        }
        
        return false;
    },

    leaveClan: function(clanId) {
        const { currentUser, clans } = this.state;
        const clan = clans.find(c => c.id === clanId);
        
        if (!clan || !currentUser) return false;
        
        clan.members = clan.members.filter(member => member !== currentUser.username);
        this.saveClans();
        return true;
    },

    addMessageToClan: function(clanId, message) {
        const { currentUser, clans } = this.state;
        const clan = clans.find(c => c.id === clanId);
        
        if (!clan || !currentUser) return false;
        
        clan.messages.push({
            user: currentUser.username,
            text: message,
            time: new Date().toISOString()
        });
        
        this.saveClans();
        return true;
    },

    // Render işlemleri
    renderHomePage: function() {
        this.hideAllSections();
        this.elements.homeSection.classList.remove('hidden-section');
        this.elements.homeSection.classList.add('active-section');
        
        const trendingClans = this.state.clans.slice(0, 3);
        this.renderClans(trendingClans, this.elements.trendingClansGrid);
    },

    renderClansPage: function() {
        this.hideAllSections();
        this.elements.clansSection.classList.remove('hidden-section');
        this.elements.clansSection.classList.add('active-section');
        
        this.renderClans(this.state.clans, this.elements.allClansGrid);
    },

    renderClans: function(clans, container) {
        container.innerHTML = '';
        
        clans.forEach(clan => {
            const clanCard = document.createElement('div');
            clanCard.className = 'clan-card';
            clanCard.innerHTML = `
                <div class="clan-card-header">
                    <h3>${clan.name}</h3>
                    <div class="clan-tags">
                        ${clan.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="clan-card-body">
                    <p class="clan-card-description">${clan.description}</p>
                </div>
                <div class="clan-card-footer">
                    <span><i class="fas fa-users"></i> ${clan.members.length} üye</span>
                    <button class="btn btn-outline view-clan-btn" data-clan-id="${clan.id}">Detaylar</button>
                </div>
            `;
            container.appendChild(clanCard);
        });
        
        // Klan detay butonlarına event listener ekle
        document.querySelectorAll('.view-clan-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const clanId = btn.getAttribute('data-clan-id');
                this.showClanDetail(clanId);
            });
        });
    },

    showClanDetail: function(clanId) {
        const clan = this.state.clans.find(c => c.id === clanId);
        if (!clan) return;
        
        this.state.currentClan = clan;
        const { elements } = this;
        
        // Klan bilgilerini doldur
        elements.clanDetailName.textContent = clan.name;
        elements.clanDetailDescription.textContent = clan.description;
        elements.clanMemberCount.textContent = clan.members.length;
        elements.clanCreatedDate.textContent = this.formatDate(clan.createdAt);
        
        // Etiketleri doldur
        elements.clanDetailTags.innerHTML = clan.tags.map(tag => 
            `<span class="tag">${tag}</span>`
        ).join('');
        
        // Üyeleri doldur
        elements.clanMembersList.innerHTML = clan.members.map(member => `
            <li>
                <div class="user-avatar">${member.charAt(0).toUpperCase()}</div>
                <span>${member}</span>
            </li>
        `).join('');
        
        // Mesajları doldur
        elements.clanChatMessages.innerHTML = clan.messages.map(msg => `
            <div class="message">
                <div class="message-header">
                    <span class="message-user">${msg.user}</span>
                    <span class="message-time">${this.formatTime(msg.time)}</span>
                </div>
                <div class="message-content">${msg.text}</div>
            </div>
        `).join('');
        
        // Kullanıcı giriş yapmışsa sohbet formunu göster
        if (this.state.currentUser) {
            elements.clanChatForm.classList.remove('hidden');
            
            // Kullanıcı klan üyesi mi kontrol et
            const isMember = clan.members.includes(this.state.currentUser.username);
            elements.joinClanBtn.classList.toggle('hidden', isMember);
            elements.leaveClanBtn.classList.toggle('hidden', !isMember);
        } else {
            elements.clanChatForm.classList.add('hidden');
        }
        
        // Bölümleri değiştir
        this.hideAllSections();
        elements.clanDetailSection.classList.remove('hidden-section');
        elements.clanDetailSection.classList.add('active-section');
        
        // Mesajları en alta kaydır
        elements.clanChatMessages.scrollTop = elements.clanChatMessages.scrollHeight;
    },

    hideAllSections: function() {
        document.querySelectorAll('main section').forEach(section => {
            section.classList.add('hidden-section');
            section.classList.remove('active-section');
        });
    },

    // Yardımcı fonksiyonlar
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR');
    },

    formatTime: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    },

    // Event listener'ları kur
    setupEventListeners: function() {
        const { elements } = this;
        
        // Navigation
        elements.homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.renderHomePage();
        });
        
        elements.clansLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.renderClansPage();
        });
        
        elements.createClanLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (!this.state.currentUser) return;
            this.hideAllSections();
            elements.createClanSection.classList.remove('hidden-section');
            elements.createClanSection.classList.add('active-section');
        });
        
        elements.exploreClansBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.renderClansPage();
        });
        
        // Auth Butonları
        elements.loginBtn.addEventListener('click', () => {
            elements.loginModal.classList.remove('hidden');
        });
        
        elements.registerBtn.addEventListener('click', () => {
            elements.registerModal.classList.remove('hidden');
        });
        
        elements.logoutBtn.addEventListener('click', () => {
            this.logoutUser();
        });
        
        // Modal Kapatma
        elements.closeModalButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.loginModal.classList.add('hidden');
                elements.registerModal.classList.add('hidden');
            });
        });
        
        // Dışarı tıklayınca modal kapatma
        window.addEventListener('click', (e) => {
            if (e.target === elements.loginModal) {
                elements.loginModal.classList.add('hidden');
            }
            if (e.target === elements.registerModal) {
                elements.registerModal.classList.add('hidden');
            }
        });
        
        // Form Submitleri
        elements.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = elements.loginForm.querySelector('#login-username').value;
            const password = elements.loginForm.querySelector('#login-password').value;
            
            const result = this.loginUser(username, password);
            if (result.success) {
                elements.loginModal.classList.add('hidden');
                elements.loginForm.reset();
                
                // Eğer klan detay sayfasındaysak sohbet formunu göster
                if (elements.clanDetailSection.classList.contains('active-section')) {
                    elements.clanChatForm.classList.remove('hidden');
                }
            } else {
                alert(result.message);
            }
        });
        
        elements.registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = elements.registerForm.querySelector('#register-username').value;
            const email = elements.registerForm.querySelector('#register-email').value;
            const password = elements.registerForm.querySelector('#register-password').value;
            const confirmPassword = elements.registerForm.querySelector('#register-confirm-password').value;
            
            if (password !== confirmPassword) {
                alert('Şifreler eşleşmiyor!');
                return;
            }
            
            const result = this.registerUser(username, email, password);
            if (result.success) {
                this.loginUser(username, password);
                elements.registerModal.classList.add('hidden');
                elements.registerForm.reset();
            } else {
                alert(result.message);
            }
        });
        
        elements.createClanForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!this.state.currentUser) return;
            
            const name = elements.createClanForm.querySelector('#clan-name').value;
            const description = elements.createClanForm.querySelector('#clan-description').value;
            const tags = elements.createClanForm.querySelector('#clan-tags').value;
            
            const newClan = this.createClan(name, description, tags);
            this.showClanDetail(newClan.id);
            elements.createClanForm.reset();
        });
        
        elements.clanChatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!this.state.currentUser || !this.state.currentClan) return;
            
            const message = elements.clanChatInput.value.trim();
            if (message) {
                this.addMessageToClan(this.state.currentClan.id, message);
                elements.clanChatInput.value = '';
                this.showClanDetail(this.state.currentClan.id); // Mesaj listesini yenile
            }
        });
        
        // Klan arama
        elements.clanSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredClans = this.state.clans.filter(clan => 
                clan.name.toLowerCase().includes(searchTerm) || 
                clan.description.toLowerCase().includes(searchTerm) ||
                clan.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
            
            this.renderClans(filteredClans, elements.allClansGrid);
        });
        
        // Klan detay sayfası butonları
        elements.joinClanBtn.addEventListener('click', () => {
            if (!this.state.currentUser || !this.state.currentClan) return;
            
            this.joinClan(this.state.currentClan.id);
            this.showClanDetail(this.state.currentClan.id);
        });
        
        elements.leaveClanBtn.addEventListener('click', () => {
            if (!this.state.currentUser || !this.state.currentClan) return;
            
            this.leaveClan(this.state.currentClan.id);
            this.showClanDetail(this.state.currentClan.id);
        });
    }
};

// Uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => App.init());
