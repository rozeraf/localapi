# React + Bun API Example

Это пример проекта, демонстрирующий современный подход к разработке веб-приложений с разделением на Frontend и Backend.

- **Frontend**: React (Vite) + TypeScript, раздаётся как статика через Nginx.
- **Backend**: Bun (HTTP Server), проксируется через Nginx.

## Принцип работы

Эталонная схема для локальной разработки, максимально приближенная к продакшену:

1.  **Backend** (`backend/`) запускается на порту `3001`.
2.  **Frontend** (`frontend/`) собирается в статические файлы (`html`, `css`, `js`) в папку `dist`.
3.  **Nginx** выступает в роли веб-сервера:
    - Отвечает на домене `https://rand.localhost` и отдает статические файлы фронтенда.
    - Отвечает на домене `https://api.localhost` и проксирует все запросы на бэкенд (`http://127.0.0.1:3001`).
    - Обеспечивает работу по **HTTPS** для обоих доменов с помощью сертификатов от `mkcert`.

## 1. Настройка и запуск

### Примечание о `.localhost` доменах

Редактировать системный файл `hosts` не требуется. Все домены, оканчивающиеся на `.localhost` (например, `api.localhost`, `rand.localhost`), автоматически разрешаются в `127.0.0.1` современными браузерами и операционными системами.

### Backend
```bash
cd backend
bun install
bun dev
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

1.  **Установите `mkcert`**, если он отсутствует.
2.  **Создайте сертификаты** для локальных доменов. Выполните в терминале:
    ```bash
    mkcert api.localhost rand.localhost
    ```
3.  `mkcert` создаст файлы сертификатов (`.pem` и `-key.pem`). Чтобы узнать, где они лежат, выполните `mkcert -CAROOT`. Этот путь понадобится для `nginx.conf`.

#### б) Конфигурация Nginx

1.  Установите Nginx.
2.  Создайте файл конфигурации (например, `/etc/nginx/sites-available/local.conf`).
3.  Скопируйте в него приведённый ниже конфиг, **заменив пути к вашим SSL-сертификатам**.
4.  Включите сайт и перезапустите Nginx.

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

## 2. Проверка

- Откройте в браузере `https://rand.localhost`. Вы должны увидеть интерфейс вашего React-приложения.
- Кнопки на странице будут отправлять запросы на `https://api.localhost`, которые `nginx` будет успешно проксировать на ваш `bun`-сервер.