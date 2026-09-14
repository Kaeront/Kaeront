export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { uuid } = req.query; // uuid может принимать значения "follow" или "unfollow" при POST
    const apiUrl = process.env.KAERONT_API_URL?.replace(/\/$/, '');
    const apiKey = process.env.INTERNAL_API_KEY;

    if (!apiUrl || !apiKey) {
        return res.status(500).json({ error: 'Server environment misconfiguration' });
    }

    try {
        const headers = { 
            'X-Internal-Token': apiKey,
            'Content-Type': 'application/json'
        };

        // ВАЖНО: Всегда передаем токен авторизации клиента на VDS
        if (req.headers.authorization) {
            headers['Authorization'] = req.headers.authorization;
        }

        // Обработка POST-запросов (Follow / Unfollow)
        if (req.method === 'POST') {
            let endpoint = '';
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
            try {
                return res.status(response.status).json(JSON.parse(textData));
            } catch (e) {
                return res.status(response.status).send(textData);
            }
        }

        // Обработка GET-запросов (Профиль, Подписчики, Подписки)
        if (req.method === 'GET') {
            if (!uuid) return res.status(400).json({ error: 'UUID is required' });

            const { subpath } = req.query;
            const endpoint = subpath ? `${apiUrl}/api/users/${uuid}/${subpath}` : `${apiUrl}/api/users/${uuid}`;

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: headers // Заголовок Authorization теперь уйдет и сюда
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
