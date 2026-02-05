// Firebase 云端同步模块
class FirebaseSync {
    constructor(localDB) {
        this.localDB = localDB; // IndexedDB 实例
        this.enabled = false;
        this.userId = null;
        this.syncInProgress = false;
        this.listeners = [];
    }

    // 初始化云端同步
    async initialize() {
        try {
            const result = await window.FirebaseConfig.initializeFirebase();

            if (!result.enabled) {
                console.log('ℹ️ 云端同步未启用:', result.reason);
                return false;
            }

            this.enabled = true;
            this.userId = result.userId;

            // 启动实时监听
            await this.startRealtimeSync();

            console.log('✅ 云端同步已启动');
            return true;
        } catch (error) {
            console.error('❌ 云端同步初始化失败:', error);
            return false;
        }
    }

    // 上传壁纸到云端
    async uploadWallpaper(wallpaper) {
        if (!this.enabled) {
            console.log('ℹ️ 云端同步未启用，跳过上传');
            return null;
        }

        try {
            const storage = window.FirebaseConfig.getStorage();
            const db = window.FirebaseConfig.getFirestore();

            // 动态导入 Firebase 模块
            const { ref, uploadString, getDownloadURL } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js');
            const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            // 1. 上传文件到 Storage
            const fileName = `${wallpaper.id}_${wallpaper.name}`;
            const storageRef = ref(storage, `users/${this.userId}/wallpapers/${fileName}`);

            // 上传 base64 数据
            const uploadResult = await uploadString(storageRef, wallpaper.src, 'data_url');

            // 2. 获取下载链接
            const downloadURL = await getDownloadURL(uploadResult.ref);

            // 3. 保存元数据到 Firestore
            const docRef = await addDoc(collection(db, `users/${this.userId}/wallpapers`), {
                wallpaperId: wallpaper.id,
                name: wallpaper.name,
                type: wallpaper.type,
                storageUrl: downloadURL,
                storagePath: uploadResult.ref.fullPath,
                uploadDate: wallpaper.uploadDate,
                createdAt: serverTimestamp()
            });

            console.log('✅ 壁纸已上传到云端:', wallpaper.name);
            return { docId: docRef.id, downloadURL };
        } catch (error) {
            console.error('❌ 上传壁纸失败:', error);
            // 上传失败不影响本地使用
            return null;
        }
    }

    // 从云端删除壁纸
    async deleteWallpaper(wallpaper) {
        if (!this.enabled) return;

        try {
            const storage = window.FirebaseConfig.getStorage();
            const db = window.FirebaseConfig.getFirestore();

            const { ref, deleteObject } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js');
            const { collection, query, where, getDocs, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            // 1. 从 Storage 删除文件
            const fileName = `${wallpaper.id}_${wallpaper.name}`;
            const storageRef = ref(storage, `users/${this.userId}/wallpapers/${fileName}`);

            try {
                await deleteObject(storageRef);
            } catch (err) {
                console.warn('Storage 文件可能已删除:', err);
            }

            // 2. 从 Firestore 删除元数据
            const q = query(
                collection(db, `users/${this.userId}/wallpapers`),
                where('wallpaperId', '==', wallpaper.id)
            );

            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });

            console.log('✅ 壁纸已从云端删除:', wallpaper.name);
        } catch (error) {
            console.error('❌ 云端删除失败:', error);
        }
    }

    // 启动实时同步监听
    async startRealtimeSync() {
        if (!this.enabled) return;

        try {
            const db = window.FirebaseConfig.getFirestore();
            const { collection, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            const wallpapersRef = collection(db, `users/${this.userId}/wallpapers`);

            // 监听云端数据变化
            const unsubscribe = onSnapshot(wallpapersRef, async (snapshot) => {
                if (this.syncInProgress) {
                    console.log('⏳ 同步进行中，跳过此次更新');
                    return;
                }

                const changes = snapshot.docChanges();

                for (const change of changes) {
                    const data = change.doc.data();

                    if (change.type === 'added') {
                        await this.handleCloudAdd(data);
                    } else if (change.type === 'removed') {
                        await this.handleCloudRemove(data);
                    }
                }
            });

            this.listeners.push(unsubscribe);
            console.log('✅ 实时同步已启动');
        } catch (error) {
            console.error('❌ 启动实时同步失败:', error);
        }
    }

    // 处理云端新增
    async handleCloudAdd(data) {
        try {
            // 检查本地是否已存在
            const allWallpapers = await this.localDB.getAllWallpapers();
            const exists = allWallpapers.some(w => w.id === data.wallpaperId);

            if (exists) {
                console.log('ℹ️ 壁纸已存在本地，跳过:', data.name);
                return;
            }

            // 从云端下载图片
            const response = await fetch(data.storageUrl);
            const blob = await response.blob();

            // 转换为 base64
            const reader = new FileReader();
            const base64 = await new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });

            // 保存到本地
            const wallpaper = {
                id: data.wallpaperId,
                name: data.name,
                type: data.type,
                src: base64,
                uploadDate: data.uploadDate
            };

            await this.localDB.saveWallpaper(wallpaper);
            console.log('📥 从云端同步新壁纸:', data.name);

            // 通知应用刷新界面
            if (window.galleryDB) {
                await window.galleryDB.loadFromStorage();
                window.galleryDB.render();
                await window.galleryDB.updateStorageEstimate();
            }
        } catch (error) {
            console.error('❌ 同步云端壁纸失败:', error);
        }
    }

    // 处理云端删除
    async handleCloudRemove(data) {
        try {
            await this.localDB.deleteWallpaper(data.wallpaperId);
            console.log('🗑️ 同步删除本地壁纸:', data.name);

            // 通知应用刷新界面
            if (window.galleryDB) {
                await window.galleryDB.loadFromStorage();
                window.galleryDB.render();
                await window.galleryDB.updateStorageEstimate();
            }
        } catch (error) {
            console.error('❌ 同步删除失败:', error);
        }
    }

    // 停止所有监听
    stopListeners() {
        this.listeners.forEach(unsubscribe => unsubscribe());
        this.listeners = [];
        console.log('🛑 实时同步已停止');
    }

    // 手动全量同步
    async fullSync() {
        if (!this.enabled) {
            console.log('ℹ️ 云端同步未启用');
            return;
        }

        this.syncInProgress = true;

        try {
            const db = window.FirebaseConfig.getFirestore();
            const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            const wallpapersRef = collection(db, `users/${this.userId}/wallpapers`);
            const snapshot = await getDocs(wallpapersRef);

            const cloudWallpapers = [];
            snapshot.forEach((doc) => {
                cloudWallpapers.push(doc.data());
            });

            console.log(`☁️ 云端共有 ${cloudWallpapers.length} 张壁纸`);

            // 下载缺失的壁纸
            for (const data of cloudWallpapers) {
                await this.handleCloudAdd(data);
            }

            console.log('✅ 全量同步完成');
        } catch (error) {
            console.error('❌ 全量同步失败:', error);
        } finally {
            this.syncInProgress = false;
        }
    }
}

// 导出
window.FirebaseSync = FirebaseSync;
