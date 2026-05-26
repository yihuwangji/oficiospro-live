import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";

let store;
const dataKey = "production";

const professionals = [
  { id: 1, name:"Carlos Molina", role:"Fontanero", city:"Madrid", rating:4.9, reviews:128, price:30, desc:"15 años de experiencia en instalaciones y reparaciones. Urgencias 24h.", emoji:"🔧", available:true, response:"8 min", jobs:312 },
  { id: 2, name:"Ana Rosales", role:"Pintora", city:"Valencia", rating:4.8, reviews:94, price:25, desc:"Especialista en pinturas decorativas, esmaltes y revestimientos. Presupuesto sin compromiso.", emoji:"🎨", available:true, response:"14 min", jobs:187 },
  { id: 3, name:"Javier Ortiz", role:"Jardinero", city:"Barcelona", rating:4.6, reviews:67, price:22, desc:"Diseño y mantenimiento de jardines, poda, césped y sistemas de riego.", emoji:"🌿", available:false, response:"1 h", jobs:122 },
  { id: 4, name:"María Pérez", role:"Cerrajera", city:"Sevilla", rating:4.9, reviews:201, price:35, desc:"Apertura de puertas, cambio de cerraduras y urgencias 24h en Sevilla.", emoji:"🔐", available:true, response:"5 min", jobs:441 },
  { id: 5, name:"Roberto Gil", role:"Albañil", city:"Madrid", rating:4.7, reviews:83, price:28, desc:"Reformas integrales, alicatado, solado, tabiques y obra menor.", emoji:"🧱", available:true, response:"22 min", jobs:156 },
  { id: 6, name:"Laura Sanz", role:"Electricista", city:"Bilbao", rating:4.8, reviews:112, price:32, desc:"Instalaciones eléctricas, cuadros, averías y mantenimiento doméstico.", emoji:"⚡", available:false, response:"45 min", jobs:238 },
  { id: 7, name:"Nuria Campos", role:"Carpintero", city:"Granada", rating:4.7, reviews:58, price:29, desc:"Muebles a medida, puertas, tarimas, armarios y reparaciones de madera.", emoji:"🪵", available:true, response:"18 min", jobs:104 },
  { id: 8, name:"Sergio Vidal", role:"Climatización", city:"Málaga", rating:4.9, reviews:76, price:34, desc:"Instalación y mantenimiento de aire acondicionado, aerotermia y bombas de calor.", emoji:"❄️", available:true, response:"11 min", jobs:169 },
  { id: 9, name:"Irene Costa", role:"Limpieza", city:"Alicante", rating:4.6, reviews:143, price:18, desc:"Limpieza de fin de obra, viviendas turísticas, oficinas y comunidades.", emoji:"🧹", available:true, response:"27 min", jobs:356 },
  { id: 10, name:"Héctor León", role:"Cristalero", city:"Zaragoza", rating:4.8, reviews:49, price:31, desc:"Cambio de cristales, mamparas, escaparates y cerramientos a medida.", emoji:"🪟", available:false, response:"2 h", jobs:91 },
  { id: 11, name:"Paula Rivas", role:"Mudanzas", city:"Murcia", rating:4.7, reviews:88, price:24, desc:"Mudanzas locales, embalaje, montaje de muebles y pequeños portes.", emoji:"🛋️", available:true, response:"16 min", jobs:204 },
  { id: 12, name:"Diego Martín", role:"Reformas", city:"Valladolid", rating:4.8, reviews:131, price:33, desc:"Reformas de baños, cocinas y viviendas completas con coordinación de gremios.", emoji:"🔩", available:true, response:"19 min", jobs:267 },
];

