export default async function handler(req, res) {
    const { uuid } = req.query;
    const userAuthHeader = req.headers.authorization;

    if (!userAuthHeader) {
        return res.status(401).json({ error: "Unauthorized: Missing user token" });
    }

    const VDS_URL = process.env.KAERONT_API_URL;
    const INTERNAL_KEY = process.env.INTERNAL_API_KEY;

    if (!VDS_URL) {
        return res.status(500).json({ error: "Server Configuration Error: KAERONT_API_URL is missing" });
    }

    try {
        const response = await fetch(`${VDS_URL}/api/v1/users/${uuid}/login-history`, {
            method: 'GET',
            headers: {
                'Authorization': userAuthHeader,
                'X-Internal-Key': INTERNAL_KEY || '',
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        console.error("Vercel Proxy History Error:", error);
        return res.status(500).json({ error: "Internal Proxy Error" });
    }
}
