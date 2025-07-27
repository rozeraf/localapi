const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 3001

// CORS для фронта
app.use(cors({
  origin: ['http://localhost:5173', 'http://app.localhost:5173'],
  credentials: true
}))

app.use(express.json())

// Эндпоинт для рандомного числа
app.get('/random', (req, res) => {
  const randomNumber = Math.floor(Math.random() * 1000) + 1
  
  res.json({
    number: randomNumber,
    timestamp: new Date().toISOString(),
    message: `Ваше случайное число: ${randomNumber}`
  })
})

// Дополнительный эндпоинт для проверки
app.get('/status', (req, res) => {
  res.json({
    status: 'API работает!',
    server: 'api.localhost',
    port: PORT
  })
})

app.listen(PORT, () => {
  console.log(`🚀 API сервер запущен на http://api.localhost:${PORT}`)
  console.log(`📝 Тестируй: http://api.localhost:${PORT}/random`)
})