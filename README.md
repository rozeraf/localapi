# React + Bun API Example

Это пример проекта, демонстрирующий современный подход к разработке веб-приложений с разделением на Frontend и Backend.

- **Frontend**: React (Vite) + TypeScript, раздаётся как статика через Nginx
- **Backend**: Bun (HTTP Server), проксируется через Nginx
- **Инфраструктура**: Nginx с SSL/HTTP2, gzip сжатие, поддомены

## Архитектура проекта

Этот проект демонстрирует типичную production-архитектуру:

- **Статические файлы** раздаются nginx (быстро, кешируется)
- **API запросы** проксируются на backend сервер
- **SSL/HTTP2** для безопасности и скорости
- **Поддомены** для разделения сервисов (`rand.localhost`, `api.localhost`)
- **gzip сжатие** для оптимизации трафика
- **React Router** поддержка через nginx fallback

## Принцип работы

Эталонная схема для локальной разработки, максимально приближенная к продакшену:

1. **Backend** (`backend/`) запускается на порту `3001`
2. **Frontend** (`frontend/`) собирается в статические файлы (`html`, `css`, `js`) в папку `dist`
3. **Nginx** выступает в роли веб-сервера:
   - Отвечает на домене `https://rand.localhost` и отдает статические файлы фронтенда
   - Отвечает на домене `https://api.localhost` и проксирует все запросы на бэкенд (`http://127.0.0.1:3001`)
   - Обеспечивает работу по **HTTPS** для обоих доменов с помощью сертификатов от `mkcert`

## 1. Настройка и запуск

### Примечание о `.localhost` доменах

Редактировать системный файл `hosts` не требуется. Все домены, оканчивающиеся на `.localhost` (например, `api.localhost`, `rand.localhost`), автоматически разрешаются в `127.0.0.1` современными браузерами и операционными системами.

### Backend
```bash
cd backend
bun install
bun run dev
```
Сервер запустится на `http://127.0.0.1:3001`. **Напрямую к нему обращаться не нужно**, для этого есть `nginx`.

### Frontend
```bash
cd frontend
bun install
bun run build
```
Эта команда соберёт статические файлы вашего приложения в папку `frontend/dist`.

### Nginx

#### а) HTTPS сертификаты (`mkcert`)

1. **Установите `mkcert`**, если он отсутствует
2. **Установите локальный CA**: 
   ```bash
   mkcert -install
   ```
3. **Создайте сертификаты** для локальных доменов:
   ```bash
   mkcert api.localhost rand.localhost
   ```
4. `mkcert` создаст файлы сертификатов (`.pem` и `-key.pem`). Чтобы узнать, где они лежат, выполните `mkcert -CAROOT`. Этот путь понадобится для `nginx.conf`.

#### б) Конфигурация Nginx

1. Установите Nginx
2. Создайте файл конфигурации (например, `/etc/nginx/sites-available/local.conf`)
3. Скопируйте в него приведённый ниже конфиг, **заменив пути к вашим SSL-сертификатам**
4. Включите сайт и перезапустите Nginx

#### Пример `nginx.conf`

```nginx
user http;
worker_processes auto;

error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile on;
    keepalive_timeout 65;

    # Фронтенд rand.localhost
    server {
        listen 443 ssl http2;
        server_name rand.localhost;

        ssl_certificate     /home/raf/git/users/rozeraf/web/react/localapi/rand.localhost+1.pem;
        ssl_certificate_key /home/raf/git/users/rozeraf/web/react/localapi/rand.localhost+1-key.pem;

        root /home/raf/git/users/rozeraf/web/react/localapi/frontend/dist;
        index index.html;

        gzip on;
        gzip_types text/plain text/css application/javascript application/json image/svg+xml;

        location / {
            try_files $uri $uri/ /index.html;
        }
    }

    # Бэкенд api.localhost
    server {
        listen 443 ssl http2;
        server_name api.localhost;

        ssl_certificate     /home/raf/git/users/rozeraf/web/react/localapi/rand.localhost+1.pem;
        ssl_certificate_key /home/raf/git/users/rozeraf/web/react/localapi/rand.localhost+1-key.pem;

        location / {
            proxy_pass http://127.0.0.1:3001;
            proxy_http_version 1.1;

            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $http_connection;
        }
    }
}
```

## 2. Проверка работы

### Веб-интерфейс
- Откройте в браузере `https://rand.localhost` — интерфейс React-приложения
- Кнопки на странице отправляют запросы на `https://api.localhost`, которые nginx проксирует на bun-сервер

### API эндпоинты
- `https://api.localhost/random` — возвращает случайное число с timestamp
- `https://api.localhost/status` — статус сервера и информация о порте

### Диагностика

```bash
# Проверить nginx конфиг
sudo nginx -t

# Логи nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Проверить HTTP/2
curl -I --http2 https://rand.localhost

# Проверить gzip сжатие
curl -H "Accept-Encoding: gzip" -v https://rand.localhost

# Тест API
curl https://api.localhost/random
curl https://api.localhost/status
```

## 3. Особенности реализации

### Backend (Bun)
- **Производительность**: ~0.12ms время ответа
- **Логирование**: подробные логи запросов с timing'ом
- **CORS**: настроен для работы с поддоменами
- **JSON API**: простые эндпоинты с structured response

### Frontend (React + Vite)
- **Build**: статические файлы для production-like раздачи
- **TypeScript**: полная типизация
- **Component-based**: модульная архитектура (StatusButton, RandomButton)

### Nginx
- **HTTP/2**: для улучшенной производительности
- **gzip**: сжатие статических ресурсов
- **SSL**: локальные сертификаты через mkcert
- **Proxy**: корректное проксирование с заголовками
- **SPA support**: fallback на index.html для React Router

## 4. Технологический стек

- **Runtime**: Bun (backend) + Node.js (build tools)
- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Bun.serve, встроенный HTTP server
- **Proxy**: Nginx с SSL/HTTP2
- **Dev Tools**: mkcert для локальных SSL сертификатов

Этот setup демонстрирует современный подход к разработке веб-приложений с четким разделением Frontend/Backend и production-ready инфраструктурой.