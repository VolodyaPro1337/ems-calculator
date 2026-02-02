export default async function handler(req, res) {
    // 1. CORS & Methods
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { room, action } = req.query;

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

    // Action Map
    let targetCatId = '';
    let targetItemName = '';

    // Simplified Location Logic (Defaults to ELSH/City)
    const location = 'ELSH';

    switch (action) {
        case 'pmp':
            targetCatId = 'firstaid';
            targetItemName = `Оказание ПМП ${shiftStatus}`;
            break;
        case 'pills':
            targetCatId = 'pills';
            targetItemName = `Выдача таблетки в ${location} ${shiftStatus}`;
            break;
        case 'vaccine':
            targetCatId = 'vaccination';
            targetItemName = `Вакцинация в ${location} ${shiftStatus}`;
            break;
        case 'medcert':
            targetCatId = 'certificates';
            targetItemName = `Выдача 1 мед. справки в ${location} ${shiftStatus}`;
            break;
        default:
            return res.status(400).json({ error: 'Unknown action. Use: pmp, pills, vaccine, medcert' });
    }

    // 3. Firebase Interaction (REST API)
    // We need to fetch the room data to find the index of the item to increment
    const dbUrl = process.env.VITE_FIREBASE_DATABASE_URL; // Vercel Env Vars should have this

    if (!dbUrl) {
        return res.status(500).json({ error: 'Server config error (DB URL)' });
    }

    try {
        // A. Fetch current state
        const roomUrl = `${dbUrl}/rooms/${room}.json`;
        const fetchRes = await fetch(roomUrl);
        const categories = await fetchRes.json();

        if (!categories) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // B. Find Item Indices
        const catIndex = categories.findIndex(c => c.id === targetCatId);
        if (catIndex === -1) return res.status(500).json({ error: `Category '${targetCatId}' not found` });

        const itemIndex = categories[catIndex].items.findIndex(i => i.name === targetItemName);
        if (itemIndex === -1) return res.status(500).json({ error: 'Item not found' });

        // C. Increment
        const currentQty = categories[catIndex].items[itemIndex].quantity || 0;
        const newQty = currentQty + 1;

        // D. Write back ONLY the quantity
        const updateUrl = `${dbUrl}/rooms/${room}/${catIndex}/items/${itemIndex}/quantity.json`;
        await fetch(updateUrl, {
            method: 'PUT',
            body: JSON.stringify(newQty)
        });

        return res.status(200).json({
            status: 'ok',
            shift: shiftStatus,
            item: targetItemName,
            new_quantity: newQty,
            message: `PMP (+1) [${shiftStatus}]`
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
