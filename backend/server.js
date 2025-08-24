import express from "express";
import cors from "cors";
import multer from "multer";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve frontend build if you deploy both together
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "..", "frontend"))); // for dev convenience

// Data store (very simple JSON file)
const DATA_FILE = path.join(__dirname, "data", "photos.db.json");
const PHOTOS_DIR = path.join(__dirname, "public", "photos");
fs.mkdirSync(PHOTOS_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf-8");

function readDB(){
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch (e){
    return [];
  }
}
function writeDB(arr){
  fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), "utf-8");
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PHOTOS_DIR),
  filename: (req, file, cb) => {
    const id = nanoid(8);
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${id}${ext}`);
  }
});
const upload = multer({ storage });

// List photos
app.get("/api/photos", (req, res) => {
  const items = readDB();
  // Map to public URLs
  const mapped = items.map(p => ({
    id: p.id,
    caption: p.caption,
    tags: p.tags || [],
    url: `/photos/${p.filename}`
  }));
  res.json(mapped);
});

// Upload endpoint (multipart/form-data with field "photo", optional fields: caption, tags csv)
app.post("/api/upload", upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "photo file required" });
  const caption = req.body.caption || req.file.originalname.replace(/\.[^.]+$/, "");
  const tags = (req.body.tags || "").split(",").map(s=>s.trim()).filter(Boolean);
  const rec = {
    id: nanoid(10),
    filename: req.file.filename,
    originalName: req.file.originalname,
    caption, tags,
    uploadedAt: new Date().toISOString()
  };
  const db = readDB(); db.unshift(rec); writeDB(db);
  res.json({ ok:true, photo: { ...rec, url: `/photos/${rec.filename}` } });
});

// Health check
app.get("/api/health", (req,res) => res.json({ ok:true }));

app.listen(PORT, () => console.log(`Photos backend running on http://localhost:${PORT}`));
