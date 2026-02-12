const express = require("express");
const bcrypt = require("bcrypt");
const { getPool, sql } = require("../db");

const router = express.Router();

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

// Registro
router.get("/register", (req, res) => {
  res.render("register", { error: null, values: { full_name: "", email: "" } });
});

router.post("/register", async (req, res) => {
  try {
    const full_name = String(req.body.full_name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!full_name || full_name.length < 3) {
      return res.status(400).render("register", { error: "Nombre inválido (mínimo 3 caracteres).", values: { full_name, email } });
    }
    if (!isEmail(email)) {
      return res.status(400).render("register", { error: "Correo inválido.", values: { full_name, email } });
    }
    if (!password || password.length < 8) {
      return res.status(400).render("register", { error: "La contraseña debe tener mínimo 8 caracteres.", values: { full_name, email } });
    }

    const pool = await getPool();

    // Verifica si ya existe
    const exists = await pool.request()
      .input("email", sql.NVarChar(200), email)
      .query("SELECT TOP 1 id FROM dbo.Users WHERE email = @email");

    if (exists.recordset.length > 0) {
      return res.status(409).render("register", { error: "Ese correo ya está registrado.", values: { full_name, email } });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const inserted = await pool.request()
      .input("full_name", sql.NVarChar(120), full_name)
      .input("email", sql.NVarChar(200), email)
      .input("password_hash", sql.NVarChar(255), password_hash)
      .query(`
        INSERT INTO dbo.Users (full_name, email, password_hash)
        OUTPUT INSERTED.id, INSERTED.full_name, INSERTED.email
        VALUES (@full_name, @email, @password_hash)
      `);

    const user = inserted.recordset[0];
    req.session.user = { id: user.id, full_name: user.full_name, email: user.email };
    return res.redirect("/dashboard");
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).render("register", { error: "Error interno. Revisa consola.", values: { full_name: req.body.full_name || "", email: req.body.email || "" } });
  }
});

// Login
router.get("/login", (req, res) => {
  res.render("login", { error: null, values: { email: "" } });
});

router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!isEmail(email)) {
      return res.status(400).render("login", { error: "Correo inválido.", values: { email } });
    }
    if (!password) {
      return res.status(400).render("login", { error: "Ingresa tu contraseña.", values: { email } });
    }

    const pool = await getPool();

    const result = await pool.request()
      .input("email", sql.NVarChar(200), email)
      .query("SELECT TOP 1 id, full_name, email, password_hash FROM dbo.Users WHERE email = @email");

    if (result.recordset.length === 0) {
      return res.status(401).render("login", { error: "Credenciales incorrectas.", values: { email } });
    }

    const user = result.recordset[0];
    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
      return res.status(401).render("login", { error: "Credenciales incorrectas.", values: { email } });
    }

    req.session.user = { id: user.id, full_name: user.full_name, email: user.email };
    return res.redirect("/dashboard");
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).render("login", { error: "Error interno. Revisa consola.", values: { email: req.body.email || "" } });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

module.exports = router;
