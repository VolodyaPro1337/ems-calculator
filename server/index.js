const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.json()); // Keep JSON parsing for req.body

// Serve static files (uploads)
// This allows <img src="http://server/ROOM/CAT/ITEM/img.webp">
app.use(express.static('uploads')); // Serve static files from 'uploads' directory directly

// 2. Auth Middleware
const authMiddleware = (req, res, next) => {
    // Skip auth for GET (viewing images) or restrict if needed.
    // Here we protect UPLOAD.
    if (req.method === 'POST') {
        const key = req.headers['x-api-key'];
        if (!key || key !== API_KEY) {
            return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
        }
    }
    next();
};

app.use(authMiddleware);

// 3. Storage Config
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 4. Helper to update Firebase
async function updateFirebaseCount(roomId, catId, itemId) {
    if (!admin.apps.length) return; // Skip if no firebase

    const db = admin.database();

    // Path: rooms/{room}/ (This is an Array of Categories)
    // We need to find the INDEX of the category with id === catId

    try {
        const roomRef = db.ref(`rooms/${roomId}`);
        const snapshot = await roomRef.once('value');
        const categories = snapshot.val();

        if (!categories) {
            console.error(`Room ${roomId} not found in DB`);
            return;
        }

        // Find Category Index
        const catIndex = categories.findIndex(c => c.id === catId);
        if (catIndex === -1) {
            console.error(`Category ${catId} not found in room ${roomId}`);
            return;
        }

        // Get Item Index (itemId passed from client is typically the Direct Index 0,1,2...)
        // But we should verify it exists
        const itemIndex = parseInt(itemId);
        if (isNaN(itemIndex) || !categories[catIndex].items[itemIndex]) {
            console.error(`Item Index ${itemIndex} invalid in category ${catId}`);
            return;
        }

        // Increment Quantity
        const oldQty = categories[catIndex].items[itemIndex].quantity || 0;
        const targetPath = `rooms/${roomId}/${catIndex}/items/${itemIndex}/quantity`;

        await db.ref(targetPath).set(oldQty + 1);
        console.log(`[Firebase] Updated ${targetPath}: ${oldQty} -> ${oldQty + 1}`);

    } catch (err) {
        console.error("[Firebase] Sync Error:", err);
    }
}

// 5. Upload Endpoint
app.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image provided' });
    }

    const { room, catId, itemIndex } = req.body; // ShareX Arguments

    // Input Validation
    if (!room || !catId || itemIndex === undefined) {
        return res.status(400).json({ error: 'Missing metadata (room, catId, itemIndex)' });
    }

    // Sanitize
    const safeRoom = room.replace(/[^a-zA-Z0-9]/g, '');
    const safeCat = catId.replace(/[^a-zA-Z0-9]/g, '');
    const safeIndex = parseInt(itemIndex);

    // const matchName = req.file.originalname.replace(/\.[^/.]+$/, ""); // Not used in new logic
    const timestamp = Date.now();

    // Directory: uploads/ROOM/CAT/INDEX/
    const uploadDir = path.join(__dirname, 'uploads', safeRoom, safeCat, String(safeIndex));

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${timestamp}.webp`;
    const filePath = path.join(uploadDir, filename);

    try {
        // Optimize & Save
        await sharp(req.file.buffer)
            .resize({ width: 1280, withoutEnlargement: true })
            .webp({ quality: 70 })
            .toFile(filePath);

        console.log(`Saved: ${filePath}`);

        // Update Firebase Counter
        await updateFirebaseCount(safeRoom, safeCat, safeIndex);

        // Return URL correctly constructed
        // Note: Client assumes direct path access relative to server root
        // If static serve is on root, then /safeRoom/... works
        const fileUrl = `/${safeRoom}/${safeCat}/${safeIndex}/${filename}`;

        res.json({
            status: 'ok',
            url: fileUrl,
            params: { room: safeRoom, cat: safeCat, index: safeIndex }
        });

    } catch (err) {
        console.error("Processing Error", err);
        res.status(500).json({ error: 'Image processing failed' });
    }
});

// 6. Album Data Endpoint
app.get('/albums/:room', (req, res) => {
    const { room } = req.params;
    const safeRoom = room.replace(/[^a-zA-Z0-9]/g, '');
    const rootDir = path.join(__dirname, 'uploads', safeRoom);

    if (!fs.existsSync(rootDir)) {
        return res.json({ room: safeRoom, tree: {} });
    }

    // Helper to list files recursively properly mapped to { catId: { itemIndex: [urls] } }
    const result = {};

    try {
        const categories = fs.readdirSync(rootDir);

        categories.forEach(cat => {
            const catPath = path.join(rootDir, cat);
            if (fs.statSync(catPath).isDirectory()) {
                result[cat] = {};

                const items = fs.readdirSync(catPath);
                items.forEach(itemIdx => {
                    const itemPath = path.join(catPath, itemIdx);
                    if (fs.statSync(itemPath).isDirectory()) {

                        const files = fs.readdirSync(itemPath)
                            .filter(f => f.endsWith('.webp'))
                            .map(f => `/${safeRoom}/${cat}/${itemIdx}/${f}`); // Construct URL

                        // Sort by new
                        files.sort().reverse();
                        result[cat][itemIdx] = files;
                    }
                });
            }
        });

        res.json({ room: safeRoom, tree: result });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to scan directory' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("Auth Guard Active. API Key Required for POST.");
    console.log(`Uploads available at http://localhost:${PORT}/<room>/<cat>/<item>/<filename>.webp`);
});
