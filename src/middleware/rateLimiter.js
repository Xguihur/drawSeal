/**
 * 队列限流中间件
 *
 * 参数依据：
 *   - 当前单进程 QPS 上限 ≈ 127
 *   - 上游超时时间 10s
 *
 * 设计：
 *   MAX_CONCURRENT = 25      同时处理上限（约 QPS 的 1/5）
 *   MAX_QUEUE_SIZE = 1270    队列长度 = 127 QPS × 10s
 */

const MAX_CONCURRENT = 25;
const MAX_QUEUE_SIZE = 1270;

let running = 0;
const queue = [];

function next() {
  if (queue.length === 0 || running >= MAX_CONCURRENT) return;

  const { req, res, proceed } = queue.shift();

  // 请求在队列里等待时，连接可能已断开
  if (res.writableEnded) {
    next();
    return;
  }

  running++;
  res.on('finish', release);
  res.on('close', release);
  proceed();
}

function release() {
  running = Math.max(0, running - 1);
  next();
}

export function rateLimiter(req, res, nextMiddleware) {
  // 有空位，直接放行
  if (running < MAX_CONCURRENT) {
    running++;
    res.on('finish', release);
    res.on('close', release);
    nextMiddleware();
    return;
  }

  // 队列已满，快速失败
  if (queue.length >= MAX_QUEUE_SIZE) {
    return res.status(503).json({
      success: false,
      error: '服务繁忙，请稍后重试',
      retryAfter: 5,
    });
  }

  // 入队等待
  queue.push({ req, res, proceed: nextMiddleware });
}

/** 用于健康检查接口暴露当前队列状态 */
export function getQueueStatus() {
  return {
    running,
    queued: queue.length,
    maxConcurrent: MAX_CONCURRENT,
    maxQueueSize: MAX_QUEUE_SIZE,
  };
}
