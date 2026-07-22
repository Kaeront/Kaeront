export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const apiRes = await fetch(`${process.env.KAERONT_API_URL}/api/v1/user/logout`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'X-Internal-Token': process.env.INTERNAL_API_KEY
      }
    });
    const data = await apiRes.json();
    return res.status(apiRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
