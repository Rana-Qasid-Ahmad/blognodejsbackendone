const express = require("express");
const bcrypt = require("bcrypt");
const { client } = require("./db");
const { generateToken } = require("./auth");

const loginRouter = express.Router();

loginRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const userQuery = "SELECT * FROM Users WHERE username = $1";
    const result = await client.query(userQuery, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const hashedPassword = result.rows[0].password;

    // Compare the entered password with the hashed password
    const passwordMatch = await bcrypt.compare(password, hashedPassword);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const userId = result.rows[0].id;
    const token = generateToken(userId);

    res.json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = loginRouter;
