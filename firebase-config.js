// Firebase 配置文件
// 请在 Firebase Console 创建项目后，将配置信息填入此处

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase 服务实例（将在初始化后设置）
let firebaseApp = null;
let auth = null;
let storage = null;
let db = null;
let currentUser = null;

// 初始化 Firebase
async function initializeFirebase() {
    try {
        // 检查配置是否已填写
        if (firebaseConfig.apiKey === "YOUR_API_KEY") {
            console.log('⚠️ Firebase 未配置，将仅使用本地存储');
            return { enabled: false, reason: 'not_configured' };
        }

        // 动态导入 Firebase SDK（从 CDN）
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getAuth, signInAnonymously, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        const { getStorage } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js');
        const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // 初始化 Firebase
        firebaseApp = initializeApp(firebaseConfig);
        auth = getAuth(firebaseApp);
        storage = getStorage(firebaseApp);
        db = getFirestore(firebaseApp);

        // 匿名登录
        return new Promise((resolve) => {
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    currentUser = user;
                    console.log('✅ Firebase 已连接，用户 ID:', user.uid);
                    resolve({ enabled: true, userId: user.uid });
                } else {
                    try {
                        const userCredential = await signInAnonymously(auth);
                        currentUser = userCredential.user;
                        console.log('✅ Firebase 匿名登录成功，用户 ID:', currentUser.uid);
                        resolve({ enabled: true, userId: currentUser.uid });
                    } catch (error) {
                        console.error('❌ Firebase 登录失败:', error);
                        resolve({ enabled: false, reason: 'auth_failed', error });
                    }
                }
            });
        });
    } catch (error) {
        console.error('❌ Firebase 初始化失败:', error);
        return { enabled: false, reason: 'init_failed', error };
    }
}

// 获取当前用户 ID
function getCurrentUserId() {
    return currentUser?.uid || null;
}

// 检查 Firebase 是否已启用
function isFirebaseEnabled() {
    return firebaseApp !== null && currentUser !== null;
}

// 导出
window.FirebaseConfig = {
    initializeFirebase,
    getCurrentUserId,
    isFirebaseEnabled,
    getAuth: () => auth,
    getStorage: () => storage,
    getFirestore: () => db
};
