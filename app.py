import os
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-change-me')

# 简单的内存存储（演示用，重启会重置；生产建议接数据库）
PHOTOS = []
MESSAGES = []


@app.route('/')
def index():
    return render_template('index.html', photos=PHOTOS, messages=MESSAGES)


@app.route('/gallery')
def gallery():
    return render_template('gallery.html', photos=PHOTOS)


@app.route('/api/photos', methods=['GET', 'POST'])
def api_photos():
    global PHOTOS
    if request.method == 'POST':
        data = request.get_json(force=True)
        photo = {
            'id': len(PHOTOS) + 1,
            'url': data.get('url', ''),
            'caption': data.get('caption', ''),
            'date': datetime.now().strftime('%Y-%m-%d'),
        }
        PHOTOS.append(photo)
        return jsonify(photo), 201
    return jsonify(PHOTOS)


@app.route('/api/messages', methods=['GET', 'POST'])
def api_messages():
    global MESSAGES
    if request.method == 'POST':
        data = request.get_json(force=True)
        msg = {
            'id': len(MESSAGES) + 1,
            'text': data.get('text', ''),
            'author': data.get('author', '匿名'),
            'date': datetime.now().strftime('%Y-%m-%d %H:%M'),
        }
        MESSAGES.append(msg)
        return jsonify(msg), 201
    return jsonify(MESSAGES)


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        # 演示账号：admin / love123 （生产请换成真实鉴权）
        if username == 'admin' and password == 'love123':
            session['user'] = username
            flash('登录成功 💕', 'success')
            return redirect(url_for('index'))
        flash('账号或密码错误', 'error')
    return render_template('login.html')


@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('index'))


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
