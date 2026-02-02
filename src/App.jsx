import { useState, useCallback } from 'react'
import { Layout, Typography } from 'antd'
import ConfigPanel from './components/ConfigPanel'
import SealPreview from './components/SealPreview'
import { DEFAULT_SEAL_CONFIG } from './constants/sealConfig'
import './App.css'

const { Header, Content } = Layout
const { Title } = Typography

function App() {
  const [sealConfig, setSealConfig] = useState(DEFAULT_SEAL_CONFIG)

  const handleConfigChange = useCallback((newConfig) => {
    setSealConfig(prev => ({ ...prev, ...newConfig }))
  }, [])

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <Title level={3} style={{ color: '#fff', margin: 0 }}>
          印章生成器
        </Title>
      </Header>
      <Content className="app-content">
        <div className="main-container">
          <div className="config-section">
            <ConfigPanel 
              config={sealConfig} 
              onChange={handleConfigChange} 
            />
          </div>
          <div className="preview-section">
            <SealPreview config={sealConfig} />
          </div>
        </div>
      </Content>
    </Layout>
  )
}

export default App
