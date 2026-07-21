export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { uuid } = req.query;
    if (!uuid) return res.status(400).json({ error: 'UUID is required' });

    const apiUrl = process.env.KAERONT_API_URL?.replace(/\/$/, '');
    const apiKey = process.env.INTERNAL_API_KEY;

    if (!apiUrl || !apiKey) {
        return res.status(500).json({ error: 'Server environment misconfiguration' });
    }

    try {
        const response = await fetch(`${apiUrl}/api/users/${uuid}`, {
            headers: {
                'X-Internal-Token': apiKey
            }
        });

        const textData = await response.text();

        // Если VDS ответил не 200 OK — отдаем точный текст ошибки с VDS
        if (!response.ok) {
            console.error(`VDS error status ${response.status}:`, textData);
            return res.status(response.status).json({ 
                error: 'Backend error', 
                vdsStatus: response.status,
                vdsResponse: textData 
            });
        }

        // Если всё OK — парсим JSON
        const data = JSON.parse(textData);
        return res.status(200).json(data);
    } catch (error) {
        console.error('Fetch Error to VDS:', error.message);
        return res.status(500).json({ error: 'Failed to connect to backend', details: error.message });
    }
}
