import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 注册字体
const fontPath = path.join(__dirname, 'font/长城大标宋体.TTF');
GlobalFonts.registerFromPath(fontPath, 'ChangChengDaBiaoSong');

// 测试绘制
const canvas = createCanvas(600, 400);
const ctx = canvas.getContext('2d');

// 白色背景
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, 600, 400);

// 测试1: 使用系统字体绘制中文
ctx.fillStyle = 'blue';
ctx.font = '36px Arial';
ctx.fillText('Arial: 测试中文', 20, 50);

// 测试2: 使用注册的长城字体
ctx.fillStyle = 'red';
ctx.font = '36px "ChangChengDaBiaoSong"';
ctx.fillText('长城字体: 测试中文', 20, 100);

// 测试3: 使用 Heiti TC (系统中文字体)
ctx.fillStyle = 'green';
ctx.font = '36px "Heiti TC"';
ctx.fillText('Heiti TC: 测试中文', 20, 150);

// 测试4: 使用 Hiragino Sans GB
ctx.fillStyle = 'purple';
ctx.font = '36px "Hiragino Sans GB"';
ctx.fillText('Hiragino: 测试中文', 20, 200);

// 测试5: 测试英文字符
ctx.fillStyle = 'black';
ctx.font = '36px "ChangChengDaBiaoSong"';
ctx.fillText('ChangCheng: ABC 123', 20, 250);

// 测试6: 使用 font-family 备选
ctx.fillStyle = 'orange';
ctx.font = '36px "ChangChengDaBiaoSong", "Heiti TC", sans-serif';
ctx.fillText('备选字体: 测试中文 ABC', 20, 300);

// 测试7: 检查 ctx.font 实际值
console.log('测试字体设置:');
ctx.font = '36px "ChangChengDaBiaoSong"';
console.log('  设置后的 ctx.font:', ctx.font);
ctx.font = '36px "Heiti TC"';
console.log('  Heiti TC 的 ctx.font:', ctx.font);
ctx.font = '36px "不存在的字体"';
console.log('  不存在字体的 ctx.font:', ctx.font);

// 保存测试图片
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, 'font-test-output2.png'), buffer);
console.log('\n测试图片已保存到 font-test-output2.png');
