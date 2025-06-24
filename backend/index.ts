import dotenv from "dotenv";
import Express, {
  Request as RequestType,
  Response as ResponseType,
  NextFunction as NextFunctionType,
} from "express";

import http from "http";
import { Server as SocketIOServer } from "socket.io";

import userRoutes from "./src/routes/user";

import cookies from "cookie-parser";

import prisma from "./src/lib/prisma";

import multer from "multer";

declare module "express-serve-static-core" {
  interface Request {
    data?: {
      authKey: string | string[];
    };
  }
}

dotenv.config({
  path: "../.env",
});

const app = Express();

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const SPLEETER_KEY =
  process.env.SPLEETER_SERVER_KEY || "your_spleeter_key_here";

const jobUpdates = new Map();
const connectedServices = new Map();
const connectedUsers = new Map();

const internalNamespace = io.of("/api/internal/socket");
const userNamespace = io.of("/api/user/socket");

userNamespace.use(async (socket, next) => {
  const auth = socket.handshake.auth;
  if (auth && auth.key) {
    const user = await prisma.user.findUnique({
      where: {
        key: auth.key,
      },
    });

    if (!user) {
      console.log(
        "Unauthorized user connection attempt :(",
        socket.handshake.auth,
        socket.handshake.address,
      );
      return next(new Error("Unauthorized"));
    }

    socket.data.user = user;

    connectedUsers.set(user.id, socket.id);

    console.log("Authenticated user connection:", user.id, socket.id);

    next();
  } else {
    console.log(
      "Unauthorized user connection attempt :(",
      socket.handshake.auth,
      socket.handshake.address,
    );
    next(new Error("Unauthorized"));
  }

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    const userWithSocket = Array.from(connectedUsers.entries()).find(
      ([, id]) => id === socket.id,
    );
    if (userWithSocket) {
      const [userId] = userWithSocket;
      connectedUsers.delete(userId);
      console.log("Removed user from connected users:", userId);
    }
  });
});

// either i have the user id sent within the request => back to user from spleeter
// or i can have the user id stored in the actual request. probably better 1st one.

internalNamespace.use((socket, next) => {
  const auth = socket.handshake.auth;
  if (auth && auth.key === SPLEETER_KEY) {
    console.log("socket tryna connect...", socket.handshake.auth);
    next();
  } else {
    console.log(
      "Unauthorized internal connection attempt :(",
      socket.handshake.auth,
      socket.handshake.address,
    );
    next(new Error("Unauthorized"));
  }
});
internalNamespace.on("connection", (socket) => {
  console.log("Internal service connected:", socket.id);

  const serviceInfo = socket.handshake.auth;
  connectedServices.set(socket.id, {
    ...serviceInfo,
    connected_at: Date.now(),
    socket_id: socket.id,
  });

  socket.on("job_update", async (data) => {
    console.log("Job update from service:", data);

    jobUpdates.set(data.job_id, {
      ...data,
      received_at: Date.now(),
    });

    try {
      const job = await prisma.job.findFirst({
        where: {
          jobIds: {
            has: data.job_id,
          },
        },
        include: {
          user: true,
        },
      });

      if (job) {
        const allJobUpdates = job.jobIds.map(
          (id) => jobUpdates.get(id) || { job_id: id, status: "queued" },
        );

        const completedCount = allJobUpdates.filter(
          (j) => j.status === "completed",
        ).length;
        const failedCount = allJobUpdates.filter(
          (j) => j.status === "failed",
        ).length;
        const totalCount = job.jobIds.length;

        let overallStatus = "processing";
        if (completedCount + failedCount === totalCount) {
          overallStatus =
            failedCount > 0 ? "completed_with_errors" : "completed";
        }

        if (data.status === "completed") {
          const currentResults = (job.results as any) || {};
          currentResults[data.job_id] = {
            vocals_url: data.vocals_url,
            instrumental_url: data.instrumental_url,
            completed_at: new Date(),
          };

          await prisma.job.update({
            where: { id: job.id },
            data: {
              results: currentResults,
              status: overallStatus,
              completedJobs: completedCount,
            },
          });
        }

        const userSocketId = connectedUsers.get(job.userId);
        if (userSocketId) {
          userNamespace.to(userSocketId).emit("mixer_job_progress", {
            job_id: job.id,
            spleeter_job_id: data.job_id,
            status: data.status,
            progress: data.progress,
            overall_status: overallStatus,
            completed_jobs: completedCount,
            total_jobs: totalCount,
            vocals_url: data.vocals_url,
            instrumental_url: data.instrumental_url,
            error: data.error,
            timestamp: data.timestamp,
          });
        }
      }
    } catch (error) {
      console.error("Error updating job:", error);
    }

    if (data.status === "completed") {
      console.log(`Job ${data.job_id} completed`);
    } else if (data.status === "failed") {
      console.error(`Job ${data.job_id} failed:`, data.error);
    }
  });

  socket.on("service_status", (data) => {
    console.log("Service status update:", data);
    connectedServices.set(socket.id, {
      ...connectedServices.get(socket.id),
      ...data,
      last_update: Date.now(),
    });
  });

  socket.on("disconnect", () => {
    console.log("Internal service disconnected:", socket.id);
    connectedServices.delete(socket.id);
  });
});

