import { createCanvas, registerFont } from 'canvas';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { generateRandomCode } from '../utils/provinceCode.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 新字体：方正大标宋简体
const fontPath = path.join(__dirname, '../font/宋体.TTC');
// const fontPath = path.join(__dirname, '../font/方正大标宋简体.TTF');
const FONT_FAMILY = '宋体';

if (!fs.existsSync(fontPath)) {
} else {
  try {
    registerFont(fontPath, { family: FONT_FAMILY });
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
 * 计算文字弧度和字体大小
 * @param {number} charCount - 字符数量
 * @param {number} baseFontSize - 基准字体大小
 * @returns {Object} { totalArc, fontSize, startAngle }
 */
function calculateArcParams(charCount, baseFontSize) {
  // 配置参数
  const FIXED_ARC_DEGREE = 240; // 固定弧度（度）
  const BASE_CHAR_COUNT = 12; // 基准字数，超过此值开始缩小字体
  const MIN_FONT_SCALE = 0.6; // 最小字体缩放比例

  // 转换为弧度
  const toRadian = (degree) => (degree * Math.PI) / 180;

  // 使用固定弧度
  let actualArcDegree = FIXED_ARC_DEGREE;

  // 3. 计算字体缩放
  let fontScale = 1;
  if (charCount > BASE_CHAR_COUNT) {
    // 超过基准字数，字体按比例缩小
    fontScale = BASE_CHAR_COUNT / charCount;
    // 限制最小缩放比例
    fontScale = Math.max(MIN_FONT_SCALE, fontScale);
  }

  // 4. 计算起始角度（使文字居中对称分布在顶部）
  // 弧度的中心点在顶部（-90度 = -PI/2）
  const totalArc = toRadian(actualArcDegree);
  const startAngle = -Math.PI / 2 - totalArc / 2; // 从左侧开始

  return {
    totalArc,
    fontSize: baseFontSize * fontScale,
    startAngle,
  };
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
  
  // 动态计算弧度和字体大小
  const { totalArc, fontSize: adjustedFontSize, startAngle } = calculateArcParams(charCount, fontSize);
  
  ctx.font = `${adjustedFontSize}px "${FONT_FAMILY}"`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

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
    // 字高拉伸为 155%
    ctx.scale(1, 1.55);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });
}

/**
 * 在印章底部沿圆弧绘制编码（环形排列）
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {string} code - 编码内容
 * @param {number} cx - 圆心 x 坐标
 * @param {number} cy - 圆心 y 坐标
 * @param {number} radius - 印章半径
 * @param {number} fontSize - 字体大小
 * @param {string} color - 颜色
 */
function drawBottomCode(ctx, code, cx, cy, radius, fontSize, color) {
  if (!code) return;

  const chars = code.split('');
  const charCount = chars.length;
  if (charCount === 0) return;

  // 编码所在圆弧的半径（紧贴边框内侧）
  const codeRadius = radius - fontSize * 1;

  // 底部编码占据的总弧度（根据字符数自适应，13-14位大约80-90度）
  const totalArcDegree = Math.min(80, charCount * 6.5);
  const totalArc = (totalArcDegree * Math.PI) / 180;

  // 起始角度：以底部中心（PI/2 即 90度）为对称中心
  // 底部编码从左到右阅读，角度从左侧到右侧
  const startAngle = Math.PI / 2 + totalArc / 2; // 左侧起点
  const angleStep = charCount > 1 ? totalArc / (charCount - 1) : 0;

  ctx.font = `${fontSize}px "${FONT_FAMILY}"`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  chars.forEach((char, index) => {
    // 底部编码从左到右排列，角度递减（顺时针从左到右）
    const angle = startAngle - angleStep * index;

    const x = cx + codeRadius * Math.cos(angle);
    const y = cy + codeRadius * Math.sin(angle);

    ctx.save();
    ctx.translate(x, y);
    // 文字旋转：底部文字朝外可读，需要旋转 angle - PI/2
    ctx.rotate(angle - Math.PI / 2);
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
 * @param {string} [options.code='2024010112345'] - 底部编码（13-14位）
 * @param {number} [options.codeFontSize=14] - 编码字体大小
 * @returns {Buffer} PNG 图片 Buffer
 */
export function generateSeal(options) {
  const {
    name,
    fontSize = 36,
    size = 300,
    color = '#f03618',
    borderWidth = 6,
    starSize = 50,
    code, // 编码：用户传入则使用，未传入则根据公司名称自动生成
    codeFontSize = 14,
  } = options;

  // 如果用户未传入 code，则根据公司名称自动匹配省份/城市生成编码
  // 匹配不到时返回空字符串，底部编码区域将不显示
  const finalCode = code !== undefined ? code : generateRandomCode(name);

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
  const textRadius = radius - fontSize * 1;
  const scaledFontSize = fontSize;
  drawTextOnArc(ctx, name, cx, cy, textRadius, scaledFontSize, color);

  // 4. 绘制底部编码
  if (finalCode) {
    drawBottomCode(ctx, finalCode, cx, cy, radius, codeFontSize, color);
  }

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
