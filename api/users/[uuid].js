export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { uuid } = req.query;
    if (!uuid) return res.status(400).json({ error: 'UUID is required' });

    // Убираем слэш в конце, если он есть
    const apiUrl = process.env.KAERONT_API_URL?.replace(/\/$/, '');
    const apiKey = process.env.INTERNAL_API_KEY;

    if (!apiUrl || !apiKey) {
        return res.status(500).json({ error: 'Server environment misconfiguration' });
    }

    try {
        const targetUrl = `${apiUrl}/api/users/${uuid}`;
        
        const response = await fetch(targetUrl, {
            headers: {
                'X-Internal-Token': apiKey
            }
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        console.error('Fetch Error to VDS:', error.message);
        return res.status(500).json({ error: 'Failed to connect to backend', details: error.message });
    }
}
