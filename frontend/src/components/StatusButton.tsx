import { useState } from 'react'

interface StatusResponse {
  status: string
  server: string
  port: number
}

export const StatusButton = () => {
  const [data, setData] = useState<StatusResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://api.localhost/status')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: StatusResponse = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>📡 Проверка статуса API</h2>
      
      <button 
        onClick={fetchStatus}
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: loading ? '#ccc' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? '⏳ Проверка...' : '🔍 Проверить статус'}
      </button>

      {error && (
        <div style={{ 
          color: 'red', 
          padding: '10px',
          backgroundColor: '#ffe6e6',
          borderRadius: '4px',
          margin: '10px 0'
        }}>
          ❌ Ошибка: {error}
        </div>
      )}

      {data && (
        <div style={{
          backgroundColor: '#e9f7ef',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #a6e9c5'
        }}>
          <h3>✅ {data.status}</h3>
          <p><strong>Сервер:</strong> {data.server}</p>
          <p><strong>Порт:</strong> {data.port}</p>
        </div>
      )}
    </div>
  )
}
