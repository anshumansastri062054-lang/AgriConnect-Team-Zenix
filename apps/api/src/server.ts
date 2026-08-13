import express from "express";
import cors from "cors";
import helmet from "helmet";
import crypto from "node:crypto";
import { z } from "zod";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") ?? "*", credentials: true }));
app.use(express.json({ limit: "1mb" }));

const lands = [
  { id: "LAND-001", title: "Verified 2.4-acre loamy field", location: "Ganjam, Odisha", area: 2.4, price: 18000, irrigation: "Available", soil: "Loamy", ph: 6.7, verified: true },
  { id: "LAND-002", title: "1.8-acre irrigated farmland", location: "Berhampur, Odisha", area: 1.8, price: 15000, irrigation: "Available", soil: "Sandy loam", ph: 6.4, verified: true }
];

const equipment = [
  { id: "EQ-001", name: "Mahindra Tractor", type: "Tractor", pricePerHour: 1200, location: "Ganjam", available: true },
  { id: "EQ-002", name: "Rotavator", type: "Rotavator", pricePerHour: 650, location: "Berhampur", available: true },
  { id: "EQ-003", name: "Power Sprayer", type: "Sprayer", pricePerHour: 300, location: "Ganjam", available: true }
];

const cropRules = {
  Paddy: { ph: [5.5, 7.5], moisture: 0.9, irrigation: true, season: ["Kharif"], weights: { ph: 25, npk: 25, moisture: 15, irrigation: 10, season: 15, rotation: 10 } },
  Maize: { ph: [5.8, 7.0], moisture: 0.65, irrigation: true, season: ["Kharif", "Rabi"], weights: { ph: 25, npk: 25, moisture: 15, irrigation: 10, season: 15, rotation: 10 } },
  Groundnut: { ph: [6.0, 7.0], moisture: 0.55, irrigation: false, season: ["Kharif"], weights: { ph: 25, npk: 25, moisture: 15, irrigation: 10, season: 15, rotation: 10 } }
};

function scoreCrop(input: any, crop: keyof typeof cropRules) {
  const rule = cropRules[crop];
  let score = 0;
  const reasons: string[] = [];
  const limitations: string[] = [];

  if (input.ph >= rule.ph[0] && input.ph <= rule.ph[1]) { score += 25; reasons.push("pH is suitable."); }
  else limitations.push("Soil pH is outside the preferred range.");

  if (input.nitrogen !== "Low" && input.phosphorus !== "Low" && input.potassium !== "Low") { score += 25; reasons.push("NPK profile is broadly compatible."); }
  else limitations.push("Nutrient profile needs attention.");

  if (Math.abs(Number(input.moisture) - rule.moisture) <= 0.25) { score += 15; reasons.push("Moisture is suitable."); }
  else limitations.push("Moisture needs management.");

  if (input.irrigation === rule.irrigation || (!rule.irrigation && input.irrigation)) { score += 10; reasons.push("Irrigation availability matches."); }
  else limitations.push("Irrigation availability may constrain cultivation.");

  if (rule.season.includes(input.season)) { score += 15; reasons.push("Season is suitable."); }
  else limitations.push("Season is not the preferred window.");

  score += 10;
  reasons.push("Previous-crop rotation is acceptable for this demo.");

  return { crop, score, reasons, limitations };
}

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "AgriConnect API" }));

app.post("/api/auth/mobile/send-otp", (_req, res) => {
  res.json({ success: true, message: "Demo OTP sent.", demoOnly: true });
});

app.post("/api/auth/mobile/verify-otp", (req, res) => {
  const schema = z.object({ mobile: z.string().min(10), otp: z.string().length(6) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success || parsed.data.otp !== "123456") return res.status(401).json({ error: "Invalid demo OTP" });
  res.json({ success: true, farmerId: "DEMO-FARMER-001", message: "Demo authentication successful." });
});

app.get("/api/lands", (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const result = lands.filter(l => !q || `${l.title} ${l.location} ${l.soil}`.toLowerCase().includes(q));
  res.json(result);
});

app.post("/api/lands/:id/request", (req, res) => {
  res.status(201).json({ id: `RR-${crypto.randomBytes(4).toString("hex").toUpperCase()}`, landId: req.params.id, status: "PENDING", createdAt: new Date().toISOString() });
});

app.get("/api/equipment", (_req, res) => res.json(equipment));

app.post("/api/equipment/:id/book", (req, res) => {
  const hours = Math.max(1, Number(req.body.hours || 1));
  const item = equipment.find(e => e.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Equipment not found" });
  res.status(201).json({
    bookingId: `BK-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
    equipmentId: item.id,
    equipment: item.name,
    hours,
    total: hours * item.pricePerHour,
    status: "CONFIRMED"
  });
});

app.post("/api/recommendations", (req, res) => {
  const schema = z.object({
    ph: z.number(),
    nitrogen: z.enum(["Low", "Medium", "High"]),
    phosphorus: z.enum(["Low", "Medium", "High"]),
    potassium: z.enum(["Low", "Medium", "High"]),
    moisture: z.number().min(0).max(1),
    irrigation: z.boolean(),
    season: z.string()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid soil inputs", details: parsed.error.flatten() });
  const results = (Object.keys(cropRules) as Array<keyof typeof cropRules>).map(c => scoreCrop(parsed.data, c)).sort((a, b) => b.score - a.score);
  res.json({ informational: true, results });
});

app.post("/api/tokens/generate", (req, res) => {
  const schema = z.object({ farmerId: z.string(), crop: z.string(), quantityKg: z.number().positive(), grade: z.string(), centre: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid procurement data" });
  const tokenId = `ACT-2026-08-${String(Math.floor(100000 + Math.random() * 899999))}`;
  const payload = `${tokenId}|${parsed.data.farmerId}|${parsed.data.crop}|${parsed.data.quantityKg}|${parsed.data.grade}|${parsed.data.centre}`;
  const hash = crypto.createHash("sha256").update(payload).digest("hex");
  res.status(201).json({ tokenId, verificationHash: hash, status: "VERIFIED", demoOnly: true });
});

app.get("/api/tokens/:id/verify", (req, res) => {
  res.json({ valid: true, tokenId: req.params.id, status: "VERIFIED", crop: "Paddy", quantityKg: 1850, grade: "A", centre: "Ganjam Centre #04", paymentStatus: "PROCESSED", demoOnly: true });
});

app.listen(port, () => console.log(`AgriConnect API listening on http://localhost:${port}`));
