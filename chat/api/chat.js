export default async function handler(req, res) {
  const apiUrl = process.env.KAERONT_API_URL;
  const apiKey = process.env.INTERNAL_API_KEY;

  if (!apiUrl || !apiKey) {
    return res.status(500).json({ error: "Server configuration missing" });
  }

  const { path } = req.query; // Подмаршрут (channels, messages, auth/me и т.д.)
  const reqPath = path || '';

  // Умная маршрутизация:
  // Если фронтенд запрашивает "auth/me" или "user/profile", стучимся в /api/v1/
  // В остальных случаях по умолчанию проксируем в /api/v1/chat/
  let targetUrl;
  if (reqPath.startsWith('auth/') || reqPath.startsWith('user/')) {
    targetUrl = `${apiUrl}/api/v1/${reqPath}`;
  } else {
    targetUrl = `${apiUrl}/api/v1/chat/${reqPath}`;
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Internal-Token': apiKey,
  };

  if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization;
  }

  try {
    const vdsResponse = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) && req.body 
        ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) 
        : undefined,
    });

    // Безопасный парсинг ответа (на случай не-JSON ошибок сервера)
    const contentType = vdsResponse.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await vdsResponse.json();
      return res.status(vdsResponse.status).json(data);
    } else {
      const rawText = await vdsResponse.text();
      return res.status(vdsResponse.status || 500).json({
        error: "VDS Server Non-JSON Response",
        details: rawText
      });
    }

  } catch (err) {
    return res.status(502).json({ 
      error: "VDS Proxy Connection Failure", 
      details: err.message 
    });
  }
}
