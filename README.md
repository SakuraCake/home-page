# SakuraCake

一个基于 Nuxt 3 的个人博客和追番管理系统，支持文章管理、评论、用户认证、追番记录等功能。

## 技术栈

- **前端框架**: Nuxt 3 (Vue 3 with Composition API)
- **TypeScript**: 严格模式
- **状态管理**: Pinia
- **UI 组件库**: Vuetify 3
- **ORM**: Drizzle ORM with SQLite
- **认证**: JWT
- **权限控制**: CASL
- **数据验证**: Zod
- **Markdown 处理**: Marked + Highlight.js
- **验证码**: 极验
- **缓存策略**: SWR (Stale-While-Revalidate)

## 功能特性

### 核心功能
- ✅ 文章管理（创建、编辑、删除、发布）
- ✅ 分类和标签管理
- ✅ 评论系统
- ✅ 用户认证（登录、注册、密码重置）
- ✅ 角色权限控制（管理员、普通用户）
- ✅ 追番管理（Bangumi API 集成）
- ✅ 响应式设计

### 技术特性
- ✅ 服务器端渲染 (SSR)
- ✅ 静态站点生成 (SSG) 支持
- ✅ 代码分割和懒加载
- ✅ 图片加载优化
- ✅ 错误处理和边界情况处理
- ✅ 单元测试

## 快速开始

### 环境要求
- Node.js 18+ (推荐 20+)
- npm 9+ 或 pnpm 8+

### 安装依赖

```bash
# 使用 npm
npm install

# 使用 pnpm
pnpm install
```

### 环境变量配置

1. 复制 `.env.example` 文件为 `.env`
2. 填写必要的环境变量：

```env
# 数据库配置
DATABASE_URL="sqlite://./database.db"

# JWT配置
JWT_SECRET="your-secret-key-here"

# 极验验证码配置
GEETEST_ID="your-geetest-id"
GEETEST_KEY="your-geetest-key"

# 应用配置
NUXT_PUBLIC_SITE_NAME="SakuraCake"
```

### 数据库设置

1. 生成数据库迁移文件：

```bash
npm run db:generate
```

2. 执行数据库迁移：

```bash
npm run db:migrate
```

3. (可选) 启动数据库管理界面：

```bash
npm run db:studio
```

### 开发服务器

启动开发服务器：

```bash
npm run dev
```

访问 `http://localhost:3000` 查看应用。

### 生产构建

构建生产版本：

```bash
npm run build
```

本地预览生产构建：

```bash
npm run preview
```

## 测试

运行单元测试：

```bash
npm run test
```

## 项目结构

```
├── components/         # 组件目录
├── composables/        # 组合式函数
├── config/             # 应用配置
├── database/           # 数据库相关
│   ├── migrations/     # 数据库迁移
│   ├── schema.ts       # 数据库模式
│   └── index.ts        # 数据库连接
├── pages/              # 页面目录
├── plugins/            # 插件
├── public/             # 静态资源
├── server/             # 服务器端代码
│   ├── api/            # API 路由
│   ├── middleware/     # 中间件
│   ├── schemas/        # 数据验证模式
│   └── utils/          # 工具函数
├── stores/             # Pinia 状态管理
├── tests/              # 测试文件
├── .env.example        # 环境变量示例
├── nuxt.config.ts      # Nuxt 配置
└── package.json        # 项目配置
```

## 许可证

MIT License

