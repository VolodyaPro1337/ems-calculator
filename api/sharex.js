export default async function handler(req, res) {
    // 1. CORS & Methods
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 2. Parse Params (Support both GET query and POST body if parsed, but Vercel requires middleware for body)
    // To keep it simple and reliable with ShareX, we will force ShareX to send GET request with params in URL.
    // 2. Parse Params (Handle both Query Strings and Multipart Body)
    let room = req.query.room;
    let action = req.query.action;

    // Helper to parse body if params are missing (for POST from ShareX)
    if (!room || !action) {
        if (req.method === 'POST') {
            // Basic multipart parser hack to find "room" and "action" fields
            // We don't need a full library if we just grep the buffer/string
            // Vercel serverless receives standard req which can be consumed
            const buffers = [];
            for await (const chunk of req) {
                buffers.push(chunk);
            }
            const data = Buffer.concat(buffers).toString();

            // Regex to find form-data values
            // Content-Disposition: form-data; name="room"\r\n\r\n(VALUE)\r\n
            const roomMatch = data.match(/name="room"(?:\r\n|\n){2}(.*?)(?:\r\n|\n)/);
            const actionMatch = data.match(/name="action"(?:\r\n|\n){2}(.*?)(?:\r\n|\n)/);

            if (roomMatch) room = roomMatch[1].trim();
            if (actionMatch) action = actionMatch[1].trim();
        }
    }

    if (!room) {
        return res.status(400).json({ error: 'Missing room code' });
    }

    // Action validation moved to switch


    // 2. Logic: Determine Shift
    // UTC+3 (Moscow/Majestic)
    const now = new Date();
    const utcOffset = 3;
    const localHookHour = new Date(now.getTime() + utcOffset * 3600000).getUTCHours();
    const localHookDay = new Date(now.getTime() + utcOffset * 3600000).getUTCDay();

    // Rules:
    // Mon-Fri (1-5): Day 10-20, else Night
    // Sat-Sun (6,0): Day 12-20, else Night
    let isWeekend = localHookDay === 0 || localHookDay === 6;
    let isDay = false;

    if (isWeekend) {
        if (localHookHour >= 12 && localHookHour < 20) isDay = true;
    } else {
        if (localHookHour >= 10 && localHookHour < 20) isDay = true;
    }

    const shiftStatus = isDay ? 'День' : 'Ночь';

    // Action Map with Indices (Robust)
    // We assume default location is ELSH (City) for now, as per config.
    // Indexes based on App.vue structure:
    // General: 0 = ELSH Day, 1 = ELSH Night
    // PMP: 0 = PMP Day, 1 = PMP Night

    let targetCatId = '';
    let targetItemIndex = -1;

    // Helper for City/ELSH index
    const cityIndex = isDay ? 0 : 1;

    switch (action) {
        case 'pmp':
            targetCatId = 'firstaid';
            targetItemIndex = isDay ? 0 : 1;
            break;
        case 'pills':
            targetCatId = 'pills';
            targetItemIndex = cityIndex;
            break;
        case 'vaccine':
            targetCatId = 'vaccination';
            targetItemIndex = cityIndex;
            break;
        case 'medcert':
            targetCatId = 'certificates';
            targetItemIndex = cityIndex;
            break;
        default:
            return res.status(400).json({ error: 'Unknown action', action });
    }

    // 3. Firebase Interaction (REST API)
    // We need to fetch the room data to find the index of the item to increment
    const dbUrl = process.env.VITE_FIREBASE_DATABASE_URL;

    if (!dbUrl) {
        console.error("Missing VITE_FIREBASE_DATABASE_URL");
        return res.status(500).json({ error: 'System Error: ENV VITE_FIREBASE_DATABASE_URL is missing. Check Vercel Settings.' });
    }

    try {
        // A. Fetch current state
        const roomUrl = `${dbUrl}/rooms/${room}.json`;
        const fetchRes = await fetch(roomUrl);
        const categories = await fetchRes.json();

        if (!categories) {
            return res.status(404).json({ error: 'Room not found' });
        }

        const catIndex = categories.findIndex(c => c.id === targetCatId);
        if (catIndex === -1) return res.status(500).json({ error: `Category '${targetCatId}' not found in DB` });

        // Direct Index Access
        if (!categories[catIndex].items[targetItemIndex]) {
            return res.status(500).json({
                error: 'Target item index out of bounds',
                catId: targetCatId,
                index: targetItemIndex,
                count: categories[catIndex].items.length
            });
        }

        const currentQty = categories[catIndex].items[targetItemIndex].quantity || 0;
        const newQty = currentQty + 1;

        // Target Name for response (optional, try to get from DB or fallback)
        const targetName = categories[catIndex].items[targetItemIndex].name || `${targetCatId} #${targetItemIndex}`;

        // D. Write back ONLY the quantity
        const updateUrl = `${dbUrl}/rooms/${room}/${catIndex}/items/${targetItemIndex}/quantity.json`;
        await fetch(updateUrl, {
            method: 'PUT',
            body: JSON.stringify(newQty)
        });

        return res.status(200).json({
            status: 'ok',
            shift: shiftStatus,
            item: targetName,
            new_quantity: newQty,
            message: `+1 [${shiftStatus}]`
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: 'Internal Server Error',
            details: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
}
