export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ error: 'Code parameter is required' });
  }

  try {
    const response = await fetch(`${process.env.KAERONT_API_URL}/api/v1/auth/status/${code}`, {
      method: 'GET',
      headers: {
        'X-Internal-Token': process.env.INTERNAL_API_KEY,
      },
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Не удалось проверить статус' });
  }
}
