import express from 'express';
import { generateSeal, generateSealBase64 } from './sealGenerator.js';

const app = express();
const PORT = process.env.PORT || 3301;

// 解析 JSON 请求体
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '印章生成服务运行中' });
});

/**
 * GET /api/seal
 * 通过 URL 参数生成印章，直接返回 PNG 图片
 * 
 * Query Parameters:
 * - name: 印章名称（必填）
 * - fontSize: 字号（可选，默认 36）
 * - size: 印章尺寸（可选，默认 300）
 * - color: 颜色（可选，默认 #f03618）
 * - borderWidth: 边框宽度（可选，默认 6）
 * - starSize: 五角星大小（可选，默认 50）
 */
app.get('/api/seal', (req, res) => {
  try {
    const { name, fontSize, size, color, borderWidth, starSize } = req.query;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: '缺少必填参数: name (印章名称)'
      });
    }
    
    const options = {
      name: decodeURIComponent(name),
      fontSize: fontSize ? parseInt(fontSize, 10) : undefined,
      size: size ? parseInt(size, 10) : undefined,
      color: color ? decodeURIComponent(color) : undefined,
      borderWidth: borderWidth ? parseInt(borderWidth, 10) : undefined,
      starSize: starSize ? parseInt(starSize, 10) : undefined,
    };
    
    // 过滤掉 undefined 值
    Object.keys(options).forEach(key => {
      if (options[key] === undefined) {
        delete options[key];
      }
    });
    
    const buffer = generateSeal(options);
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="seal.png"`);
    res.send(buffer);
    
  } catch (error) {
    console.error('生成印章失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/seal
 * 通过 JSON Body 生成印章，返回 Base64 编码的图片
 *
 * Request Body:
 * {
 *   "name": "公司名称",    // 必填
 *   "fontSize": 36,        // 可选
 *   "size": 300,           // 可选
  *   "color": "#f03618",    // 可选
 *   "borderWidth": 6,      // 可选
 *   "starSize": 50         // 可选
 * }
 */
app.post('/api/seal', (req, res) => {
  try {
    const { name, fontSize, size, color, borderWidth, starSize } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: '缺少必填参数: name (印章名称)'
      });
    }

    const options = {
      name,
      fontSize,
      size,
      color,
      borderWidth,
      starSize,
    };

    // 过滤掉 undefined 和 null 值
    Object.keys(options).forEach(key => {
      if (options[key] === undefined || options[key] === null) {
        delete options[key];
      }
    });

    const base64 = generateSealBase64(options);

    res.json({
      success: true,
      data: {
        image: `data:image/png;base64,${base64}`,
        config: options
      }
    });

  } catch (error) {
    console.error('生成印章失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/seal/download
 * 通过 JSON Body 生成印章，直接下载 PNG 文件
 */
app.post('/api/seal/download', (req, res) => {
  try {
    const { name, fontSize, size, color, borderWidth, starSize, filename } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: '缺少必填参数: name (印章名称)'
      });
    }

    const options = {
      name,
      fontSize,
      size,
      color,
      borderWidth,
      starSize,
    };

    // 过滤掉 undefined 和 null 值
    Object.keys(options).forEach(key => {
      if (options[key] === undefined || options[key] === null) {
        delete options[key];
      }
    });

    const buffer = generateSeal(options);
    const downloadFilename = filename || `seal_${Date.now()}.png`;

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadFilename)}"`);
    res.send(buffer);

  } catch (error) {
    console.error('生成印章失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║          印章生成器 API 服务已启动              ║
╠════════════════════════════════════════════════╣
║  服务地址: http://localhost:${PORT}               ║
╠════════════════════════════════════════════════╣
║  接口列表:                                      ║
║  • GET  /health           - 健康检查            ║
║  • GET  /api/seal         - 生成印章 (返回图片)  ║
║  • POST /api/seal         - 生成印章 (返回Base64)║
║  • POST /api/seal/download - 下载印章           ║
╠════════════════════════════════════════════════╣
║  示例:                                          ║
║  GET /api/seal?name=某某公司&fontSize=36        ║
╚════════════════════════════════════════════════╝
  `);
});
