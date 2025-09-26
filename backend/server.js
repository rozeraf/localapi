const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 3001

// CORS для фронта
app.use(cors({
  origin: ['http://localhost:5173', 'http://rand.localhost'],
  credentials: true
}))

app.use(express.json())

// Промежуточное ПО для логирования
app.use((req, res, next) => {
  console.log(`
--- Новый запрос ---`);
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  
  const originalJson = res.json;
  
  res.json = (data) => {
    console.log(`[${new Date().toISOString()}] Ответ:`, data);
    // Восстанавливаем исходный res.json
    res.json = originalJson;
    // Отправляем данные
    return originalJson.call(res, data);
  };
  
  next();
});

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