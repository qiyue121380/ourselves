# -*- coding: utf-8 -*-
"""
💕 我们的浪漫空间 - Flask 主程序
"""

import os
import json
import uuid
from datetime import datetime
from functools import wraps
from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash

import config

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'our-secret-love-key-2026')

# ==================== 路径配置 ====================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, 'static', 'uploads')
DATA_FILE = os.path.join(BASE_DIR, 'data', 'photos.json')
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, 'data'), exist_ok=True)

# ==================== 数据管理 ====================
def load_photos():
    """加载照片数据"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []
    return []

def save_photos(photos):
    """保存照片数据"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(photos, f, ensure_ascii=False, indent=2)

# ==================== 认证装饰器 ====================
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'authenticated' not in session or not session['authenticated']:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# ==================== 路由 ====================
@app.route('/')
def index():
    """首页重定向"""
    if 'authenticated' in session and session['authenticated']:
        return redirect(url_for('gallery'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    """登录页面"""
    if request.method == 'POST':
        password = request.form.get('password', '')
        if password == config.PASSWORD:
            session['authenticated'] = True
            session['login_time'] = datetime.now().isoformat()
            return jsonify({'success': True, 'redirect': url_for('gallery')})
        else:
            return jsonify({'success': False, 'message': '密码不对哦，再想想~'})
    return render_template('login.html', config=config)

@app.route('/logout')
def logout():
    """退出登录"""
    session.clear()
    return redirect(url_for('login'))

@app.route('/gallery')
@login_required
def gallery():
    """照片墙主页面"""
    photos = load_photos()
    return render_template('gallery.html', config=config, photos=photos)

# ==================== API 接口 ====================
@app.route('/api/photos', methods=['GET'])
@login_required
def get_photos():
    """获取所有照片"""
    photos = load_photos()
    return jsonify({'success': True, 'photos': photos})

@app.route('/api/upload', methods=['POST'])
@login_required
def upload_photo():
    """上传新照片"""
    if 'photo' not in request.files:
        return jsonify({'success': False, 'message': '没有选择文件'})

    file = request.files['photo']
    caption = request.form.get('caption', '').strip()

    if file.filename == '':
        return jsonify({'success': False, 'message': '文件名为空'})

    # 检查文件类型
    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    if ext not in config.ALLOWED_EXTENSIONS:
        return jsonify({
            'success': False,
            'message': f'不支持的文件格式: .{ext}，支持的格式: {", ".join(config.ALLOWED_EXTENSIONS)}'
        })

    # 检查文件大小
    file.seek(0, 2)
    size = file.tell()
    file.seek(0)
    if size > config.MAX_UPLOAD_SIZE:
        return jsonify({'success': False, 'message': f'文件太大，最大支持 {config.MAX_UPLOAD_SIZE // (1024*1024)}MB'})

    # 生成唯一文件名
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    file.save(filepath)

    # 保存到数据文件
    photos = load_photos()
    photo_data = {
        'id': str(uuid.uuid4()),
        'filename': filename,
        'caption': caption or '我们的回忆',
        'date': datetime.now().strftime('%Y-%m-%d %H:%M'),
        'uploader': config.YOUR_NAME,
    }
    photos.insert(0, photo_data)  # 最新的在前
    save_photos(photos)

    return jsonify({'success': True, 'photo': photo_data, 'message': '上传成功 💕'})

@app.route('/api/photos/<photo_id>', methods=['DELETE'])
@login_required
def delete_photo(photo_id):
    """删除照片"""
    photos = load_photos()
    for i, p in enumerate(photos):
        if p['id'] == photo_id:
            # 删除文件
            filepath = os.path.join(UPLOAD_DIR, p['filename'])
            if os.path.exists(filepath):
                os.remove(filepath)
            # 从数据中移除
            photos.pop(i)
            save_photos(photos)
            return jsonify({'success': True, 'message': '已删除'})
    return jsonify({'success': False, 'message': '照片不存在'})

@app.route('/api/config')
@login_required
def get_config():
    """获取前端配置（不包含密码）"""
    return jsonify({
        'site_title': config.SITE_TITLE,
        'subtitle': config.LOVE_SUBTITLE,
        'your_name': config.YOUR_NAME,
        'her_name': config.HER_NAME,
        'love_texts': config.LOVE_TEXTS,
        'theme': config.THEME,
        'music': config.BACKGROUND_MUSIC,
    })

# ==================== 错误处理 ====================
@app.errorhandler(404)
def not_found(e):
    return redirect(url_for('index'))

@app.errorhandler(500)
def server_error(e):
    return jsonify({'success': False, 'message': '服务器开了小差...'}), 500

# ==================== 启动 ====================
if __name__ == '__main__':
    # 初始化照片数据文件
    if not os.path.exists(DATA_FILE):

        save_photos([])

    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
