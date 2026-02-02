import { fabric } from 'fabric'

/**
 * 印章生成器
 * 使用 Fabric.js 在 Canvas 上绘制公章
 */

/**
 * 生成五角星路径点
 * @param {number} outerRadius - 外半径
 * @param {number} innerRadius - 内半径
 * @param {number} centerX - 中心X坐标
 * @param {number} centerY - 中心Y坐标
 * @returns {Array} 路径点数组
 */
function getStarPoints(outerRadius, innerRadius, centerX, centerY) {
  const points = []
  const step = Math.PI / 5 // 36度

  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = step * i - Math.PI / 2 // 从顶部开始
    points.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    })
  }
  return points
}

/**
 * 创建五角星对象
 * @param {Object} options - 配置项
 * @returns {fabric.Polygon} 五角星对象
 */
function createStar(options) {
  const { size, color, centerX, centerY } = options
  const outerRadius = size / 2
  const innerRadius = outerRadius * 0.382 // 黄金比例
  const points = getStarPoints(outerRadius, innerRadius, 0, 0)

  return new fabric.Polygon(points, {
    left: centerX,
    top: centerY,
    fill: color,
    originX: 'center',
    originY: 'center',
    selectable: false,
    evented: false,
  })
}

/**
 * 绘制弧形文字
 * @param {fabric.Canvas} canvas - Canvas 对象
 * @param {Object} options - 配置项
 */
function drawCircularText(canvas, options) {
  const {
    text,
    centerX,
    centerY,
    radius,
    startAngle,
    endAngle,
    fontSize,
    fontFamily,
    color,
    charSpacing = 0,
  } = options

  if (!text || text.length === 0) return

  const chars = text.split('')
  const totalAngle = endAngle - startAngle
  
  // 计算每个字符之间的角度间隔
  const angleStep = chars.length > 1 
    ? (totalAngle - charSpacing * (chars.length - 1)) / (chars.length - 1)
    : 0

  chars.forEach((char, index) => {
    // 计算当前字符的角度（从起始角度开始）
    const angle = startAngle + index * (angleStep + charSpacing)
    const radian = (angle * Math.PI) / 180

    // 计算字符位置
    const x = centerX + radius * Math.cos(radian)
    const y = centerY + radius * Math.sin(radian)

    // 创建文字对象
    const textObj = new fabric.Text(char, {
      left: x,
      top: y,
      fontSize: fontSize,
      fontFamily: fontFamily,
      fill: color,
      originX: 'center',
      originY: 'center',
      angle: angle + 90, // 文字旋转，使其垂直于半径
      selectable: false,
      evented: false,
    })

    canvas.add(textObj)
  })
}

/**
 * 绘制底部水平文字
 * @param {fabric.Canvas} canvas - Canvas 对象  
 * @param {Object} options - 配置项
 */
function drawBottomText(canvas, options) {
  const { text, centerX, centerY, fontSize, fontFamily, color } = options

  if (!text) return

  const textObj = new fabric.Text(text, {
    left: centerX,
    top: centerY,
    fontSize: fontSize,
    fontFamily: fontFamily,
    fill: color,
    originX: 'center',
    originY: 'center',
    selectable: false,
    evented: false,
  })

  canvas.add(textObj)
}

/**
 * 生成公章
 * @param {fabric.Canvas} canvas - Fabric Canvas 对象
 * @param {Object} config - 印章配置
 */
export function generateSeal(canvas, config) {
  // 清空画布
  canvas.clear()
  canvas.backgroundColor = 'transparent'

  const {
    diameter,
    borderWidth,
    color,
    companyName,
    companyFontSize,
    companyFontFamily,
    companyCharSpacing,
    companyStartAngle,
    companyEndAngle,
    bottomText,
    bottomFontSize,
    centerType,
    starSize,
    centerText,
    centerFontSize,
  } = config

  const centerX = diameter / 2
  const centerY = diameter / 2
  const radius = (diameter - borderWidth) / 2

  // 1. 绘制外圈边框
  const outerCircle = new fabric.Circle({
    left: centerX,
    top: centerY,
    radius: radius,
    fill: 'transparent',
    stroke: color,
    strokeWidth: borderWidth,
    originX: 'center',
    originY: 'center',
    selectable: false,
    evented: false,
  })
  canvas.add(outerCircle)

  // 2. 绘制内圈边框（可选，公章通常有内圈）
  const innerCircle = new fabric.Circle({
    left: centerX,
    top: centerY,
    radius: radius - 14,
    fill: 'transparent',
    stroke: color,
    strokeWidth: 1,
    originX: 'center',
    originY: 'center',
    selectable: false,
    evented: false,
  })
  canvas.add(innerCircle)

  // 3. 绘制公司名称（弧形文字）
  drawCircularText(canvas, {
    text: companyName,
    centerX,
    centerY,
    radius: radius - 28,
    startAngle: companyStartAngle,
    endAngle: companyEndAngle,
    fontSize: companyFontSize,
    fontFamily: companyFontFamily,
    color,
    charSpacing: companyCharSpacing,
  })

  // 4. 绘制中心图案
  if (centerType === 'star') {
    const star = createStar({
      size: starSize,
      color,
      centerX,
      centerY,
    })
    canvas.add(star)
  } else if (centerType === 'text') {
    const centerTextObj = new fabric.Text(centerText || '印', {
      left: centerX,
      top: centerY,
      fontSize: centerFontSize,
      fontFamily: companyFontFamily,
      fill: color,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    })
    canvas.add(centerTextObj)
  }

  // 5. 绘制底部文字（编号）
  if (bottomText) {
    drawBottomText(canvas, {
      text: bottomText,
      centerX,
      centerY: centerY + radius - 35,
      fontSize: bottomFontSize,
      fontFamily: companyFontFamily,
      color,
    })
  }

  canvas.renderAll()
}

/**
 * 导出印章为 PNG
 * @param {fabric.Canvas} canvas - Fabric Canvas 对象
 * @param {number} scale - 导出倍数
 * @returns {string} Base64 图片数据
 */
export function exportSealAsPNG(canvas, scale = 2) {
  return canvas.toDataURL({
    format: 'png',
    quality: 1,
    multiplier: scale,
  })
}