const seed = {
  professionals,
  users: [
    { id: 1, name: "Admin Demo", email: "admin@oficiospro.es", type: "professional", specialty: "Fontanería", city: "Madrid", createdAt: "2026-05-26T08:00:00.000Z" },
  ],
  leads: [
    { id: 1, client: "Marta G.", contact: "marta@email.com", service: "Jardinería", city: "Barcelona", job: "Podar terraza y revisar riego", professional: "Javier Ortiz", status: "new", createdAt: "2026-05-26T09:10:00.000Z" },
    { id: 2, client: "Luis R.", contact: "600 123 456", service: "Fontanería", city: "Madrid", job: "Fuga bajo fregadero", professional: "Carlos Molina", status: "pending", createdAt: "2026-05-26T10:18:00.000Z" },
    { id: 3, client: "Carmen V.", contact: "carmen@email.com", service: "Albañilería", city: "Málaga", job: "Arreglos de patio", professional: "Roberto Gil", status: "closed", createdAt: "2026-05-25T16:30:00.000Z" },
  ],
  content: {
    title: "Encuentra el profesional que necesitas cerca de ti",
    subtitle: "Conectamos a particulares con profesionales verificados en toda España.",
  },
  settings: {
    adminPasswordHash: "",
  },
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

async function readData() {
  store ||= getStore({ name: "oficiospro-data", consistency: "strong" });
  const existing = await store.get(dataKey, { type: "json" });
  if (existing) {
    existing.professionals ||= [];
    existing.leads ||= [];
    existing.users ||= [];
    existing.content ||= {};
    existing.settings ||= { adminPasswordHash: "" };
    return existing;
  }
  await store.setJSON(dataKey, seed);
  return structuredClone(seed);
}

async function writeData(data) {
  store ||= getStore({ name: "oficiospro-data", consistency: "strong" });
  await store.setJSON(dataKey, data);
  return data;
}

async function parseBody(req) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

function requireAdmin(req) {
  const token = req.headers.get("x-admin-token");
  return Boolean(token);
}

function hashSecret(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function isAdminTokenValid(data, token) {
  if (!token) return false;
  if (data.settings?.adminPasswordHash) {
    return hashSecret(token) === data.settings.adminPasswordHash;
  }
  const expected = Netlify.env.get("ADMIN_TOKEN") || "admin123";
  return token === expected;
}

function nextId(items) {
  return Math.max(0, ...items.map((item) => Number(item.id) || 0)) + 1;
}

async function handlePublic(req, context) {
  const data = await readData();
  const action = context.params.action;
  if (req.method === "GET") {
    return json({ professionals: data.professionals, content: data.content });
  }
  if (req.method === "POST" && action === "register") {
    data.users ||= [];
    const body = await parseBody(req);
    if (!body.name || !body.email || !body.password) {
      return json({ error: "name, email and password are required" }, 400);
    }
    const email = String(body.email).trim().toLowerCase().slice(0, 160);
    if (data.users.some((user) => user.email === email)) {
      return json({ error: "email already registered" }, 409);
    }
    const user = {
      id: nextId(data.users),
      name: String(body.name).trim().slice(0, 100),
      email,
      type: body.type === "client" ? "client" : "professional",
      specialty: String(body.specialty || "").slice(0, 80),
      city: String(body.city || "").slice(0, 80),
      createdAt: new Date().toISOString(),
    };
    data.users.unshift(user);
    await writeData(data);
    return json({ user });
  }
  if (req.method === "POST") {
    const body = await parseBody(req);
    if (!body.client || !body.contact || !body.job) {
      return json({ error: "client, contact and job are required" }, 400);
    }
    const professional = data.professionals.find((pro) => pro.name === body.professional);
    const lead = {
      id: nextId(data.leads),
      client: String(body.client).slice(0, 80),
      contact: String(body.contact).slice(0, 120),
      service: professional?.role || String(body.service || "General").slice(0, 80),
      city: professional?.city || String(body.city || "").slice(0, 80),
      job: String(body.job).slice(0, 400),
      professional: professional?.name || String(body.professional || "").slice(0, 80),
      status: "new",
      createdAt: new Date().toISOString(),
      ipCity: context.geo?.city || "",
    };
    data.leads.unshift(lead);
    await writeData(data);
    return json({ lead });
  }
  return json({ error: "Method not allowed" }, 405);
}

async function handleAdmin(req, context) {
  const data = await readData();
  const token = req.headers.get("x-admin-token");
  if (!requireAdmin(req) || !isAdminTokenValid(data, token)) return json({ error: "Unauthorized" }, 401);
  const action = context.params.action;

  if (req.method === "GET") return json(data);

  const body = await parseBody(req);
  if (action === "lead-status" && req.method === "PATCH") {
    data.leads = data.leads.map((lead) => lead.id === Number(body.id) ? { ...lead, status: body.status || lead.status } : lead);
    await writeData(data);
    return json(data);
  }

  if (action === "professional" && req.method === "POST") {
    const pro = {
      id: body.id ? Number(body.id) : nextId(data.professionals),
      name: String(body.name || "").trim(),
      role: String(body.role || "").trim(),
      city: String(body.city || "").trim(),
      rating: Number(body.rating || 4.5),
      reviews: Number(body.reviews || 0),
      price: Number(body.price || 25),
      desc: String(body.desc || "Profesional verificado por OficiosPro.").trim(),
      emoji: String(body.emoji || "🛠️"),
      available: Boolean(body.available),
      response: String(body.response || "20 min"),
      jobs: Number(body.jobs || 0),
    };
    if (!pro.name || !pro.role || !pro.city) return json({ error: "name, role and city are required" }, 400);
    data.professionals = data.professionals.some((item) => item.id === pro.id)
      ? data.professionals.map((item) => item.id === pro.id ? pro : item)
      : [pro, ...data.professionals];
    await writeData(data);
    return json(data);
  }

  if (action === "professional" && req.method === "DELETE") {
    data.professionals = data.professionals.filter((pro) => pro.id !== Number(body.id));
    await writeData(data);
    return json(data);
  }

  if (action === "content" && req.method === "PATCH") {
    data.content = { ...data.content, ...body };
    await writeData(data);
    return json(data);
  }

  if (action === "password" && req.method === "PATCH") {
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    if (!isAdminTokenValid(data, currentPassword)) return json({ error: "Current password is incorrect" }, 401);
    if (newPassword.length < 12) return json({ error: "New password must be at least 12 characters" }, 400);
    data.settings ||= {};
    data.settings.adminPasswordHash = hashSecret(newPassword);
    await writeData(data);
    return json({ ok: true });
  }

  if (action === "reset" && req.method === "POST") {
    await writeData(structuredClone(seed));
    return json(seed);
  }

  return json({ error: "Not found" }, 404);
}

export default async (req, context) => {
  const route = context.params.route;
  if (route === "public") return handlePublic(req, context);
  if (route === "admin") return handleAdmin(req, context);
  return json({ error: "Not found" }, 404);
};

export const config = {
  path: ["/api/:route", "/api/:route/:action"],
};
