// user route

import { Express, Request, Response } from "express";

import prisma from "../lib/prisma";

const useUserRoutes = (app: Express) => {
  app.post("/api/v1/user/create", async (req: Request, res: Response) => {
    const username = req.body.username as string;

    if (!username) {
      res.status(400).json({ error: "Username is required" });
      return;
    }
    // generate user!!

    const usernameExists = await prisma.user.findFirst({
      where: {
        name: username,
      },
    });

    if (usernameExists) {
      res.status(400).json({ error: "Username already exists" });
      return;
    }

    const ipAddress =
      req.headers["CF-Connecting-IP"] ||
      req.ip ||
      req.socket.remoteAddress ||
      "this guy has no IP";
    const ipToHex = Buffer.from(ipAddress.toString())
      .toString("hex")
      .substring(0, 6);

    const userAgent = req.headers["user-agent"] || "unknown";

    const userAgentToHex = Buffer.from(userAgent.toString())
      .toString("hex")
      .substring(0, 6);

    const randomKey = Math.random().toString(36).substring(2, 8);

    const key = `${ipToHex}:${userAgentToHex}:${randomKey}`; // kinda reversable, so can be used to identify user so they should have same start / middle !

    const user = await prisma.user.create({
      data: {
        key: key,
        name: username,
      },
    });

    res.cookie("key", key, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // set to true in production
      sameSite: "strict",
      maxAge: 31536000,
    });

    res.status(200).json({
      message: "thy user has risen!",
      user: {
        id: user.id,
        name: user.name,
        key: user.key,
      },
    });
  });

  app.get("/api/v1/user/myMixedSongs", async (req: Request, res: Response) => {
    const key = req.cookies.key;

    if (!key) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        key: key,
      },
      include: {
        mashedSongs: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      message: "heya heres ur songs buster",
      mixedSongs: user.mashedSongs,
    });

    return;
  });

  app.get("/api/v1/user/whoami", async (req: Request, res: Response) => {
    // use "key" from cookies to get user id

    const key = req.cookies.key;

    if (!key) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        key: key,
      },
    });

    res.status(200).json({
      message: "user found!",
      user: user,
    });

    return;
  });

  return true;
};

export default useUserRoutes;
