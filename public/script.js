import { ClanService, UserService, Utils } from './data.js';

// Uygulama Kontrolcüsü
const App = {
    // Uygulama durumu
    state: {
        currentUser: null,
        currentClan: null,
        clans: [],
        messages: [],
        users: {}
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
        this.setupEventListeners();
        this.setupAuthListener();
        this.setupClansListener();
        this.renderHomePage();
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
            this.showCreateClanPage();
        });
        
        elements.exploreClansBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.renderClansPage();
        });
        
        // Auth Buttons
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
        
        // Forms
        elements.loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = e.target.querySelector('#login-email').value;
            const password = e.target.querySelector('#login-password').value;
            
            const result = await UserService.login(email, password);
            if (result.success) {
                elements.loginModal.classList.add('hidden');
                e.target.reset();
                this.updateAuthUI();
            } else {
                alert(result.message);
            }
        });
        
        elements.registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = e.target.querySelector('#register-email').value;
            const password = e.target.querySelector('#register-password').value;
            const username = e.target.querySelector('#register-username').value;
            const confirmPassword = e.target.querySelector('#register-confirm-password').value;
            
            if (password !== confirmPassword) {
                alert('Şifreler eşleşmiyor!');
                return;
            }
            
            const result = await UserService.register(email, password, username);
            if (result.success) {
                elements.registerModal.classList.add('hidden');
                e.target.reset();
                this.updateAuthUI();
            } else {
                alert(result.message);
            }
        });
        
        elements.createClanForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!this.state.currentUser) return;
            
            const name = e.target.querySelector('#clan-name').value;
            const description = e.target.querySelector('#clan-description').value;
            const tags = e.target.querySelector('#clan-tags').value;
            
            const newClan = await ClanService.createClan({
                name,
                description,
                tags: tags.split(',').map(tag => tag.trim()),
                createdBy: this.state.currentUser.uid
            });
            
            this.showClanDetail(newClan.id);
            e.target.reset();
        });
        
        elements.clanChatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!this.state.currentUser || !this.state.currentClan) return;
            
            const message = elements.clanChatInput.value.trim();
            if (message) {
                await ClanService.addMessage(this.state.currentClan.id, message);
                elements.clanChatInput.value = '';
            }
        });
        
        // Klan arama
        elements.clanSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredClans = this.state.clans.filter(clan => 
                clan.name.toLowerCase().includes(searchTerm) || 
                clan.description.toLowerCase().includes(searchTerm) ||
                (clan.tags && clan.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
            
            this.renderClans(filteredClans, elements.allClansGrid);
        });
        
        // Klan detay sayfası butonları
        elements.joinClanBtn.addEventListener('click', async () => {
            if (!this.state.currentUser || !this.state.currentClan) return;
            
            await ClanService.joinClan(this.state.currentClan.id, this.state.currentUser.uid);
            this.showClanDetail(this.state.currentClan.id);
        });
        
        elements.leaveClanBtn.addEventListener('click', async () => {
            if (!this.state.currentUser || !this.state.currentClan) return;
            
            await ClanService.leaveClan(this.state.currentClan.id, this.state.currentUser.uid);
            this.showClanDetail(this.state.currentClan.id);
        });
    },

    // Auth dinleyicisi
    setupAuthListener: function() {
        UserService.onAuthStateChanged(async (user) => {
            if (user) {
                this.state.currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));
            } else {
                this.state.currentUser = null;
                localStorage.removeItem('currentUser');
            }
            this.updateAuthUI();
        });
    },

    // Klan dinleyicisi
    setupClansListener: function() {
        ClanService.setupClansListener((clans) => {
            this.state.clans = clans;
            
            // Eğer klanlar sayfası açıksa güncelle
            if (this.elements.clansSection.classList.contains('active-section')) {
                this.renderClans(clans, this.elements.allClansGrid);
            }
            
            // Eğer ana sayfa açıksa popüler klanları güncelle
            if (this.elements.homeSection.classList.contains('active-section')) {
                this.renderClans(clans.slice(0, 3), this.elements.trendingClansGrid);
            }
            
            // Eğer klan detay sayfası açıksa ve mevcut klan güncellendiyse
            if (this.state.currentClan && this.elements.clanDetailSection.classList.contains('active-section')) {
                const updatedClan = clans.find(c => c.id === this.state.currentClan.id);
                if (updatedClan) {
                    this.state.currentClan = updatedClan;
                    this.updateClanDetailUI();
                }
            }
        });
    },

    // Kullanıcı çıkışı
    logoutUser: async function() {
        await UserService.logout();
        this.state.currentUser = null;
        this.updateAuthUI();
        
        if (this.elements.clanDetailSection.classList.contains('active-section')) {
            this.elements.clanChatForm.classList.add('hidden');
        }
    },

    // Auth UI güncelleme
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

    // Sayfa render fonksiyonları
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

    showCreateClanPage: function() {
        this.hideAllSections();
        this.elements.createClanSection.classList.remove('hidden-section');
        this.elements.createClanSection.classList.add('active-section');
    },

    // Klan listesi render
    renderClans: function(clans, container) {
        container.innerHTML = '';
        
        clans.forEach(clan => {
            const isMember = this.state.currentUser && clan.members && clan.members[this.state.currentUser.uid];
            
            const clanCard = document.createElement('div');
            clanCard.className = 'clan-card';
            clanCard.innerHTML = `
                <div class="clan-card-header">
                    <h3>${clan.name}</h3>
                    <div class="clan-tags">
                        ${clan.tags ? clan.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                    </div>
                </div>
                <div class="clan-card-body">
                    <p class="clan-card-description">${clan.description}</p>
                </div>
                <div class="clan-card-footer">
                    <span><i class="fas fa-users"></i> ${clan.members ? Object.keys(clan.members).length : 0} üye</span>
                    <button class="btn btn-outline view-clan-btn" data-clan-id="${clan.id}">Detaylar</button>
                    ${isMember ? '<span class="member-badge">Üyesiniz</span>' : ''}
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

    // Klan detay sayfası
    async showClanDetail(clanId) {
        const clan = await ClanService.getClanById(clanId);
        if (!clan) return;
        
        this.state.currentClan = clan;
        this.updateClanDetailUI();
        
        // Mesaj dinleyicisini kur
        ClanService.setupMessagesListener(clanId, (messages) => {
            this.state.messages = messages;
            this.renderMessages(messages);
        });
        
        // Üyeleri yükle
        this.loadClanMembers(clan);
        
        // Bölümleri değiştir
        this.hideAllSections();
        this.elements.clanDetailSection.classList.remove('hidden-section');
        this.elements.clanDetailSection.classList.add('active-section');
    },

    // Klan detay UI güncelleme
    updateClanDetailUI: function() {
        const { currentClan, currentUser } = this.state;
        const { elements } = this;
        
        elements.clanDetailName.textContent = currentClan.name;
        elements.clanDetailDescription.textContent = currentClan.description;
        elements.clanMemberCount.textContent = currentClan.members ? Object.keys(currentClan.members).length : 0;
        elements.clanCreatedDate.textContent = Utils.formatDate(currentClan.createdAt);
        
        // Etiketleri doldur
        elements.clanDetailTags.innerHTML = currentClan.tags ? 
            currentClan.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';
        
        // Kullanıcı giriş yapmışsa sohbet formunu göster
        if (currentUser) {
            elements.clanChatForm.classList.remove('hidden');
            
            // Kullanıcı klan üyesi mi kontrol et
            const isMember = currentClan.members && currentClan.members[currentUser.uid];
            elements.joinClanBtn.classList.toggle('hidden', isMember);
            elements.leaveClanBtn.classList.toggle('hidden', !isMember);
        } else {
            elements.clanChatForm.classList.add('hidden');
        }
    },

    // Mesajları render et
    renderMessages: function(messages) {
        const { currentUser } = this.state;
        const { clanChatMessages } = this.elements;
        
        clanChatMessages.innerHTML = messages.map(msg => `
            <div class="message ${msg.userId === currentUser?.uid ? 'own-message' : ''}">
                <div class="message-header">
                    <span class="message-user">${msg.userEmail || 'Anonim'}</span>
                    <span class="message-time">${Utils.formatTime(msg.timestamp)}</span>
                </div>
                <div class="message-content">${msg.text}</div>
            </div>
        `).join('');
        
        // Mesajları en alta kaydır
        clanChatMessages.scrollTop = clanChatMessages.scrollHeight;
    },

    // Klan üyelerini yükle
    async loadClanMembers(clan) {
        const { clanMembersList } = this.elements;
        clanMembersList.innerHTML = '';
        
        if (!clan.members) return;
        
        for (const userId in clan.members) {
            const user = await UserService.getUser(userId);
            if (user) {
                const memberItem = document.createElement('li');
                memberItem.innerHTML = `
                    <div class="user-avatar">${user.username.charAt(0).toUpperCase()}</div>
                    <span>${user.username}</span>
                    ${clan.createdBy === userId ? '<span class="creator-badge">Kurucu</span>' : ''}
                `;
                clanMembersList.appendChild(memberItem);
            }
        }
    },

    // Tüm bölümleri gizle
    hideAllSections: function() {
        document.querySelectorAll('main section').forEach(section => {
            section.classList.add('hidden-section');
            section.classList.remove('active-section');
        });
    }
};

// Uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => App.init());
