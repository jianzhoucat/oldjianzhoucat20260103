# 我的静态网站

一个使用纯 HTML、CSS 和 JavaScript 构建的现代化静态网站，部署在 Vercel 上。

## 📋 项目简介

这是一个简洁、现代、响应式的静态网站，包含首页和联系页面。网站采用渐变色设计，提供流畅的用户体验和优雅的交互效果。

## ✨ 功能特性

- 🎨 **现代设计**：采用渐变色和玻璃态效果，视觉效果出众
- 📱 **完全响应式**：支持桌面、平板和移动设备
- 🚀 **平滑滚动**：页面内导航使用平滑滚动效果
- 📝 **表单验证**：联系表单包含完整的前端验证
- 🎭 **动画效果**：页面加载和滚动动画，提升用户体验
- 📱 **移动端菜单**：小屏幕设备上的汉堡菜单
- ⚡ **性能优化**：纯静态文件，加载速度快

## 📁 项目结构

```
my-next-app/
├── index.html              # 首页
├── contact.html            # 联系页面
├── assets/
│   ├── css/
│   │   └── style.css      # 主样式文件
│   └── js/
│       └── main.js        # JavaScript 功能
├── vercel.json            # Vercel 配置文件
└── README.md              # 项目文档
```

## 🎯 页面说明

### 首页 (index.html)
- **Header**：固定导航栏，包含网站标题和导航菜单
- **Hero 区域**：欢迎语、副标题和行动按钮
- **About 区域**：三个特色卡片展示网站优势
- **Footer**：版权信息、快速链接和社交媒体图标

### 联系页 (contact.html)
- **联系表单**：包含姓名、邮箱、留言字段
- **表单验证**：实时验证和错误提示
- **联系信息**：邮箱、电话、地址展示
- **提交反馈**：成功提示和加载状态

## 🚀 本地运行

### 方法 1：直接打开
直接在浏览器中打开 `index.html` 文件即可查看。

### 方法 2：使用本地服务器（推荐）

使用 Python 启动本地服务器：

```bash
# Python 3
python -m http.server 8000

# 或使用 Python 2
python -m SimpleHTTPServer 8000
```

然后在浏览器中访问 `http://localhost:8000`

### 方法 3：使用 Node.js

```bash
# 安装 http-server
npm install -g http-server

# 启动服务器
http-server -p 8000
```

## 🌐 部署到 Vercel

### 方法 1：通过 Vercel CLI

1. **安装 Vercel CLI**
```bash
npm install -g vercel
```

2. **登录 Vercel**
```bash
vercel login
```

3. **部署项目**
```bash
vercel
```

4. **生产环境部署**
```bash
vercel --prod
```

### 方法 2：通过 Vercel 网站

1. 访问 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 导入你的 Git 仓库（GitHub、GitLab 或 Bitbucket）
4. Vercel 会自动检测项目配置
5. 点击 "Deploy" 开始部署

### 方法 3：拖放部署

1. 访问 [Vercel](https://vercel.com)
2. 将项目文件夹拖放到 Vercel 网站上
3. 等待部署完成

## ⚙️ Vercel 配置

项目包含 `vercel.json` 配置文件，确保正确的路由和重定向：

```json
{
  "cleanUrls": true,
  "trailingSlash": false
}
```

## 🎨 自定义样式

所有样式都在 `assets/css/style.css` 中定义。你可以通过修改 CSS 变量来快速自定义主题：

```css
:root {
    --primary-color: #667eea;      /* 主色调 */
    --secondary-color: #764ba2;    /* 次要色调 */
    --accent-color: #f093fb;       /* 强调色 */
    /* ... 更多变量 */
}
```

## 🔧 JavaScript 功能

`assets/js/main.js` 包含以下功能：

- 移动端菜单切换
- 平滑滚动导航
- Header 滚动效果
- 表单验证和提交
- 页面加载动画
- 滚动触发动画

## 📱 响应式断点

- **桌面**：> 968px
- **平板**：768px - 968px
- **移动**：< 768px
- **小屏手机**：< 480px

## 🌟 浏览器支持

- Chrome（最新版）
- Firefox（最新版）
- Safari（最新版）
- Edge（最新版）
- 移动浏览器（iOS Safari、Chrome Mobile）

## 📝 待办事项

- [ ] 添加更多页面（博客、作品集等）
- [ ] 集成真实的表单提交服务（如 Formspree、Netlify Forms）
- [ ] 添加深色模式切换
- [ ] 优化 SEO 元标签
- [ ] 添加网站图标（favicon）
- [ ] 集成 Google Analytics

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👨‍💻 作者

您的名字

## 🔗 相关链接

- [Vercel 文档](https://vercel.com/docs)
- [HTML MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/HTML)
- [CSS MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/CSS)
- [JavaScript MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)

---

**享受构建的乐趣！** 🚀
