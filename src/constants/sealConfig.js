/**
 * 印章默认配置
 */
export const DEFAULT_SEAL_CONFIG = {
  // 基础信息
  type: 'circle', // 印章类型：circle 圆形公章

  // 尺寸配置
  diameter: 200, // 直径（px）
  borderWidth: 4, // 边框宽度（px）

  // 颜色
  color: '#CC0000', // 印章红色

  // 外圈文字（公司名称）
  companyName: '某某科技有限公司', // 公司名称
  companyFontSize: 20, // 字体大小
  companyFontFamily: '宋体', // 字体
  companyCharSpacing: 4, // 字间距（度数）
  companyStartAngle: 225, // 起始角度（从左上开始）
  companyEndAngle: 315, // 结束角度（到右上结束）

  // 底部文字（编号等）
  bottomText: '123456789', // 底部文字
  bottomFontSize: 12, // 字体大小

  // 中心图案
  centerType: 'star', // 'star' 五角星 | 'text' 文字
  starSize: 35, // 五角星大小
  starRotation: 0, // 五角星旋转角度
  centerText: '印', // 中心文字（如果选择文字类型）
  centerFontSize: 40, // 中心文字大小

  // 导出配置
  exportScale: 2, // 导出倍数（高清）
}

/**
 * 字体选项
 */
export const FONT_OPTIONS = [
  { label: '宋体', value: '宋体, SimSun, serif' },
  { label: '黑体', value: '黑体, SimHei, sans-serif' },
  { label: '楷体', value: '楷体, KaiTi, serif' },
  { label: '仿宋', value: '仿宋, FangSong, serif' },
]

/**
 * 中心图案类型
 */
export const CENTER_TYPE_OPTIONS = [
  { label: '五角星', value: 'star' },
  { label: '文字', value: 'text' },
]
