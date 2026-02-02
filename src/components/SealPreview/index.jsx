import { useEffect, useRef, useState } from 'react'
import { Button, Space, Card, Switch, message } from 'antd'
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons'
import { fabric } from 'fabric'
import { saveAs } from 'file-saver'
import { generateSeal, exportSealAsPNG } from '../../utils/sealGenerator'
import './index.css'

/**
 * 印章预览组件
 */
function SealPreview({ config }) {
  const canvasRef = useRef(null)
  const fabricCanvasRef = useRef(null)
  const [showBackground, setShowBackground] = useState(true)

  // 初始化 Fabric Canvas
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        width: config.diameter,
        height: config.diameter,
        selection: false,
      })
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose()
        fabricCanvasRef.current = null
      }
    }
  }, [])

  // 当配置变化时重新绘制印章
  useEffect(() => {
    if (fabricCanvasRef.current) {
      // 调整画布尺寸
      fabricCanvasRef.current.setWidth(config.diameter)
      fabricCanvasRef.current.setHeight(config.diameter)
      
      // 生成印章
      generateSeal(fabricCanvasRef.current, config)
    }
  }, [config])

  // 导出 PNG
  const handleExport = () => {
    if (!fabricCanvasRef.current) {
      message.error('画布未初始化')
      return
    }

    try {
      const dataURL = exportSealAsPNG(fabricCanvasRef.current, config.exportScale)
      
      // 将 base64 转为 blob
      const byteString = atob(dataURL.split(',')[1])
      const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      const blob = new Blob([ab], { type: mimeString })
      
      // 生成文件名
      const timestamp = new Date().getTime()
      const fileName = `seal_${timestamp}.png`
      
      // 下载文件
      saveAs(blob, fileName)
      message.success('印章导出成功')
    } catch (error) {
      console.error('导出失败:', error)
      message.error('导出失败，请重试')
    }
  }

  // 刷新预览
  const handleRefresh = () => {
    if (fabricCanvasRef.current) {
      generateSeal(fabricCanvasRef.current, config)
      message.success('刷新成功')
    }
  }

  return (
    <div className="seal-preview">
      <Card 
        title="印章预览" 
        size="small"
        extra={
          <Space>
            <span className="bg-toggle-label">显示背景</span>
            <Switch 
              size="small"
              checked={showBackground} 
              onChange={setShowBackground}
            />
          </Space>
        }
        className="preview-card"
      >
        <div 
          className={`canvas-wrapper ${showBackground ? 'with-background' : ''}`}
          style={{ 
            width: config.diameter + 40, 
            height: config.diameter + 40 
          }}
        >
          <canvas ref={canvasRef} />
        </div>
      </Card>

      <div className="preview-info">
        <p>尺寸: {config.diameter} x {config.diameter} px</p>
        <p>导出尺寸: {config.diameter * config.exportScale} x {config.diameter * config.exportScale} px</p>
      </div>

      <Space className="preview-actions">
        <Button 
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
        >
          刷新预览
        </Button>
        <Button 
          type="primary" 
          icon={<DownloadOutlined />}
          onClick={handleExport}
        >
          导出 PNG
        </Button>
      </Space>
    </div>
  )
}

export default SealPreview
