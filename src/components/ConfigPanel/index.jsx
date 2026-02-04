import { Card, Form, Input, InputNumber, Select, Slider, Divider, ColorPicker } from 'antd'
import { FONT_OPTIONS, CENTER_TYPE_OPTIONS } from '../../constants/sealConfig'
import './index.css'

/**
 * 印章配置面板组件
 */
function ConfigPanel({ config, onChange }) {
  const handleChange = (field, value) => {
    onChange({ [field]: value })
  }

  const handleColorChange = (color) => {
    onChange({ color: color.toHexString() })
  }

  return (
    <div className="config-panel">
      <Card title="基础配置" size="small" className="config-card">
        <Form layout="vertical" size="small">
          <Form.Item label="印章颜色">
            <ColorPicker
              value={config.color}
              onChange={handleColorChange}
              showText
            />
          </Form.Item>

          <Form.Item label="印章直径">
            <Slider
              min={100}
              max={400}
              value={config.diameter}
              onChange={(v) => handleChange('diameter', v)}
            />
            <InputNumber
              min={100}
              max={400}
              value={config.diameter}
              onChange={(v) => handleChange('diameter', v)}
              addonAfter="px"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="边框宽度">
            <Slider
              min={1}
              max={10}
              value={config.borderWidth}
              onChange={(v) => handleChange('borderWidth', v)}
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title="公司名称" size="small" className="config-card">
        <Form layout="vertical" size="small">
          <Form.Item label="公司名称">
            <Input
              value={config.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="请输入公司名称"
            />
          </Form.Item>

          <Form.Item label="字体">
            <Select
              value={config.companyFontFamily}
              onChange={(v) => handleChange('companyFontFamily', v)}
              options={FONT_OPTIONS}
            />
          </Form.Item>

          <Form.Item label="字体大小">
            <Slider
              min={10}
              max={36}
              value={config.companyFontSize}
              onChange={(v) => handleChange('companyFontSize', v)}
            />
          </Form.Item>

          <Form.Item label="字符间距（角度）">
            <Slider
              min={0}
              max={20}
              step={0.5}
              value={config.companyCharSpacing}
              onChange={(v) => handleChange('companyCharSpacing', v)}
            />
          </Form.Item>

          <Form.Item label="文字起始角度">
            <Slider
              min={120}
              max={270}
              value={config.companyStartAngle}
              onChange={(v) => handleChange('companyStartAngle', v)}
            />
          </Form.Item>

          <Form.Item label="文字结束角度">
            <Slider
              min={270}
              max={420}
              value={config.companyEndAngle}
              onChange={(v) => handleChange('companyEndAngle', v)}
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title="中心图案" size="small" className="config-card">
        <Form layout="vertical" size="small">
          <Form.Item label="图案类型">
            <Select
              value={config.centerType}
              onChange={(v) => handleChange('centerType', v)}
              options={CENTER_TYPE_OPTIONS}
            />
          </Form.Item>

          {config.centerType === 'star' && (
            <>
              <Form.Item label="五角星大小">
                <Slider
                  min={15}
                  max={80}
                  value={config.starSize}
                  onChange={(v) => handleChange('starSize', v)}
                />
              </Form.Item>
              <Form.Item label="五角星旋转角度">
                <Slider
                  min={0}
                  max={360}
                  value={config.starRotation || 0}
                  onChange={(v) => handleChange('starRotation', v)}
                />
              </Form.Item>
            </>
          )}

          {config.centerType === 'text' && (
            <>
              <Form.Item label="中心文字">
                <Input
                  value={config.centerText}
                  onChange={(e) => handleChange('centerText', e.target.value)}
                  placeholder="印"
                  maxLength={4}
                />
              </Form.Item>
              <Form.Item label="文字大小">
                <Slider
                  min={20}
                  max={80}
                  value={config.centerFontSize}
                  onChange={(v) => handleChange('centerFontSize', v)}
                />
              </Form.Item>
            </>
          )}
        </Form>
      </Card>

      <Card title="底部文字" size="small" className="config-card">
        <Form layout="vertical" size="small">
          <Form.Item label="底部文字（如编号）">
            <Input
              value={config.bottomText}
              onChange={(e) => handleChange('bottomText', e.target.value)}
              placeholder="请输入底部文字"
            />
          </Form.Item>

          <Form.Item label="字体大小">
            <Slider
              min={8}
              max={24}
              value={config.bottomFontSize}
              onChange={(v) => handleChange('bottomFontSize', v)}
            />
          </Form.Item>
        </Form>
      </Card>

      <Divider />

      <Card title="导出设置" size="small" className="config-card">
        <Form layout="vertical" size="small">
          <Form.Item label="导出倍数（高清）">
            <Select
              value={config.exportScale}
              onChange={(v) => handleChange('exportScale', v)}
              options={[
                { label: '1x (标清)', value: 1 },
                { label: '2x (高清)', value: 2 },
                { label: '3x (超清)', value: 3 },
                { label: '4x (极清)', value: 4 },
              ]}
            />
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default ConfigPanel
