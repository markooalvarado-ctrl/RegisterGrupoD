require("dotenv").config();

const path = require("path");
const express = require("express");
const session = require("express-session");

const authRoutes = require("./routes/auth");
const { requireAuth } = require("./middleware/requireAuth");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 6, // 6 horas
    },
  })
);

// Rutas base
app.get("/", (req, res) => {
  if (req.session?.user) return res.redirect("/dashboard");
  return res.redirect("/login");
});

app.use("/", authRoutes);

app.get("/dashboard", requireAuth, (req, res) => {
  res.render("dashboard", { user: req.session.user });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`✅ App corriendo en http://localhost:${PORT}`);
});
