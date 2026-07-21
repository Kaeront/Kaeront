export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { uuid } = req.query;
    const authHeader = req.headers.authorization;

    if (!uuid) {
        return res.status(400).json({ error: 'UUID is required' });
    }

    const apiUrl = process.env.KAERONT_API_URL;

    if (!apiUrl) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        // Пробрасываем запрос с JWT-токеном пользователя напрямую на FastAPI бэкенд
        const response = await fetch(`${apiUrl}/api/v1/users/${uuid}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader || ''
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        console.error('Vercel Status Proxy Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
