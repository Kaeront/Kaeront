export default async function handler(req, res) {
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
    const response = await fetch(`${apiUrl}/api/v1/auth/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Token': apiKey,
      },
    });

    const text = await response.text();

    // Безопасно пытаемся распарсить как JSON, иначе отдаем как текст/объект
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
}
