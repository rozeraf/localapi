import { useState } from 'react'

interface RandomResponse {
  number: number
  timestamp: string
  message: string
}

export const RandomButton = () => {
  const [data, setData] = useState<RandomResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRandomNumber = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://api.localhost:3001/random')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: RandomResponse = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>🎲 Генератор случайных чисел</h2>
      
      <button 
        onClick={fetchRandomNumber}
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: loading ? '#ccc' : '#0066cc',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? '⏳ Загрузка...' : '🎯 Получить число'}
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
          backgroundColor: '#e6f7ff',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #91d5ff'
        }}>
          <h3>✨ {data.message}</h3>
          <p><strong>Число:</strong> {data.number}</p>
          <p><strong>Время:</strong> {new Date(data.timestamp).toLocaleString()}</p>
        </div>
      )}
    </div>
  )
}