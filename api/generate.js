module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiUrl = process.env.KAERONT_API_URL;
  const apiKey = process.env.INTERNAL_API_KEY;

  if (!apiUrl || !apiKey) {
    return res.status(500).json({ 
      error: 'Environment variables are missing on Vercel' 
    });
  }

  try {
    // Получаем реальный User-Agent пользователя с сайта
    const userAgent = req.headers['user-agent'] || '';
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    const response = await fetch(`${apiUrl}/api/v1/auth/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Token': apiKey,
        'User-Agent': userAgent, // Передаем честный UA браузера
        'X-Forwarded-For': clientIp
      },
      // Передаем UA и IP в теле запроса на случай, если FastAPI берет их из JSON
      body: JSON.stringify({
        user_agent: userAgent,
        ip: clientIp
      })
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { code: text };
    }

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ 
      error: 'Proxy execution error', 
      details: error.message 
    });
  }
};
