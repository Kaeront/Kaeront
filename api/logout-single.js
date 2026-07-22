export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  try {
    const response = await fetch(`${process.env.KAERONT_API_URL}/api/v1/user/logout-single`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'X-Internal-Token': process.env.INTERNAL_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
