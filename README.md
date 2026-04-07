# SakuraCake Blog

一个基于 Nuxt 3 的个人博客系统，支持文章管理、追番列表、用户认证等功能。

## 技术栈

- **前端框架**: Nuxt 3 + Vue 3
- **UI 组件**: Vuetify 3
- **状态管理**: Pinia
- **数据库**: SQLite + Drizzle ORM
- **认证**: JWT (jose)
- **权限控制**: CASL
- **验证码**: Geetest (可选)
- **Markdown**: marked + highlight.js

## 功能特性

- 📝 文章管理 - 支持 Markdown 编辑、分类、标签、密码保护
- 👤 用户系统 - 注册、登录、个人资料管理
- 💬 评论系统 - 支持游客评论、审核机制
- 🎬 追番列表 - Bangumi 动漫收藏展示
- 🔐 权限控制 - 基于角色的访问控制 (RBAC)
- 🛡️ 安全防护 - CSRF 保护、速率限制
- 🎨 主题切换 - 明暗主题支持
- 📱 响应式设计 - 适配移动端

## 目录结构

```
├── components/          # Vue 组件
├── composables/         # 组合式函数
├── middleware/          # 路由中间件
├── pages/               # 页面路由
├── plugins/             # Nuxt 插件
├── server/
│   ├── api/             # API 端点
│   ├── database/        # 数据库配置和 Schema
│   ├── middleware/      # 服务端中间件
│   ├── plugins/         # 服务端插件
│   ├── schemas/         # Zod 验证 Schema
│   └── utils/           # 服务端工具函数
├── stores/              # Pinia 状态存储
├── types/               # TypeScript 类型定义
└── public/              # 静态资源
```

## 安装

### 环境要求

- Node.js 18+
- pnpm (推荐)

### 安装依赖

```bash
pnpm install
```

### 环境变量

创建 `.env` 文件：

```env
# JWT 密钥 (必需)
NUXT_JWT_SECRET=your-secret-key-at-least-32-characters

# Geetest 验证码 (可选)
NUXT_GEETEST_ID=
NUXT_GEETEST_KEY=

# 数据库路径
NUXT_DATABASE_URL=./data.db

# 速率限制
NUXT_RATE_LIMIT_MAX=100
NUXT_RATE_LIMIT_WINDOW_MS=900000

# Session 有效期 (秒)
NUXT_SESSION_MAX_AGE=604800
```

## 开发

```bash
pnpm dev
```

启动后访问 `http://localhost:3000`，首次运行会进入 OOBE 安装向导。

## 数据库命令

```bash
# 生成迁移文件
pnpm db:generate

# 执行迁移
pnpm db:migrate

# 推送 Schema 到数据库
pnpm db:push

# 打开 Drizzle Studio
pnpm db:studio
```

## 代码检查

```bash
# 运行 ESLint
pnpm lint

# 自动修复
pnpm lint:fix

# 类型检查
pnpm typecheck
```

## 生产构建

```bash
# 构建
pnpm build

# 预览
pnpm preview
```

## 默认配置

首次安装时，系统会创建以下默认配置：

- 社交链接: Bilibili, Steam
- Bangumi 用户名: `sakuracake`

可在管理后台修改这些配置。

## License

MIT
