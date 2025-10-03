# TODO — Upgrade project to production-like

## Краткая сводка

**Сложность:** низкая — средняя. Основные компоненты уже есть (frontend/backend, nginx, SSL, поддомены). Добавление БД, кэша и прод-фич займёт от 1 до 4 часов в зависимости от глубины интеграции.

---

## Общая цель

Превратить учебный проект в проект, максимально похожий на production без создания большого по функционалу веб-приложения. Оставить простую бизнес-логику (Random Quote Generator), но добавить инфраструктурные и оперционные фичи: БД, кэш, auth, мониторинг, логирование, Docker, health/metrics.

---

## Backlog (TODO)

### Приоритет: Высокий

* [ ] **Добавить базу данных (PostgreSQL + Prisma)** — 30–60 мин

  * [ ] `backend/` — инициализировать Prisma и добавить `@prisma/client`.
  * [ ] Создать `schema.prisma` (User, Post или Quote/RequestLog модель — взять из примеров).
  * [ ] Добавить `backend/src/db.ts` (PrismaClient + глобальный кеш в dev).
  * [ ] Добавить базовые CRUD-эндпоинты (`/users`, `/quotes/*`, `/requests`).
  * Команды:

    ```fish
    # В backend/
    bun add prisma @prisma/client
    bun add -d @types/pg

    bunx prisma init
    ```
  * Пример схемы (Quote / User / RequestLog) — положить в `backend/prisma/schema.prisma`.

* [ ] **Docker + docker-compose для локалки** — 20–40 мин

  * [ ] `docker-compose.yml` с сервисами: postgres, redis (healthchecks, volumes).
  * [ ] Документация: как запустить и применить миграции
  * Команды:

    ```fish
    docker-compose up -d

    cd backend
    bunx prisma migrate dev --name init
    ```

* [ ] **Redis для кэширования** — 10–20 мин

  * [ ] Установить пакет (ioredis) и добавить `backend/src/cache.ts`.
  * [ ] Реализовать helper `cached(key, ttl, fn)` и использовать для `/quotes/random`.
  * Пример установки:

    ```fish
    bun add ioredis
    ```

* [ ] **Простая JWT-auth (demo)** — 30–40 мин

  * [ ] `backend/src/auth.ts` — генерация и верификация токенов (jose).
  * [ ] `POST /auth/login` — упрощённый логин (email -> create/find user -> вернёт токен).
  * [ ] Пример: `bun add jose`.

* [ ] **Health checks & metrics (basic)** — 20–30 мин

  * [ ] `/health` — проверка БД и Redis, uptime, timestamp.
  * [ ] `/metrics` — Prometheus-like или JSON метрики (requests, avg p95, p99).
  * [ ] Логирование запросов в БД (RequestLog) асинхронно.

* [ ] **Rate limiting (Redis-backed)** — 20–30 мин

  * [ ] `backend/src/ratelimit.ts` с использованием Redis INCR + expire.
  * [ ] Middleware/проверка в основных эндпоинтах.

* [ ] **Structured logging** — 10–20 мин

  * [ ] Добавить pino и `backend/src/logger.ts`.
  * Команда:

    ```fish
    bun add pino pino-pretty
    ```

* [ ] **Graceful shutdown** — 5–10 мин

  * [ ] Обработчики SIGINT/SIGTERM: `server.stop()`, `prisma.$disconnect()`, `redis.quit()`.

### Приоритет: Средний

* [ ] **Metrics collection (in-memory + persist)** — 20–40 мин

  * [ ] Простая реализация p95/p99, avg, requests_by_endpoint.
  * [ ] Endpoint `/metrics` возвращает JSON.

* [ ] **Frontend: интеграция auth + token handling** — 30–40 мин

  * [ ] `frontend/src/lib/auth.ts` — getToken/setToken/logout/isAuthenticated.
  * [ ] Axios/фетч interceptor для добавления Authorization header.
  * [ ] UI: `QuoteCard` с кнопками «Get Random Quote» и «Favorite» (показывать login prompt при необходимости).

* [ ] **Nginx: rate limiting и proxy cache** — 20–40 мин

  * [ ] Обновить `nginx.conf` (rate zones, proxy_cache_path, правила для `/quotes/random`, /auth/ и protected endpoints).