const upload = multer({
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB per file
  storage: multer.memoryStorage(),
});

app.use(Express.json());
app.use(cookies());

// cors
app.use((req: RequestType, res: ResponseType, next: NextFunctionType) => {
  const origin = req.headers.origin;
  if (req.headers.origin) {
    if (
      origin === process.env.FRONTEND_URL ||
      origin === process.env.SPLEETER_API_URL
    ) {
      console.log("CORS: Allowing origin", origin);
      res.header("Access-Control-Allow-Origin", origin);
    } else {
      res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    }
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  next();
});

const rateLimitMap = new Map<
  string,
  {
    url: string;
    count: number;
    timestamp: number;
  }[]
>();

const routesToLimit = [
  {
    url: "/api/v1/user/mixer",
    count: 1, // max requests
    timeWindow: 60 * 1000 * 2, // in milliseconds
  },
];

app.use((req: RequestType, res: ResponseType, next: NextFunctionType) => {
  // set auth key as data

  // this works if the domains are diff between the frontend and backend, use the req header instead!

  let userLoginKey: string = req.cookies.key || req.headers.authorization;

  if (userLoginKey && userLoginKey.startsWith("Bearer ")) {
    userLoginKey = userLoginKey.replace("Bearer ", "");
  }

  if (userLoginKey) {
    req.data = {
      authKey: userLoginKey,
    };
  }
  // ratelimit

  if (req.method === "OPTIONS") {
    next();
    return;
  }

  const ipHeader = req.headers["CF-Connecting-IP"];
  const ip =
    typeof ipHeader === "string"
      ? ipHeader
      : Array.isArray(ipHeader)
        ? ipHeader[0]
        : req.socket.remoteAddress || "";

  if (!ip) {
    // ??!!!?? no ip
    next();
    return;
  }

  if (
    req.headers["rmfosho-real-key"] &&
    (req.headers["rmfosho-real-key"] ===
      `Bearer ${process.env.SPLEETER_API_KEY}` ||
      req.headers["rmfosho-real-key"] === process.env.SPLEETER_API_KEY)
  ) {
    console.log("Ignoring rate limit for Spleeter API key");
    next();
    return;
  }

  // ignore ws
  if (
    req.url.startsWith("/api/internal/socket") ||
    req.url.startsWith("/api/user/socket")
  ) {
    console.log("Ignoring WebSocket connection for rate limiting");
    next();
    return;
  }

  // if options, ignore

  const rateLimit = routesToLimit.find((route) =>
    req.url.startsWith(route.url),
  );

  console.log("ratelimit", rateLimit);

  if (rateLimit) {
    const currentTime = Date.now();
    const userRateLimits = rateLimitMap.get(ip) || [];

    const validEntries = userRateLimits.filter(
      (entry) =>
        entry.url === rateLimit.url &&
        currentTime - entry.timestamp < rateLimit.timeWindow,
    );

    const currentCount = validEntries.length;
    if (currentCount >= rateLimit.count) {
      res.status(429).json({
        error: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil(
          (rateLimit.timeWindow - (currentTime - validEntries[0].timestamp)) /
            1000,
        ),
      });
      return;
    }

    validEntries.push({
      url: rateLimit.url,
      count: currentCount + 1,
      timestamp: currentTime,
    });
    rateLimitMap.set(ip, validEntries);
  }

  next();
  return;
});

userRoutes(app);

app.get("/", (req: RequestType, res: ResponseType) => {
  res.send(":3");
});

// MIXER ROUTES!!
app.post("/api/v1/user/mixer", upload.array("audio", 2), async (req, res) => {
  const key = req.data?.authKey as string;

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

  const foundSocketId = connectedUsers.get(user.id);

  if (!foundSocketId) {
    res.status(404).json({ error: "Not connected to socket." });
    return;
  }

  const files = req.files as globalThis.Express.Multer.File[];

  if (!files || files.length !== 2) {
    res.status(400).json({ error: "Please provide exactly 2 audio files" });
    return;
  }

  const jobIdsTotal: string[] = [];

  const promises = files.map(async (file, index) => {
    const formData = new FormData();
    formData.append("audio_file", new Blob([file.buffer]), file.originalname);

    const response = await fetch(`${process.env.SPLEETER_API_URL}/submit`, {
      method: "POST",
      headers: {
        "rmfosho-real-key": SPLEETER_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to submit job");
    }

    const result = await response.json();

    jobIdsTotal.push(result.job_id);
    console.log("Job submitted:", result.job_id);

    return {
      job_id: result.job_id,
      filename: file.originalname,
      index: index,
    };
  });

  try {
    const results = await Promise.all(promises);

    console.log("ids", jobIdsTotal);

    const job = await prisma.job.create({
      data: {
        userId: user.id,
        jobIds: jobIdsTotal,
        title: files.map((file) => file.originalname).join(" & "),
        status: "processing",
        totalJobs: 2,
        completedJobs: 0,
        results: {},
      },
    });

    console.log("Job created:", job.id);

    userNamespace.to(foundSocketId).emit("mixer_job_created", {
      job_id: job.id,
      title: job.title,
      spleeter_jobs: results,
      status: "processing",
      total_jobs: 2,
      completed_jobs: 0,
    });

    res.status(200).json({
      message: "Mixer job created successfully",
      job_id: job.id,
      title: job.title,
      spleeter_jobs: results,
      status: "processing",
    });
  } catch (error) {
    console.error("Error creating mixer job:", error);
    res.status(500).json({ error: "Failed to create mixer job" });
  }
});

app.get("/api/v1/job/status", async (req, res) => {
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

app.get(
  "/api/v1/user/mixer/:jobId/download/:spleeterJobId/:fileType",
  async (req, res) => {
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

    const job = await prisma.job.findUnique({
      where: { id: req.params.jobId },
    });

    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    if (job.userId !== user.id) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    if (!job.jobIds.includes(req.params.spleeterJobId)) {
      res
        .status(404)
        .json({ error: "Spleeter job not found in this mixer job" });
      return;
    }

    const fileType = req.params.fileType;
    if (!["vocals", "instrumental"].includes(fileType)) {
      res.status(400).json({ error: "Invalid file type" });
      return;
    }

    try {
      const filename = `${req.params.spleeterJobId}_${fileType}.mp3`;
      const response = await fetch(
        `${process.env.SPLEETER_API_URL}/download/${req.params.spleeterJobId}/${filename}`,
        {
          headers: {
            "rmfosho-real-key": SPLEETER_KEY,
          },
        },
      );

      if (!response.ok) {
        res.status(404).json({ error: "File not found" });
        return;
      }

      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );

      response.body?.pipe(res);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ error: "Failed to download file" });
    }
  },
);

// start
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`ITS RUNNING!!! RAHH localhost:${PORT}`);

  console.log("checking spleeter access...");

  try {
    const canAccessSpleeter = await fetch(
      `${process.env.SPLEETER_API_URL}/health`,
      {
        method: "GET",
        headers: {
          "rmfosho-real-key": `${process.env.SPLEETER_SERVER_KEY}`,
        },
      },
    );

    const res = await canAccessSpleeter.json();

    if (res.status) {
      console.log("able to access spleeter");
    } else {
      console.log(res.ok, "nope!");
    }
  } catch (err: Error | unknown) {
    console.error(
      "Error checking spleeter access:",
      err instanceof Error ? err.message : err,
    );
  }
});
