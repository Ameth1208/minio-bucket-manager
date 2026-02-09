import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

const router = Router();

router.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body;

  const adminUser = config.adminUser.toString().trim();
  const adminPass = config.adminPass.toString().trim();

  if (username === adminUser && password === adminPass) {
    console.log("Credentials valid, generating token...");
    const token = jwt.sign({ user: username }, config.jwtSecret, {
      expiresIn: "1h",
    });
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: false, // Set to false for local testing without HTTPS
      sameSite: "lax",
    });
    console.log("Token set in cookie");
    res.json({ success: true });
  } else {
    console.log("Invalid credentials");
    res.status(401).json({ error: "Invalid credentials" });
  }
});

router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("auth_token");
  res.json({ success: true });
});

export default router;
