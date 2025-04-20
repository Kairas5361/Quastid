// Firebase bağlantı bilgileri (kendi bilgilerinizle değiştirin)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);

// Firebase servislerine referanslar
const database = firebase.database();
const auth = firebase.auth();

// Klan işlemleri
const ClanService = {
  // Tüm klanları getir
  async getAllClans() {
    try {
      const snapshot = await database.ref('clans').once('value');
      const clans = snapshot.val();
      return clans ? Object.entries(clans).map(([id, clan]) => ({ id, ...clan })) : [];
    } catch (error) {
      console.error("Klanlar alınırken hata:", error);
      return [];
    }
  },

  // Yeni klan oluştur
  async createClan(clanData) {
    try {
      const newClanRef = database.ref('clans').push();
      await newClanRef.set({
        ...clanData,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        members: { [auth.currentUser.uid]: true }
      });
      return { id: newClanRef.key, ...clanData };
    } catch (error) {
      console.error("Klan oluşturma hatası:", error);
      throw error;
    }
  },

  // Klan detaylarını getir
  async getClanById(clanId) {
    try {
      const snapshot = await database.ref(`clans/${clanId}`).once('value');
      return snapshot.val() ? { id: clanId, ...snapshot.val() } : null;
    } catch (error) {
      console.error("Klan detay alınırken hata:", error);
      return null;
    }
  },

  // Klana katıl
  async joinClan(clanId, userId) {
    try {
      await database.ref(`clans/${clanId}/members/${userId}`).set(true);
      return true;
    } catch (error) {
      console.error("Klana katılma hatası:", error);
      return false;
    }
  },

  // Klandan ayrıl
  async leaveClan(clanId, userId) {
    try {
      await database.ref(`clans/${clanId}/members/${userId}`).remove();
      return true;
    } catch (error) {
      console.error("Klandan ayrılma hatası:", error);
      return false;
    }
  },

  // Klan sohbet mesajı ekle
  async addMessage(clanId, message) {
    try {
      const newMessageRef = database.ref(`clans/${clanId}/messages`).push();
      await newMessageRef.set({
        text: message,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      });
      return true;
    } catch (error) {
      console.error("Mesaj ekleme hatası:", error);
      return false;
    }
  },

  // Gerçek zamanlı klan dinleyicisi
  setupClansListener(callback) {
    database.ref('clans').on('value', (snapshot) => {
      const clans = snapshot.val();
      const clansArray = clans ? Object.entries(clans).map(([id, clan]) => ({ id, ...clan })) : [];
      callback(clansArray);
    });
  },

  // Gerçek zamanlı mesaj dinleyicisi
  setupMessagesListener(clanId, callback) {
    database.ref(`clans/${clanId}/messages`).on('value', (snapshot) => {
      const messages = snapshot.val();
      const messagesArray = messages ? Object.entries(messages)
        .map(([id, msg]) => ({ id, ...msg }))
        .sort((a, b) => a.timestamp - b.timestamp) : [];
      callback(messagesArray);
    });
  }
};

// Kullanıcı işlemleri
const UserService = {
  // Email/şifre ile kayıt
  async register(email, password, username) {
    try {
      const { user } = await auth.createUserWithEmailAndPassword(email, password);
      
      // Kullanıcı profilini güncelle
      await database.ref(`users/${user.uid}`).set({
        username,
        email,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      });
      
      return { success: true, user: { uid: user.uid, email, username } };
    } catch (error) {
      console.error("Kayıt hatası:", error);
      return { success: false, message: this.getErrorMessage(error.code) };
    }
  },

  // Email/şifre ile giriş
  async login(email, password) {
    try {
      const { user } = await auth.signInWithEmailAndPassword(email, password);
      
      // Kullanıcı bilgilerini getir
      const snapshot = await database.ref(`users/${user.uid}`).once('value');
      const userData = snapshot.val();
      
      return { 
        success: true, 
        user: { 
          uid: user.uid, 
          email: user.email, 
          username: userData.username 
        } 
      };
    } catch (error) {
      console.error("Giriş hatası:", error);
      return { success: false, message: this.getErrorMessage(error.code) };
    }
  },

  // Çıkış yap
  async logout() {
    try {
      await auth.signOut();
      return true;
    } catch (error) {
      console.error("Çıkış hatası:", error);
      return false;
    }
  },

  // Kullanıcı bilgilerini getir
  async getUser(uid) {
    try {
      const snapshot = await database.ref(`users/${uid}`).once('value');
      return snapshot.val() ? { uid, ...snapshot.val() } : null;
    } catch (error) {
      console.error("Kullanıcı bilgisi alınırken hata:", error);
      return null;
    }
  },

  // Hata mesajlarını düzenle
  getErrorMessage(errorCode) {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Bu email adresi zaten kullanımda';
      case 'auth/invalid-email':
        return 'Geçersiz email adresi';
      case 'auth/weak-password':
        return 'Şifre en az 6 karakter olmalı';
      case 'auth/user-not-found':
        return 'Kullanıcı bulunamadı';
      case 'auth/wrong-password':
        return 'Yanlış şifre';
      default:
        return 'Bir hata oluştu, lütfen tekrar deneyin';
    }
  },

  // Oturum durumunu dinle
  onAuthStateChanged(callback) {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userData = await this.getUser(user.uid);
        callback(userData);
      } else {
        callback(null);
      }
    });
  }
};

// Yardımcı fonksiyonlar
const Utils = {
  formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },
  
  formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

export { ClanService, UserService, Utils };
