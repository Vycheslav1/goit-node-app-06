const express = require("express");
const logger = require("morgan");
const cors = require("cors");

const contactsRouter = require("./routes/api/contacts");

const app = express();

const path = require("path");

const formatsLogger = app.get("env") === "development" ? "dev" : "short";
const authRoutes = require("./auth.js");

const userRoutes = require("./routes/api/users.js");

const auth = require("./middlewares/auth.js");

app.use("./auth", authRoutes);
app.use("./routes/api/users.js", auth, userRoutes);

app.use("/avatars", express.static(path.join(_dirname, "public", "avatars")));

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("./routes/api/contacts", auth, contactsRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
