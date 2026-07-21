module.exports = async (req, res) => {
  // 1. Запрещаем кэширование
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.query;
  const apiUrl = process.env.KAERONT_API_URL;
  const apiKey = process.env.INTERNAL_API_KEY;

  if (!code || !apiUrl || !apiKey) {
    return res.status(400).json({ error: 'Missing parameters or environment variables' });
  }

  try {
    // Передаем код в ПУТИ (path parameter), как определено в FastAPI
    const targetUrl = `${apiUrl.replace(/\/$/, '')}/api/v1/auth/status/${encodeURIComponent(code)}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'X-Internal-Token': apiKey,
      },
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Proxy status error', message: err.message });
  }
};
