module.exports = async (req, res) => {
  // Отключаем кэширование поллинга полностью
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  // 1. Разрешаем только GET-запросы
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.query;
  const apiUrl = process.env.KAERONT_API_URL;
  const apiKey = process.env.INTERNAL_API_KEY;

  // 2. Валидация входных данных
  if (!code) {
    return res.status(400).json({ error: 'Code parameter is required' });
  }

  if (!apiUrl || !apiKey) {
    return res.status(500).json({ error: 'Missing environment variables on Vercel' });
  }

  try {
    const targetUrl = `${apiUrl.replace(/\/$/, '')}/api/v1/auth/status?code=${encodeURIComponent(code)}`;

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
    } catch (_err) {
      data = { rawResponse: text };
    }

    // 3. Главный трюк: Если бэкенд возвращает 404 (код еще не активирован в игре),
    // мы превращаем это для фронтенда в успешный ответ 200 со статусом pending
    if (response.status === 404) {
      return res.status(200).json({ 
        authenticated: false, 
        status: 'pending',
        message: 'Waiting for code activation in Minecraft' 
      });
    }

    // В остальных случаях отдаем статус бэкенда (например, 200 при успешной авторизации)
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ 
      error: 'Proxy status execution failed', 
      message: err.message 
    });
  }
};
