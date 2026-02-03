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

// Serve static files (uploads)
// This allows <img src="http://server/uploads/ROOM/CAT/ITEM/img.webp">
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Multer (Memory Storage for Sharp processing)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper: Ensure directory exists
const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

/**
 * POST /upload
 * Accepts: 'image' (file), 'room' (string), 'catId' (string), 'itemIndex' (int)
 * Effect: Resizes, Compresses to WebP, Saves to disk.
 */
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const { room, catId, itemIndex } = req.body;

        if (!room || !catId || itemIndex === undefined) {
            return res.status(400).json({ error: 'Missing metadata: room, catId, itemIndex' });
        }

        // Sanitize inputs to prevent path traversal
        const safeRoom = room.replace(/[^a-zA-Z0-9]/g, '');
        const safeCat = catId.replace(/[^a-zA-Z0-9]/g, '');
        const safeIndex = parseInt(itemIndex);

        // Define Path: uploads/ROOM/CAT/INDEX/timestamp.webp
        const uploadDir = path.join(__dirname, 'uploads', safeRoom, safeCat, String(safeIndex));
        ensureDir(uploadDir);

        const timestamp = Date.now();
        const filename = `${timestamp}.webp`;
        const filePath = path.join(uploadDir, filename);

        // Process Image with Sharp
        // 1. Resize to max 1280px width (maintaining aspect ratio) without enlarging
        // 2. Convert to WebP with 70% quality
        await sharp(req.file.buffer)
            .resize({ width: 1280, withoutEnlargement: true })
            .webp({ quality: 70 })
            .toFile(filePath);

        console.log(`Saved: ${filePath} (${(req.file.size / 1024).toFixed(1)}KB -> Optimized)`);

        // Return URL
        const fileUrl = `/uploads/${safeRoom}/${safeCat}/${safeIndex}/${filename}`;

        res.json({
            success: true,
            url: fileUrl,
            message: 'Image optimized and saved'
        });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Internal Server Error: ' + error.message });
    }
});

/**
 * GET /albums/:room
 * Returns a tree of all files for a specific room.
 * Used by the Frontend Album view.
 */
app.get('/albums/:room', (req, res) => {
    try {
        const { room } = req.params;
        const safeRoom = room.replace(/[^a-zA-Z0-9]/g, '');
        const roomDir = path.join(__dirname, 'uploads', safeRoom);

        if (!fs.existsSync(roomDir)) {
            return res.json({ room: safeRoom, categories: {} }); // Empty room
        }

        // Structure: { catId: { itemIndex: [ 'url1', 'url2' ] } }
        const result = {};

        const categories = fs.readdirSync(roomDir);

        categories.forEach(catId => {
            const catDir = path.join(roomDir, catId);
            if (fs.statSync(catDir).isDirectory()) {
                result[catId] = {};
                const items = fs.readdirSync(catDir);

                items.forEach(itemIndex => {
                    const itemDir = path.join(catDir, itemIndex);
                    if (fs.statSync(itemDir).isDirectory()) {
                        const files = fs.readdirSync(itemDir)
                            .filter(f => f.endsWith('.webp'))
                            .sort() // Sort by timestamp (filename) usually
                            .reverse() // Newest first
                            .map(f => `/uploads/${safeRoom}/${catId}/${itemIndex}/${f}`);

                        result[catId][itemIndex] = files;
                    }
                });
            }
        });

        res.json({ room: safeRoom, tree: result });

    } catch (error) {
        console.error('Album Error:', error);
        res.status(500).json({ error: 'Failed to list album' });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Uploads available at http://localhost:${PORT}/uploads`);
});
