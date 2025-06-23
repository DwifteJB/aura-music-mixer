import { Express, Request, Response } from "express";

import prisma from "../lib/prisma";

const mixerRoutes = (app: Express) => {
  app.get("/api/v1/job/status", async (req: Request, res: Response) => {
    const key = req.data?.authKey as string;

    if (!key) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { key: key },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const jobId = req.query.jobId as string;

    if (!jobId) {
      res.status(400).json({ error: "Job ID is required" });
      return;
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        user: true,
      },
    });

    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    if (!job?.userId || job.userId !== user.id) {
      res.status(403).json({ error: "unauthorized" });
      return;
    }

    res.status(200).json({
      message: "Job status retrieved successfully",
      job: job,
    });
  });
};

export default mixerRoutes;
