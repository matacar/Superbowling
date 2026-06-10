/**
 * Crea (o actualiza) un usuario del panel de administración.
 *
 * Uso:
 *   node scripts/crear-admin.mjs <correo> <contraseña> [admin|recepcion]
 *
 * Hace dos cosas con la SERVICE ROLE de Supabase:
 *   1. Crea el usuario en Supabase Auth (email + contraseña, ya confirmado).
 *   2. Lo registra en la tabla `admin_users` con su rol (lista blanca del panel).
 *
 * Si el correo ya existe en Auth, solo actualiza/asegura su rol en admin_users.
 * Lee las credenciales de .env.local (no las imprime).
 */

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

function envFromFile(key) {
  const txt = fs.readFileSync(".env.local", "utf8");
  const m = txt.match(new RegExp(`${key}="?([^"\\n]*)`));
  return m ? m[1].trim() : "";
}

const [, , email, password, roleArg] = process.argv;
const role = roleArg ?? "admin";

if (!email || !password) {
  console.error("Uso: node scripts/crear-admin.mjs <correo> <contraseña> [admin|recepcion]");
  process.exit(1);
}
if (!["admin", "recepcion"].includes(role)) {
  console.error('El rol debe ser "admin" o "recepcion".');
  process.exit(1);
}

const url = envFromFile("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = envFromFile("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local.");
  process.exit(1);
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } });

// 1) Crear el usuario en Auth (o detectar que ya existe).
const { data: created, error: createErr } = await db.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (createErr && !/already been registered|already exists/i.test(createErr.message)) {
  console.error("Error creando el usuario:", createErr.message);
  process.exit(1);
}
if (createErr) {
  console.log(`El usuario ${email} ya existía en Auth; se asegura su rol.`);
} else {
  console.log(`Usuario ${email} creado en Auth.`);
}

// 2) Registrar/actualizar el rol en admin_users.
const { error: upsertErr } = await db
  .from("admin_users")
  .upsert({ email, role }, { onConflict: "email" });

if (upsertErr) {
  console.error("Error registrando en admin_users:", upsertErr.message);
  process.exit(1);
}

console.log(`Listo: ${email} → rol "${role}". Ya puede entrar en /admin/login.`);
