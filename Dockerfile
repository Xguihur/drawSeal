# 使用 Node.js 官方镜像（基于 Debian）
FROM docker.1ms.run/library/node:20-slim

# 设置工作目录
WORKDIR /app

# 安装 canvas 相关的系统依赖、中文支持和 curl（用于健康检查）
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libpixman-1-dev \
    pkg-config \
    python3 \
    curl \
    locales \
    fontconfig \
    fonts-wqy-zenhei \
    && rm -rf /var/lib/apt/lists/*

# 配置 UTF-8 locale（解决中文乱码）
RUN sed -i 's/^# *zh_CN.UTF-8/zh_CN.UTF-8/' /etc/locale.gen && \
    locale-gen zh_CN.UTF-8 && \
    update-locale LANG=zh_CN.UTF-8

# 设置 locale 环境变量
ENV LANG=zh_CN.UTF-8 \
    LC_ALL=zh_CN.UTF-8 \
    LANGUAGE=zh_CN:zh

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码、工具类和字体
COPY src/ ./src/
COPY utils/ ./utils/
COPY font/ ./font/

# 暴露端口
EXPOSE 3301

# 刷新字体缓存（确保自定义字体被识别）
RUN fc-cache -fv

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3301

# 启动应用
CMD ["npm", "start"]
