# 💕 我们的浪漫空间

一个只属于两个人的私密浪漫照片网站。

## ✨ 功能

- 🔐 **密码登录** — 只有你们两人能访问
- 📸 **照片上传** — 你可以随时上传新照片
- 🎵 **背景音乐** — 浪漫氛围
- 💌 **情话轮播** — 每句都是心意
- 🌹 **精致动画** — 花瓣飘落、渐入效果
- 📱 **响应式** — 手机/电脑都能完美浏览

## 🚀 快速开始

### 本地运行
```bash
pip install -r requirements.txt
python app.py
```
访问 `http://localhost:5000`

### 部署到服务器（让她随时访问）
详见下方部署指南。

## 📝 配置

编辑 `config.py`：
- `PASSWORD` — 设置你们的专属密码
- `LOVE_TEXTS` — 自定义情话内容
- `SITE_TITLE` — 网站标题

## 📁 目录结构
```
romantic-site/
├── app.py              # Flask 主程序
├── config.py           # 配置文件
├── requirements.txt    # 依赖
├── static/
│   ├── uploads/        # 上传的照片
│   ├── css/style.css   # 样式
│   └── js/main.js      # 交互逻辑
├── templates/
│   ├── login.html      # 登录页
│   └── gallery.html    # 照片墙
└── data/
    └── photos.json     # 照片数据
```
