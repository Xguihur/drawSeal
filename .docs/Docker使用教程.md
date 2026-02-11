# Docker 使用教程

## 📚 目录

- [基础概念](#基础概念)
- [Docker Compose 命令详解](#docker-compose-命令详解)
- [完整操作流程](#完整操作流程)
- [常见场景](#常见场景)
- [故障排查](#故障排查)
- [最佳实践](#最佳实践)

## 🎯 基础概念

### Docker 核心概念

```
┌─────────────────────────────────────────────────┐
│                   Dockerfile                     │  ← 镜像构建脚本
│  (定义如何构建镜像的指令文件)                      │
└───────────────────┬─────────────────────────────┘
                    │ docker build
                    ↓
┌─────────────────────────────────────────────────┐
│                   Image (镜像)                   │  ← 只读模板
│  (包含应用代码、依赖、配置的只读模板)               │
└───────────────────┬─────────────────────────────┘
                    │ docker run
                    ↓
┌─────────────────────────────────────────────────┐
│                Container (容器)                  │  ← 运行实例
│  (基于镜像创建的可运行实例)                        │
└─────────────────────────────────────────────────┘
```

### 关键术语

| 术语 | 说明 | 类比 |
|-----|------|-----|
| **Dockerfile** | 构建镜像的配置文件 | 菜谱 |
| **Image（镜像）** | 应用的完整打包，只读 | 菜品模板 |
| **Container（容器）** | 镜像运行的实例 | 实际制作的菜 |
| **docker-compose.yml** | 多容器编排配置文件 | 套餐菜单 |

### Docker Compose vs docker-compose

```bash
# ❌ 旧版命令（已弃用）
docker-compose up

# ✅ 新版命令（推荐）
docker compose up
```

**区别**：
- `docker-compose`：独立的 Python 工具，需要单独安装
- `docker compose`：Docker CLI 的子命令，内置在 Docker Desktop/Engine 中
- 新版更快、更稳定，推荐使用

## 🛠️ Docker Compose 命令详解

### 1. 镜像构建命令

#### `docker compose build`

**功能**：根据 `docker-compose.yml` 中的配置构建镜像

```bash
# 基础构建（使用缓存）
docker compose build

# 完全重新构建（不使用缓存）
docker compose build --no-cache

# 只构建特定服务
docker compose build generate-seal

# 并行构建（加速）
docker compose build --parallel
```

**参数说明**：
- `--no-cache`：忽略所有缓存，从头开始构建（修改 Dockerfile 后推荐使用）
- `--parallel`：并行构建多个服务（多服务项目）
- `--pull`：总是尝试拉取更新的基础镜像

**使用场景**：
- ✅ 修改了 `Dockerfile`
- ✅ 修改了 `package.json`（依赖变更）
- ✅ 添加了新的系统依赖包

---

### 2. 容器启动命令

#### `docker compose up`

**功能**：启动所有服务（如果镜像不存在会自动构建）

```bash
# 前台运行（查看实时日志）
docker compose up

# 后台运行（推荐用于生产环境）
docker compose up -d

# 强制重新创建容器
docker compose up -d --force-recreate

# 同时构建并启动
docker compose up -d --build
```

**参数说明**：
- `-d` / `--detach`：后台运行（detached mode）
- `--force-recreate`：强制重新创建容器，即使配置未改变
- `--build`：启动前先构建镜像
- `--no-deps`：不启动关联的服务

**使用场景**：
- ✅ 首次启动服务
- ✅ 重启已停止的服务
- ✅ 应用配置更改后重启

---

### 3. 容器停止和删除命令

#### `docker compose down`

**功能**：停止并删除所有容器、网络

```bash
# 基础停止（保留卷和镜像）
docker compose down

# 同时删除卷（数据库数据会丢失！）
docker compose down -v

# 同时删除镜像
docker compose down --rmi all

# 删除所有内容（容器、网络、卷、镜像）
docker compose down -v --rmi all
```

**参数说明**：
- `-v` / `--volumes`：删除关联的卷
- `--rmi all`：删除所有镜像
- `--rmi local`：只删除没有 tag 的镜像

**使用场景**：
- ✅ 完全停止服务
- ✅ 清理环境准备重新部署
- ⚠️ **注意**：`-v` 会删除数据，谨慎使用

---

#### `docker compose stop`

**功能**：停止容器但不删除

```bash
# 停止所有服务
docker compose stop

# 停止特定服务
docker compose stop generate-seal

# 设置超时时间（默认 10 秒）
docker compose stop -t 30
```

**区别**：
- `stop`：只停止，容器还在，可以用 `start` 重启
- `down`：停止并删除，需要重新 `up` 创建

---

#### `docker compose start`

**功能**：启动已停止的容器

```bash
# 启动所有服务
docker compose start

# 启动特定服务
docker compose start generate-seal
```

**使用场景**：
- ✅ 重启 `stop` 停止的容器
- ❌ 不能启动 `down` 删除的容器（需要用 `up`）

---

#### `docker compose restart`

**功能**：重启容器

```bash
# 重启所有服务
docker compose restart

# 重启特定服务
docker compose restart generate-seal

# 设置超时时间
docker compose restart -t 30
```

**等价于**：
```bash
docker compose stop && docker compose start
```

---

### 4. 日志查看命令

#### `docker compose logs`

**功能**：查看容器日志

```bash
# 查看所有服务日志
docker compose logs

# 实时跟踪日志（Ctrl+C 退出）
docker compose logs -f

# 查看特定服务日志
docker compose logs generate-seal

# 查看最后 100 行日志
docker compose logs --tail=100

# 带时间戳
docker compose logs -f --timestamps

# 查看最近 10 分钟的日志
docker compose logs --since 10m
```

**参数说明**：
- `-f` / `--follow`：实时跟踪日志
- `--tail=N`：只显示最后 N 行
- `--timestamps`：显示时间戳
- `--since`：显示指定时间后的日志（如 `10m`、`2h`、`2023-01-01`）

---

### 5. 容器管理命令

#### `docker compose ps`

**功能**：查看服务状态

```bash
# 查看所有服务状态
docker compose ps

# 查看所有容器（包括停止的）
docker compose ps -a

# 只显示服务名称
docker compose ps --services
```

**输出示例**：
```
NAME              COMMAND          SERVICE          STATUS        PORTS
generate-seal     "npm start"      generate-seal    Up 2 hours    0.0.0.0:3301->3301/tcp
```

---

#### `docker compose exec`

**功能**：在运行中的容器内执行命令

```bash
# 进入容器 Shell
docker compose exec generate-seal /bin/bash

# 执行单个命令
docker compose exec generate-seal ls -la /app

# 以特定用户执行
docker compose exec -u root generate-seal apt-get update

# 不分配 TTY（脚本中使用）
docker compose exec -T generate-seal node -v
```

**参数说明**：
- `-u` / `--user`：指定用户
- `-T`：不分配伪终端（适合脚本）
- `-e`：设置环境变量

**使用场景**：
- ✅ 调试容器内环境
- ✅ 手动执行维护任务
- ✅ 检查文件或配置

---

#### `docker compose run`

**功能**：运行一次性命令（创建新容器）

```bash
# 运行一次性命令
docker compose run generate-seal npm test

# 不启动关联服务
docker compose run --no-deps generate-seal npm test

# 运行后自动删除容器
docker compose run --rm generate-seal node -v
```

**区别**：
- `exec`：在运行中的容器内执行
- `run`：创建新容器执行（即使服务已启动）

---

### 6. 镜像管理命令

#### `docker compose images`

**功能**：列出所有服务使用的镜像

```bash
docker compose images
```

#### `docker compose pull`

**功能**：拉取服务镜像（不构建本地 Dockerfile）

```bash
# 拉取所有镜像
docker compose pull

# 拉取特定服务镜像
docker compose pull generate-seal
```

---

### 7. 其他实用命令

#### `docker compose config`

**功能**：验证并查看 docker-compose.yml 配置

```bash
# 验证配置文件
docker compose config

# 只显示服务名称
docker compose config --services

# 查看特定服务配置
docker compose config --services generate-seal
```

#### `docker compose top`

**功能**：查看容器内运行的进程

```bash
docker compose top
```

#### `docker compose port`

**功能**：查看端口映射

```bash
# 查看服务的端口映射
docker compose port generate-seal 3301
```

## 🚀 完整操作流程

### 流程 1：首次部署

```bash
# 1. 进入项目目录
cd /path/to/generate-seal

# 2. 构建镜像
docker compose build --no-cache

# 3. 启动服务（后台运行）
docker compose up -d

# 4. 查看日志确认启动成功
docker compose logs -f

# 5. 验证服务
curl http://localhost:3301/health
```

---

### 流程 2：代码更新后重新部署

```bash
# 1. 停止并删除旧容器
docker compose down

# 2. 快速构建（利用缓存）
docker compose build

# 3. 启动新容器
docker compose up -d

# 4. 查看日志
docker compose logs -f
```

---

### 流程 3：Dockerfile 修改后重新部署

```bash
# 1. 停止服务
docker compose down

# 2. 完全重新构建（不使用缓存）
docker compose build --no-cache

# 3. 启动服务
docker compose up -d

# 4. 检查日志
docker compose logs -f generate-seal
```

---

### 流程 4：快速重启（不重新构建）

```bash
# 方法 1：使用 restart
docker compose restart

# 方法 2：使用 down + up
docker compose down && docker compose up -d
```

---

### 流程 5：进入容器调试

```bash
# 1. 进入容器
docker compose exec generate-seal /bin/bash

# 2. 在容器内执行诊断命令
ls -la /app/font/
locale
fc-list | grep "宋体"

# 3. 退出容器
exit

# 4. 查看实时日志
docker compose logs -f
```

---

### 流程 6：清理环境

```bash
# 1. 停止并删除容器和网络
docker compose down

# 2. 删除未使用的镜像（可选）
docker image prune -a

# 3. 删除未使用的卷（可选，会删除数据！）
docker volume prune

# 4. 一键清理所有未使用资源
docker system prune -a --volumes
```

## 📋 常见场景

### 场景 1：只看最新日志

```bash
# 只看最后 50 行，实时跟踪
docker compose logs -f --tail=50
```

### 场景 2：服务无响应，需要重启

```bash
# 快速重启
docker compose restart generate-seal
```

### 场景 3：修改了代码，快速测试

```bash
# 重新构建并启动
docker compose up -d --build
```

### 场景 4：检查容器资源占用

```bash
# 查看进程
docker compose top

# 查看资源使用情况（需要 Docker CLI）
docker stats generate-seal
```

### 场景 5：导出容器日志到文件

```bash
# 导出所有日志
docker compose logs > logs.txt

# 导出特定服务日志
docker compose logs generate-seal > seal-logs.txt
```

### 场景 6：清理旧镜像释放空间

```bash
# 查看镜像占用
docker images

# 删除未使用的镜像
docker image prune -a

# 查看磁盘使用
docker system df
```

## 🔧 故障排查

### 问题 1：容器启动失败

```bash
# 1. 查看详细日志
docker compose logs generate-seal

# 2. 查看容器状态
docker compose ps

# 3. 进入容器调试（如果容器在运行）
docker compose exec generate-seal /bin/bash

# 4. 检查配置文件
docker compose config
```

### 问题 2：端口被占用

```bash
# 查看端口占用
lsof -i :3301  # macOS/Linux
netstat -ano | findstr :3301  # Windows

# 修改 docker-compose.yml 中的端口映射
# ports:
#   - "3302:3301"  # 使用其他主机端口
```

### 问题 3：镜像构建失败

```bash
# 1. 清理构建缓存
docker builder prune

# 2. 完全重新构建
docker compose build --no-cache --pull

# 3. 检查 Dockerfile 语法
docker compose config
```

### 问题 4：容器无法访问网络

```bash
# 1. 检查容器网络
docker network ls

# 2. 查看容器详细信息
docker inspect generate-seal

# 3. 重新创建网络
docker compose down
docker compose up -d
```

### 问题 5：卷数据丢失

```bash
# 查看卷列表
docker volume ls

# 检查卷内容
docker run --rm -v VOLUME_NAME:/data alpine ls -la /data

# 备份卷数据
docker run --rm -v VOLUME_NAME:/data -v $(pwd):/backup \
  alpine tar czf /backup/backup.tar.gz -C /data .
```

## ✨ 最佳实践

### 1. 开发环境

```bash
# 使用 --build 确保使用最新代码
docker compose up -d --build

# 实时查看日志
docker compose logs -f

# 开发完成后清理
docker compose down
```

### 2. 生产环境

```bash
# 使用 --no-cache 确保干净构建
docker compose build --no-cache

# 后台运行，自动重启
# 在 docker-compose.yml 中配置: restart: unless-stopped

# 定期备份数据卷
docker run --rm -v DATA_VOLUME:/data -v $(pwd):/backup \
  alpine tar czf /backup/backup-$(date +%Y%m%d).tar.gz -C /data .

# 监控日志
docker compose logs -f --tail=100 > /var/log/generate-seal.log
```

### 3. 性能优化

```bash
# 使用多阶段构建减小镜像大小
# 参考 Dockerfile 中的最佳实践

# 利用 .dockerignore 排除无关文件
# 减少构建上下文大小

# 合理使用构建缓存
# 将不常变化的指令放在前面
```

### 4. 安全建议

```bash
# 不要在镜像中包含敏感信息
# 使用环境变量或 secrets

# 定期更新基础镜像
docker compose build --pull --no-cache

# 使用非 root 用户运行容器
# 在 Dockerfile 中添加：USER node

# 扫描镜像漏洞
docker scout quickview generate-seal
```

## 📊 命令速查表

| 操作 | 命令 | 说明 |
|-----|------|------|
| 构建镜像 | `docker compose build` | 使用缓存构建 |
| 强制重新构建 | `docker compose build --no-cache` | 不使用缓存 |
| 启动服务 | `docker compose up -d` | 后台运行 |
| 停止服务 | `docker compose down` | 停止并删除 |
| 重启服务 | `docker compose restart` | 快速重启 |
| 查看日志 | `docker compose logs -f` | 实时跟踪 |
| 查看状态 | `docker compose ps` | 服务状态 |
| 进入容器 | `docker compose exec generate-seal bash` | 交互式 Shell |
| 验证配置 | `docker compose config` | 检查配置文件 |

## 🔗 相关资源

- [Docker Compose 官方文档](https://docs.docker.com/compose/)
- [Dockerfile 最佳实践](https://docs.docker.com/develop/dev-best-practices/)
- [Docker CLI 命令参考](https://docs.docker.com/engine/reference/commandline/cli/)

---

**文档版本**: v1.0  
**更新日期**: 2026-02-11  
**适用版本**: Docker Compose V2+
