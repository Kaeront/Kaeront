export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const userAuthHeader = req.headers.authorization;
    if (!userAuthHeader) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const VDS_URL = process.env.KAERONT_API_URL;
    const INTERNAL_KEY = process.env.INTERNAL_API_KEY;

    if (!VDS_URL) {
        return res.status(500).json({ error: "Server Configuration Error: KAERONT_API_URL is missing" });
    }

    try {
        const response = await fetch(`${VDS_URL}/api/v1/user/logout`, {
            method: 'POST',
            headers: {
                'Authorization': userAuthHeader,
                'X-Internal-Key': INTERNAL_KEY || '',
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        console.error("Vercel Proxy Logout Error:", error);
        return res.status(500).json({ error: "Internal Proxy Error" });
    }
}
