# 🚀 部署指南

让她在任何地方都能打开网页看到你们的浪漫空间！

## 方案一：Railway（推荐，最简单）

1. 注册 [Railway.app](https://railway.app)（可用 GitHub 账号登录）
2. 新建项目 → Deploy from GitHub → 连接你的仓库
3. 自动检测 Flask，直接部署
4. 部署完成后获得一个 `xxx.railway.app` 的网址
5. 把这个网址发给她，输入密码即可访问 ✅

## 方案二：Render

1. 注册 [Render.com](https://render.com)
2. New → Web Service → 连接 GitHub 仓库
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `gunicorn app:app`
5. 免费额度足够两人使用

## 方案三：PythonAnywhere（适合新手）

1. 注册 [PythonAnywhere.com](https://www.pythonanywhere.com) 免费账号
2. 进入 Dashboard → Web 面板
3. 上传项目文件（或通过 Git 克隆）
4. 配置 WSGI 文件指向 `app.py`
5. 设置静态文件路径
6. 获得 `xxx.pythonanywhere.com` 网址

## 方案四：自有服务器（VPS）

```bash
# SSH 登录服务器
ssh user@your-server

# 安装依赖
sudo apt update
sudo apt install python3-pip nginx -y
pip3 install virtualenv

# 上传项目（或用 git clone）
# 创建虚拟环境
cd /path/to/romantic-site
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt

# 使用 gunicorn 运行
gunicorn -w 4 -b 127.0.0.1:5000 app:app

# 配置 Nginx 反向代理 + HTTPS（推荐用 Let's Encrypt 免费证书）
```

## 📝 部署前必做的配置

### 1. 修改密码（重要！）
编辑 `config.py` 中的 `PASSWORD`，改成一个只有你们知道的密码。

### 2. 自定义情话
编辑 `config.py` 中的 `LOVE_TEXTS`，换成你们自己的甜蜜话语。

### 3. 设置站点标题
编辑 `config.py` 中的 `SITE_TITLE` 和 `YOUR_NAME` / `HER_NAME`。

### 4. 添加背景音乐（可选）
在 `config.py` 中设置 `BACKGROUND_MUSIC` 为歌曲的直链 URL。

## 🔒 安全提示

- ⚠️ 密码不要设得太简单
- ⚠️ 部署后建议启用 HTTPS（现代云平台默认提供）
- ⚠️ 上传的照片存储在服务器上，定期备份 `static/uploads/` 和 `data/photos.json`
- ⚠️ 不建议放在公域搜索引擎可爬取的地方（robots.txt 已默认禁止）

## 📸 日常使用

- **她**：打开网址 → 输入密码 → 浏览照片
- **你**：打开网址 → 输入密码 → 点击「上传照片」→ 选择照片 → 写一句话 → 保存
- 上传后她刷新页面即可看到新照片 💕
