export default async function handler(req, res) {
  const apiUrl = process.env.KAERONT_API_URL;
  const apiKey = process.env.INTERNAL_API_KEY;

  if (!apiUrl || !apiKey) {
    return res.status(500).json({ error: "Server configuration missing" });
  }

  const { path } = req.query; // Подмаршрут (channels, messages и т.д.)
  const targetUrl = `${apiUrl}/api/v1/chat/${path || ''}`;

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
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined,
    });

    const data = await vdsResponse.json();
    return res.status(vdsResponse.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: "VDS Proxy Connection Failure", details: err.message });
  }
}
