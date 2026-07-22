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
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    
    // БЕРЕМ user_agent ИЗ ТЕЛА ЗАПРОСА С ФРОНТЕНДА (navigator.userAgent)
    // Если его нет в body, пробуем заголовок браузера
    const userAgent = (req.body && req.body.user_agent) 
      || req.headers['user-agent'] 
      || 'Неизвестный браузер';

    const response = await fetch(`${apiUrl}/api/v1/auth/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Token': apiKey,
        'User-Agent': userAgent
      },
      body: JSON.stringify({
        ip: clientIp,
        user_agent: userAgent
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
