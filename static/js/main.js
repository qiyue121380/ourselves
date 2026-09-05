/* ========================================
   💕 我们的浪漫空间 - 交互逻辑
   ======================================== */

// ==================== 花瓣飘落动画 ====================
class PetalAnimation {
    constructor() {
        this.canvas = document.getElementById('petals-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.petals = [];
        this.resize();
        this.init();
        this.animate();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        const colors = ['#e91e63', '#ff6b9d', '#ffb6c1', '#ff69b4', '#ff1493'];
        for (let i = 0; i < 30; i++) {
            this.petals.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height - this.canvas.height,
                size: Math.random() * 8 + 4,
                speedY: Math.random() * 1.5 + 0.5,
                speedX: Math.random() * 1 - 0.5,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 2 - 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: Math.random() * 0.5 + 0.3,
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.petals.forEach((petal) => {
            petal.y += petal.speedY;
            petal.x += petal.speedX + Math.sin(petal.y * 0.01) * 0.5;
            petal.rotation += petal.rotationSpeed;

            if (petal.y > this.canvas.height + 20) {
                petal.y = -20;
                petal.x = Math.random() * this.canvas.width;
            }

            this.ctx.save();
            this.ctx.translate(petal.x, petal.y);
            this.ctx.rotate((petal.rotation * Math.PI) / 180);
            this.ctx.globalAlpha = petal.opacity;
            this.ctx.fillStyle = petal.color;
            // 画花瓣形状（心形）
            this.drawPetal(petal.size);
            this.ctx.restore();
        });

        requestAnimationFrame(() => this.animate());
    }

    drawPetal(size) {
        // 简单的花瓣形状
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.bezierCurveTo(size / 2, -size / 2, size, -size / 4, 0, size);
        this.ctx.bezierCurveTo(-size, -size / 4, -size / 2, -size / 2, 0, 0);
        this.ctx.fill();
    }
}

// 初始化花瓣动画
document.addEventListener('DOMContentLoaded', () => {
    new PetalAnimation();
});

// ==================== 情话轮播 ====================
function initLoveCarousel() {
    const items = document.querySelectorAll('.love-text-item');
    if (!items.length) return;
    let current = 0;

    setInterval(() => {
        items[current].classList.remove('active');
        current = (current + 1) % items.length;
        items[current].classList.add('active');
    }, 4000);
}

// ==================== Toast 提示 ====================
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// ==================== 相册主逻辑 ====================
function initGallery() {
    initLoveCarousel();
    initUploadDrawer();
    initLoveModal();
    initLightbox();
    initPhotoActions();
}

// ==================== 上传抽屉 ====================
function initUploadDrawer() {
    const uploadBtn = document.getElementById('upload-btn');
    const drawer = document.getElementById('upload-drawer');
    const overlay = drawer?.querySelector('.drawer-overlay');
    const closeBtn = drawer?.querySelector('.drawer-close');
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('photo-input');
    const preview = document.getElementById('upload-preview');
    const placeholder = document.querySelector('.upload-placeholder');
    const form = document.getElementById('upload-form');

    if (!uploadBtn || !drawer) return;

    const openDrawer = () => {
        drawer.classList.add('open');
    };

    const closeDrawer = () => {
        drawer.classList.remove('open');
        // 重置表单
        setTimeout(() => {
            form.reset();
            preview.style.display = 'none';
            placeholder.style.display = 'flex';
        }, 300);
    };

    uploadBtn.addEventListener('click', openDrawer);
    overlay?.addEventListener('click', closeDrawer);
    closeBtn?.addEventListener('click', closeDrawer);

    // 点击上传区域
    uploadArea?.addEventListener('click', () => fileInput?.click());

    // 拖拽上传
    uploadArea?.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea?.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea?.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    });