* [ ] **Документация: .env.example и валидация переменных окружения** — 15–30 мин

  * [ ] `backend/.env.example` с DATABASE_URL, REDIS_URL, JWT_SECRET, NODE_ENV, PORT.
  * [ ] `backend/src/config.ts` — валидировать env через zod.

### Приоритет: Низкий / Опционально (для портфолио)

* [ ] **Sentry / APM интеграция** (Sentry/DataDog) — опционально
* [ ] **Prometheus + Grafana / OpenTelemetry** — для real observability
* [ ] **PgBouncer / connection pooling** — если нагрузка
* [ ] **Read replicas / horizontal scaling** — архитектурные заметки
* [ ] **Feature flags, backup strategies, CI/CD, IaC** — Terraform, GitHub Actions

---

## README — важные prod-вещи (включить как секцию)

Добавить раздел "Что НЕ включено (но критично для Production)" с краткими пунктами:

* Security: auth, RBAC, input validation (zod), CSP, CSRF, secrets management (Vault)
* Observability: Sentry, Prometheus, OpenTelemetry, structured logging (ELK/Loki)
* Performance & Scalability: CDN, connection pooling (PgBouncer), read replicas
* DevOps: CI/CD, IaC (Terraform), backups, zero-downtime deployments
* Testing: unit, integration, e2e, load testing
* Compliance: GDPR, audit logs, data retention
* Business: payments, email/SMS providers, analytics

(Добавить этот текст как отдельную секцию в README.md)

---

## Примеры кода и файлы (включить в backend/ и README)

(Сохранить примеры, приведённые в исходном тексте: Prisma schema, db.ts, cache.ts, ratelimit.ts, config.ts, health/metrics endpoints, logger.ts, graceful shutdown, docker-compose.yml, nginx.conf и frontend snippets.)

---

## Итоговая структура репозитория (обновлённая)

```
localapi/
├── backend/
│   ├── src/
│   │   ├── index.ts        # Main server
│   │   ├── db.ts           # Prisma client
│   │   ├── cache.ts        # Redis helpers
│   │   ├── ratelimit.ts    # Rate limiting
│   │   ├── logger.ts       # Structured logging
│   │   └── config.ts       # Env validation
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── .env.example
│   ├── .env
│   └── package.json
├── frontend/
│   └── (без изменений)
├── docker-compose.yml      # PostgreSQL + Redis
├── nginx.conf
└── README.md               # Обновленный с секцией про prod
```

---

## Домены и деплой — рекомендации

* **Покупать домен стоит**, если хочешь портфолио-похожесть (примерная цена $10–15/год). Плюсы: реальный SSL, DNS, впечатление у рекрутеров.
* **Варианты деплоя:**

  * Frontend → Vercel / Cloudflare Pages
  * Backend → Fly.io / Railway / VPS
  * Database → Supabase / Neon или собственный Postgres на VPS
  * Redis → Upstash / Redis Cloud или контейнер в Docker/VM
* **Гибрид (без VPS):** использовать хост-сервисы (Vercel + Fly/Railway + Supabase/Upstash).

DNS: добавить A / CNAME для домена и поддоменов (api., [www](http://www).).

---

## Минимальный план релиза (микроплан с временем)

1. Docker-compose + Postgres + Redis — 30 мин
2. Prisma init + schema + миграция + seed — 30–60 мин
3. cache.ts + update /quotes/random — 20 мин
4. auth (jose) + endpoints — 40 мин
5. health + metrics + logging — 20–30 мин
6. nginx conf + proxy cache + rate limit — 20–30 мин
7. README update, .env.example, docs — 20–30 мин

**Итого:** 3–4 часа (минимальный набор). Более глубокая интеграция мониторинга/observability/CI увеличит время.

---

## Заключение / Рекомендации

* **Стоит модифицировать** существующее: да. Делать по шагам — сначала infra, затем auth, затем observability.
* **Не обязательно** усложнять логику приложения — достаточно простого кейса (Random Quote Generator) с полнотой infra и practises.
* **Домен** — опционален, но полезен для портфолио.

