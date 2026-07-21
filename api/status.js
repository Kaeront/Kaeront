export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.query;
  const apiUrl = process.env.KAERONT_API_URL;
  const apiKey = process.env.INTERNAL_API_KEY;

  if (!code) {
    return res.status(400).json({ error: 'Code parameter is required' });
  }

  if (!apiUrl || !apiKey) {
    return res.status(500).json({ 
      error: 'Environment variables are not configured in Vercel!' 
    });
  }

  try {
    const response = await fetch(`${apiUrl}/api/v1/auth/status?code=${encodeURIComponent(code)}`, {
      method: 'GET',
      headers: {
        'X-Internal-Token': apiKey,
      },
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to reach VDS backend', 
      details: error.message 
    });
  }
}
