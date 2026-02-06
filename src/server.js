import express from 'express';
import archiver from 'archiver';
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
    const { name, fontSize, size, color, borderWidth, starSize, code } = req.query;
    
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
      code: code ? decodeURIComponent(code) : undefined,
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
    const { name, fontSize, size, color, borderWidth, starSize, code } = req.body;

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
      code,
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
 * 通过 JSON Body 批量生成印章，打包成 ZIP 下载
 *
 * Request Body:
 * {
 *   "names": ["公司A", "公司B", "公司C"],  // 必填，印章名称数组
 *   "fontSize": 36,        // 可选
 *   "size": 300,           // 可选
 *   "color": "#f03618",    // 可选
 *   "borderWidth": 6,      // 可选
 *   "starSize": 50         // 可选
 * }
 */
app.post('/api/seal/download', (req, res) => {
  try {
    const { names, fontSize, size, color, borderWidth, starSize, code } = req.body;

    // 验证 names 参数
    if (!names || !Array.isArray(names) || names.length === 0) {
      return res.status(400).json({
        success: false,
        error: '缺少必填参数: names (印章名称数组)，且必须是非空数组'
      });
    }

    // 基础配置选项（不包含 name）
    const baseOptions = {
      fontSize,
      size,
      color,
      borderWidth,
      starSize,
      code,
    };

    // 过滤掉 undefined 和 null 值
    Object.keys(baseOptions).forEach(key => {
      if (baseOptions[key] === undefined || baseOptions[key] === null) {
        delete baseOptions[key];
      }
    });

    // 创建 zip 文件
    const archive = archiver('zip', {
      zlib: { level: 9 } // 最高压缩级别
    });

    // 设置响应头
    const timestamp = Date.now();
    const zipFilename = `批量生成章_${timestamp}.zip`;
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(zipFilename)}"`);

    // 将 archive 流导入响应
    archive.pipe(res);

    // 处理 archive 错误
    archive.on('error', (err) => {
      console.error('打包失败:', err);
      throw err;
    });

    // 批量生成印章并添加到 zip
    for (const name of names) {
      const options = {
        ...baseOptions,
        name
      };
      
      const buffer = generateSeal(options);
      const filename = `${name}.png`;
      
      archive.append(buffer, { name: filename });
    }

    // 完成打包
    archive.finalize();

  } catch (error) {
    console.error('批量生成印章失败:', error);
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
║  • POST /api/seal/download - 批量下载印章           ║
╚════════════════════════════════════════════════╝
  `);
});
