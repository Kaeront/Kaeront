// Vercel Serverless Function для зашифрованного общения с внутренним сервером
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { uuid, action } = req.query; // uuid может принимать значения "follow" или "unfollow" при POST
    const apiUrl = process.env.KAERONT_API_URL?.replace(/\/$/, '');
    const apiKey = process.env.INTERNAL_API_KEY;

    if (!apiUrl || !apiKey) {
        return res.status(500).json({ error: 'Server environment misconfiguration' });
    }

    try {
        let endpoint = '';
        const headers = { 
            'X-Internal-Token': apiKey,
            'Content-Type': 'application/json'
        };

        // Обработка POST-запросов (Follow / Unfollow)
        if (req.method === 'POST') {
            if (req.headers.authorization) {
                headers['Authorization'] = req.headers.authorization;
            }

            if (uuid === 'follow' || uuid === 'unfollow') {
                endpoint = `${apiUrl}/api/v1/users/${uuid}`;
            } else {
                return res.status(404).json({ error: 'Action not found' });
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(req.body)
            });

            const textData = await response.text();
            return res.status(response.status).send(textData);
        }

        // Обработка GET-запросов
        if (req.method === 'GET') {
            if (!uuid) return res.status(400).json({ error: 'UUID is required' });

            const { subpath } = req.query;
            endpoint = subpath ? `${apiUrl}/api/users/${uuid}/${subpath}` : `${apiUrl}/api/users/${uuid}`;

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: headers
            });

            const textData = await response.text();
            if (!response.ok) {
                return res.status(response.status).json({ 
                    error: 'Backend error', 
                    vdsStatus: response.status,
                    vdsResponse: textData 
                });
            }

            return res.status(200).json(JSON.parse(textData));
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        return res.status(500).json({ error: 'Failed to connect to backend', details: error.message });
    }
}
