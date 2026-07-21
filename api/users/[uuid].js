export default async function handler(req, res) {
    // Разрешаем CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { uuid } = req.query;

    if (!uuid) {
        return res.status(400).json({ error: 'UUID is required' });
    }

    // Берем конфигурацию строго из Environment Variables
    const apiUrl = process.env.KAERONT_API_URL;
    const apiKey = process.env.INTERNAL_API_KEY;

    if (!apiUrl || !apiKey) {
        console.error('Missing required environment variables: KAERONT_API_URL or INTERNAL_API_KEY');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const response = await fetch(`${apiUrl}/api/users/${uuid}`, {
            headers: {
                'X-Internal-Token': apiKey
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: 'User not found or backend error' });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('Vercel Proxy Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
