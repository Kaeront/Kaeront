export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { uuid, subpath } = req.query; // subpath для /followers и /following
    if (!uuid) return res.status(400).json({ error: 'UUID is required' });

    const apiUrl = process.env.KAERONT_API_URL?.replace(/\/$/, '');
    const apiKey = process.env.INTERNAL_API_KEY;

    if (!apiUrl || !apiKey) {
        return res.status(500).json({ error: 'Server environment misconfiguration' });
    }

    try {
        const endpoint = subpath ? `${apiUrl}/api/users/${uuid}/${subpath}` : `${apiUrl}/api/users/${uuid}`;
        const response = await fetch(endpoint, {
            headers: { 'X-Internal-Token': apiKey }
        });

        const textData = await response.text();

        // Если VDS ответил не 200 OK — отдаем точный текст ошибки с VDS
        if (!response.ok) {
            return res.status(response.status).json({ 
                error: 'Backend error', 
                vdsStatus: response.status,
                vdsResponse: textData 
            });
        }

        return res.status(200).json(JSON.parse(textData));
    } catch (error) {
        return res.status(500).json({ error: 'Failed to connect to backend', details: error.message });
    }
}
