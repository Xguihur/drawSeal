import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 注册字体
const fontPath = path.join(__dirname, 'font/长城大标宋体.TTF');

console.log('字体文件路径:', fontPath);
console.log('字体文件是否存在:', fs.existsSync(fontPath));

// 注册前查看已有字体
console.log('\n注册前字体数量:', GlobalFonts.families.length);

// 注册字体
const registered = GlobalFonts.registerFromPath(fontPath, 'ChangChengDaBiaoSong');
console.log('注册结果:', registered);

// 注册后查看已有字体
console.log('注册后字体数量:', GlobalFonts.families.length);

// 查找包含 ChangCheng 的字体
const allFamilies = GlobalFonts.families;
const changchengFont = allFamilies.find(f => 
  f.family.toLowerCase().includes('changcheng') || 
  f.family.includes('长城') ||
  f.family.includes('ChangCheng')
);
console.log('\n找到的长城字体:', changchengFont);

// 打印最后几个注册的字体（可能是我们刚注册的）
console.log('\n最后5个已注册字体:');
allFamilies.slice(-5).forEach(f => console.log(' -', f.family));

// 测试绘制
const canvas = createCanvas(400, 200);
const ctx = canvas.getContext('2d');

// 白色背景
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, 400, 200);

// 尝试使用注册的字体名称
ctx.fillStyle = 'red';
ctx.font = '36px "ChangChengDaBiaoSong"';
console.log('\n设置的字体:', ctx.font);
ctx.fillText('测试中文字体', 50, 80);

// 再试一下不带引号
ctx.font = '36px ChangChengDaBiaoSong';
console.log('设置的字体(无引号):', ctx.font);
ctx.fillText('不带引号测试', 50, 140);

// 保存测试图片
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, 'font-test-output.png'), buffer);
console.log('\n测试图片已保存到 font-test-output.png');
