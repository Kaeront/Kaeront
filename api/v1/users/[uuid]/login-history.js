export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { uuid } = req.query;
    const authHeader = req.headers.authorization;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (!uuid) {
        return res.status(400).json({ error: 'UUID is required' });
    }

    const apiUrl = process.env.KAERONT_API_URL;
    if (!apiUrl) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const headers = {
            'Content-Type': 'application/json',
            'X-Internal-Token': process.env.INTERNAL_API_KEY || '',
            'X-Forwarded-For': clientIp || ''
        };

        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        const response = await fetch(`${apiUrl}/api/v1/users/${uuid}/login-history`, {
            method: 'GET',
            headers: headers
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        console.error('Vercel History Proxy Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
