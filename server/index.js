const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); 
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('cors');
const fs = require('fs');
const admin = require('firebase-admin');

// 1. Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        const serviceAccount = require('./service-account.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DATABASE_URL || "https://ems-calculator-21321-default-rtdb.europe-west1.firebasedatabase.app/"
        });
        console.log("[Firebase] Admin SDK Initialized");
    } catch (err) {
        console.error("[Firebase] Initialization Failed. Check service-account.json location.");
        console.error(err.message);
    }
}

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("⚠️  WARNING: API_KEY is not set in .env! Uploads might be blocked or insecure.");
}

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static files from 'uploads' directory
app.use(express.static(path.join(__dirname, 'uploads')));

// 2. Auth Middleware
const authMiddleware = (req, res, next) => {
    if (req.method === 'POST' && req.path === '/upload') {
        const key = req.headers['x-api-key'];
        if (!key || key !== API_KEY) {
            console.log(`[Auth] Blocked request from ${req.ip} - Invalid Key`);
            return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
        }
    }
    next();
};

app.use(authMiddleware);

// 3. Storage Config
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * 4. Helper to update Firebase
 */
async function updateFirebaseCount(roomId, catId, itemId) {
    if (!admin.apps.length) return;
    const db = admin.database();
    try {
        const roomRef = db.ref(`rooms/${roomId}`);
        const snapshot = await roomRef.once('value');
        const categories = snapshot.val();
        if (!categories) return;
        const catIndex = categories.findIndex(c => c.id === catId);
        if (catIndex === -1) return;
        const itemIndex = parseInt(itemId);
        if (isNaN(itemIndex) || !categories[catIndex].items[itemIndex]) return;
        const quantityRef = db.ref(`rooms/${roomId}/${catIndex}/items/${itemIndex}/quantity`);
        await quantityRef.transaction((currentValue) => {
            return (currentValue || 0) + 1;
        });
        console.log(`[Firebase] Room ${roomId}: Incremented ${catId}/${itemIndex}`);
    } catch (err) {
        console.error("[Firebase] Sync Error:", err.message);
    }
}

// 5. Upload Endpoint
app.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image provided' });
    const { room, catId, itemIndex } = req.body;
    if (!room || !catId || itemIndex === undefined) return res.status(400).json({ error: 'Missing metadata' });
    const safeRoom = room.replace(/[^a-zA-Z0-9]/g, '');
    const safeCat = catId.replace(/[^a-zA-Z0-9]/g, '');
    const safeIndex = parseInt(itemIndex);
    const timestamp = Date.now();
    const uploadDir = path.join(__dirname, 'uploads', safeRoom, safeCat, String(safeIndex));
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const filename = `${timestamp}.webp`;
    const filePath = path.join(uploadDir, filename);
    try {
        await sharp(req.file.buffer)
            .resize({ width: 1280, withoutEnlargement: true })
            .webp({ quality: 70 })
            .toFile(filePath);
        console.log(`[Disk] Saved: ${safeRoom}/${safeCat}/${safeIndex}/${filename}`);
        await updateFirebaseCount(safeRoom, safeCat, safeIndex);
        res.json({ status: 'ok', url: `/${safeRoom}/${safeCat}/${safeIndex}/${filename}` });
    } catch (err) {
        res.status(500).json({ error: 'Image processing failed' });
    }
});

app.get('/albums/:room', (req, res) => {
    const { room } = req.params;
    const safeRoom = room.replace(/[^a-zA-Z0-9]/g, '');
    const rootDir = path.join(__dirname, 'uploads', safeRoom);
    if (!fs.existsSync(rootDir)) return res.json({ room: safeRoom, tree: {} });
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
                            .map(f => `/${safeRoom}/${cat}/${itemIdx}/${f}`);
                        files.sort().reverse();
                        result[cat][itemIdx] = files;
                    }
                });
            }
        });
        res.json({ room: safeRoom, tree: result });
    } catch (err) {
        res.status(500).json({ error: 'Failed to scan directory' });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log("🔐 Auth Guard Active. API Key Required for POST /upload.\n");
});
