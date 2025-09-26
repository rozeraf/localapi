// server.js (Bun)

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

const server = Bun.serve({
  port: 3001,
  hostname: "0.0.0.0", // доступ из nginx
  async fetch(req) {
    const start = performance.now();
    const url = new URL(req.url);

    // Лог начала
    console.log("\n--- Новый запрос ---");
    console.log(`[${new Date().toISOString()}] ${req.method} ${url.pathname}`);

    // CORS
    const origin = req.headers.get("origin");
    const allowedOrigins = [
      "http://localhost:5173",
      "https://rand.localhost",
    ];
    let corsHeaders = {};
    if (origin && allowedOrigins.includes(origin)) {
      corsHeaders = {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
      };
    }

    // Preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          ...corsHeaders,
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    let response;

    // Роутинг
    if (url.pathname === "/random") {
      const randomNumber = Math.floor(Math.random() * 1000) + 1;
      response = jsonResponse({
        number: randomNumber,
        timestamp: new Date().toISOString(),
        message: `Ваше случайное число: ${randomNumber}`,
      });
    } else if (url.pathname === "/status") {
      response = jsonResponse({
        status: "API работает!",
        server: "api.localhost",
        port: 3001,
      });
    } else {
      response = jsonResponse({ error: "Not found" }, 404);
    }

    // Лог времени и ответа
    const duration = (performance.now() - start).toFixed(2);
    console.log(`[${new Date().toISOString()}] Ответ:`, await response.clone().json());
    console.log(`⏱ Время обработки: ${duration} мс`);

    // CORS заголовки к ответу
    return new Response(response.body, {
      status: response.status,
      headers: {
        ...Object.fromEntries(response.headers),
        ...corsHeaders,
      },
    });
  },
});

console.log(`🚀 API сервер запущен на http://api.localhost:${server.port}`);
