import { createCanvas, registerFont } from 'canvas';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 注册字体（使用 node-canvas 的 Cairo 引擎，对老字体兼容性更好）
const fontPath = path.join(__dirname, '../font/长城大标宋体.TTF');
const FONT_FAMILY = 'ChangChengDaBiaoSong';

if (!fs.existsSync(fontPath)) {
  console.error('字体文件不存在:', fontPath);
} else {
  try {
    registerFont(fontPath, { family: FONT_FAMILY });
    console.log('字体注册成功:', FONT_FAMILY);
  } catch (err) {
    console.error('字体注册失败:', err.message);
  }
}

/**
 * 绘制五角星
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {number} cx - 中心点 x 坐标
 * @param {number} cy - 中心点 y 坐标
 * @param {number} outerRadius - 外半径
 * @param {string} color - 颜色
 */
function drawStar(ctx, cx, cy, outerRadius, color) {
  const innerRadius = outerRadius * 0.382; // 黄金比例
  const points = 5;
  
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    // 从顶部开始绘制（-90度）
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * 沿圆弧绘制文字
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {string} text - 文字内容
 * @param {number} cx - 圆心 x 坐标
 * @param {number} cy - 圆心 y 坐标
 * @param {number} radius - 文字所在圆的半径
 * @param {number} fontSize - 字体大小
 * @param {string} color - 颜色
 */
function drawTextOnArc(ctx, text, cx, cy, radius, fontSize, color) {
  const chars = text.split('');
  const charCount = chars.length;
  
  if (charCount === 0) return;
  
  ctx.font = `${fontSize}px "${FONT_FAMILY}"`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // 计算文字占据的弧度，留出底部空白
  // 文字从左上方开始，到右上方结束，底部留空给五角星下方区域
  const totalArc = Math.PI * 1.4; // 约 252 度
  const startAngle = Math.PI * 0.8; // 从左下方开始（约 144 度）
  
  // 字符间的角度间隔
  const angleStep = charCount > 1 ? totalArc / (charCount - 1) : 0;
  
  chars.forEach((char, index) => {
    // 计算当前字符的角度位置
    const angle = startAngle + angleStep * index;
    
    // 计算字符位置
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    
    ctx.save();
    ctx.translate(x, y);
    // 旋转文字，使其垂直于半径方向（指向圆心）
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });
}

/**
 * 生成印章图片
 * @param {Object} options - 配置选项
 * @param {string} options.name - 印章名称
 * @param {number} [options.fontSize=36] - 文字字号
 * @param {number} [options.size=300] - 印章尺寸（直径）
 * @param {string} [options.color='#CC0000'] - 印章颜色
 * @param {number} [options.borderWidth=6] - 边框宽度
 * @param {number} [options.starSize=50] - 五角星大小
 * @returns {Buffer} PNG 图片 Buffer
 */
export function generateSeal(options) {
  const {
    name,
    fontSize = 36,
    size = 300,
    color = '#CC0000',
    borderWidth = 6,
    starSize = 50,
  } = options;
  
  if (!name || typeof name !== 'string') {
    throw new Error('印章名称不能为空');
  }
  
  // 创建 Canvas，使用 2 倍尺寸以获得高清输出
  const scale = 2;
  const canvasSize = size * scale;
  const canvas = createCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext('2d');
  
  // 缩放上下文
  ctx.scale(scale, scale);
  
  const cx = size / 2; // 圆心 x
  const cy = size / 2; // 圆心 y
  const radius = (size - borderWidth) / 2; // 圆半径
  
  // 1. 绘制圆形边框
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = borderWidth;
  ctx.stroke();
  
  // 2. 绘制中心五角星
  const scaledStarSize = starSize;
  drawStar(ctx, cx, cy, scaledStarSize, color);
  
  // 3. 绘制环形文字
  // 文字半径略小于边框，留出内边距
  const textRadius = radius - fontSize * 0.8;
  const scaledFontSize = fontSize;
  drawTextOnArc(ctx, name, cx, cy, textRadius, scaledFontSize, color);
  
  // 导出为 PNG Buffer
  return canvas.toBuffer('image/png');
}

/**
 * 生成印章并返回 Base64 字符串
 * @param {Object} options - 配置选项（同 generateSeal）
 * @returns {string} Base64 编码的 PNG 图片
 */
export function generateSealBase64(options) {
  const buffer = generateSeal(options);
  return buffer.toString('base64');
}
