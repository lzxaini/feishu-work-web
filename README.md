fa你敢报工系统

> 基于飞书开放平台的报工管理系统：用户在飞书客户端内免登使用，工作日 8 小时内免审批，加班/节假日报工走飞书审批中心，审批提醒走飞书消息。

- 需求拆解文档见 [`docs/`](./docs/)
- 技术栈：**Node.js (NestJS) + MySQL (Prisma) + Vue 3 (Vite + TDesign)**，前端设计遵循 [`docs/DESIGN.md`](./docs/DESIGN.md)

## 目录结构

```
feishu-work/
├── docs/                     # 需求拆解 / 数据表设计 / 飞书对接方案
├── server/                   # 后端 (NestJS)
│   ├── prisma/schema.prisma  # 数据模型（10 张表）
│   └── src/
│       ├── modules/          # auth/user/project/report/approval/calendar/notify/admin
│       ├── feishu/           # 飞书 SDK 封装（token/免登/审批/消息）
│       ├── jobs/             # 定时任务（审批对账/通讯录同步）
│       └── prisma/ common/
└── web/                      # 前端 (Vue3)
    └── src/
        ├── api/              # axios 封装
        ├── views/            # 登录/项目/报工/日历/设置
        ├── stores/ router/ components/
```

## 快速开始

### 1. 后端 `server/`

```bash
cd server
npm install
cp .env.example .env        # 填写 MySQL 连接与飞书应用配置
npx prisma migrate dev      # 建表
npm run start:dev           # http://localhost:3000/api
```

### 2. 前端 `web/`

```bash
cd web
npm install
cp .env.example .env        # 填写 VITE_FEISHU_APP_ID
npm run dev                 # http://localhost:5173（/api 代理到 3000）
```

## 飞书应用配置（开发者后台）

1. 创建**企业自建应用** → 应用能力添加**网页应用** → 配置网页应用主页地址
2. 开通权限：`contact:user.base:readonly`、`contact:department.base:readonly`、`im:message`、`approval:approval`、网页应用能力
3. 事件订阅：`POST /api/internal/feishu/approval-callback`（审批实例事件 `approval_instance`）
4. 审批后台创建「报工审批」定义，`approval_code` 填入 `.env`
5. 创建版本发布，可用范围包含使用用户

> 详细步骤见 [`docs/04-飞书对接方案.md`](./docs/04-飞书对接方案.md)

## 登录方式

- **主**：飞书端内免登 —— 前端 `tt.requestAccess`/`requestAuthCode` 拿 code → 后端换 `user_access_token` → `user_info` 取 open_id → 签发本系统 JWT
- **备**：浏览器直接访问时走网页授权 OAuth（见 docs/04 3.2）

## 常用命令

| 位置 | 命令 | 说明 |
|---|---|---|
| server | `npm run start:dev` | 开发启动（watch） |
| server | `npm run prisma:studio` | 数据库可视化 |
| server | `npm run build` | 编译 |
| web | `npm run dev` | 开发启动 |
| web | `npm run build` | 打包 |