    // 文件选择
    fileInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFileSelect(file);
    });

    function handleFileSelect(file) {
        if (!file.type.startsWith('image/')) {
            showToast('请选择图片文件哦~', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    // 提交上传
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = fileInput.files[0];
        if (!file) {
            showToast('请先选择一张照片~', 'error');
            return;
        }

        const caption = document.getElementById('caption').value;
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('caption', caption);

        const submitBtn = form.querySelector('.upload-submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>⏳</span> 上传中...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (data.success) {
                showToast('上传成功 💕');
                // 添加新照片到网格
                addPhotoCard(data.photo);
                closeDrawer();
            } else {
                showToast(data.message || '上传失败', 'error');
            }
        } catch (err) {
            showToast('网络有点小问题，再试一次~', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// 添加照片卡片（带动画）
function addPhotoCard(photo) {
    const grid = document.getElementById('photo-grid');
    const emptyState = document.querySelector('.empty-state');

    // 移除空状态
    if (emptyState) emptyState.remove();

    // 确保 grid 存在
    let photoGrid = grid;
    if (!photoGrid) {
        photoGrid = document.createElement('div');
        photoGrid.className = 'photo-grid';
        photoGrid.id = 'photo-grid';
        document.querySelector('.gallery-main').appendChild(photoGrid);
    }

    const card = document.createElement('div');
    card.className = 'photo-card';
    card.dataset.id = photo.id;
    card.style.animationDelay = '0s';
    card.innerHTML = `
        <div class="photo-wrapper">
            <img src="/static/uploads/${photo.filename}" alt="${photo.caption}" loading="lazy">
            <div class="photo-overlay">
                <button class="photo-view-btn" title="查看大图">🔍</button>
                <button class="photo-delete-btn" title="删除" data-id="${photo.id}">🗑️</button>
            </div>
        </div>
        <div class="photo-info">
            <p class="photo-caption">${photo.caption}</p>
            <span class="photo-date">${photo.date}</span>
        </div>
    `;

    photoGrid.prepend(card);
    // 触发动画
    requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    });

    // 重新绑定事件
    initPhotoActions();
}

// ==================== 情话弹窗 ====================
function initLoveModal() {
    const loveBtn = document.getElementById('love-text-btn');
    const modal = document.getElementById('love-modal');
    const closeBtn = modal?.querySelector('.modal-close');
    const messageEl = document.getElementById('love-message');

    if (!loveBtn || !modal) return;

    // 从页面中收集情话
    const loveTexts = Array.from(document.querySelectorAll('.love-text-item'))
        .map((el) => el.textContent.trim())
        .filter(Boolean);

    const openModal = () => {
        if (loveTexts.length && messageEl) {
            const randomText = loveTexts[Math.floor(Math.random() * loveTexts.length)];
            // 打字机效果
            messageEl.textContent = '';
            let i = 0;
            const typeWriter = () => {
                if (i < randomText.length) {
                    messageEl.textContent += randomText[i];
                    i++;
                    setTimeout(typeWriter, 50);
                }
            };
            typeWriter();
        }
        modal.classList.add('open');
    };

    const closeModal = () => modal.classList.remove('open');

    loveBtn.addEventListener('click', openModal);
    closeBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

// ==================== Lightbox 大图查看 ====================
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');
    const closeBtn = lightbox?.querySelector('.lightbox-close');
    const prevBtn = lightbox?.querySelector('.lightbox-prev');
    const nextBtn = lightbox?.querySelector('.lightbox-next');

    if (!lightbox) return;

    let currentIndex = 0;
    let photos = [];

    const updatePhotos = () => {
        photos = Array.from(document.querySelectorAll('.photo-card')).map((card) => ({
            src: card.querySelector('img').src,
            caption: card.querySelector('.photo-caption')?.textContent || '',
        }));
    };

    const showPhoto = (index) => {
        if (!photos.length) return;
        currentIndex = (index + photos.length) % photos.length;
        img.src = photos[currentIndex].src;
        caption.textContent = photos[currentIndex].caption;
    };

    // 事件委托：点击查看大图
    document.addEventListener('click', (e) => {
        const viewBtn = e.target.closest('.photo-view-btn');
        const card = e.target.closest('.photo-card');

        if (viewBtn && card) {
            updatePhotos();
            const index = photos.findIndex(
                (p) => p.src === card.querySelector('img').src
            );
            showPhoto(index);
            lightbox.classList.add('open');
        }
    });

    closeBtn?.addEventListener('click', () => lightbox.classList.remove('open'));
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) lightbox.classList.remove('open');
    });

    prevBtn?.addEventListener('click', () => showPhoto(currentIndex - 1));
    nextBtn?.addEventListener('click', () => showPhoto(currentIndex + 1));

    // 键盘控制
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') lightbox.classList.remove('open');
        if (e.key === 'ArrowLeft') showPhoto(currentIndex - 1);
        if (e.key === 'ArrowRight') showPhoto(currentIndex + 1);
    });
}

// ==================== 照片操作（删除等） ====================
function initPhotoActions() {
    // 使用事件委托处理删除
    const grid = document.getElementById('photo-grid');
    if (!grid) return;

    grid.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.photo-delete-btn');
        if (!deleteBtn) return;

        const photoId = deleteBtn.dataset.id;
        const card = deleteBtn.closest('.photo-card');

        if (!confirm('确定要删除这张照片吗？')) return;

        try {
            const response = await fetch(`/api/photos/${photoId}`, {
                method: 'DELETE',
            });
            const data = await response.json();

            if (data.success) {
                // 动画移除
                card.style.transition = 'all 0.4s ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    card.remove();
                    // 检查是否为空
                    if (!grid.children.length) {
                        location.reload();
                    }
                }, 400);
                showToast('已删除 💔');
            }
        } catch (err) {
            showToast('删除失败，再试一次~', 'error');
        }
    });
}

// ==================== 背景音乐控制 ====================
document.addEventListener('DOMContentLoaded', () => {
    const musicBtn = document.getElementById('music-toggle');
    const audio = document.getElementById('bg-music');
    if (!musicBtn || !audio) return;

    let isPlaying = false;
    musicBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            musicBtn.textContent = '🎵';
        } else {
            audio.play();
            musicBtn.textContent = '🔇';
        }
        isPlaying = !isPlaying;
    });
});

// ==================== ESC 关闭弹窗 ====================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.drawer.open, .modal.open').forEach((el) => {
            el.classList.remove('open');
        });
    }
});
