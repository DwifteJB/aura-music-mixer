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

const internalNamespace = io.of("/api/internal/socket");
const userNamespace = io.of("/api/user/socket");

internalNamespace.use((socket, next) => {
  const auth = socket.handshake.auth;
  if (auth && auth.key === SPLEETER_KEY) {
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

  socket.on("job_update", (data) => {
    console.log("Job update from service:", data);

    jobUpdates.set(data.job_id, {
      ...data,
      received_at: Date.now(),
    });

    // userNamespace.to(`userid tryna loook at job`).emit('job_progress', data);

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

    // status to user
    // userNamespace.to('user').('service_status', {
    //   service_id: socket.id,
    //   ...data
    // });
  });

  socket.on("disconnect", () => {
    console.log("Internal service disconnected:", socket.id);
    connectedServices.delete(socket.id);

    /// error handling
    // userNamespace.to('user').emit('service_disconnected', {
    //   service_id: socket.id,
    //   timestamp: Date.now()
    // });
  });
});

app.use(Express.json());
app.use(cookies());

const rateLimitMap = new Map<string, {
  url: string;
  count: number;
  timestamp: number;
}[]>();

const routesToLimit = [
 {
  url: "/api/user/upload",
  count: 10, // max requests
  timeWindow: 60 * 1000 * 2, // in milliseconds
 }
]

app.use((req: RequestType, res: ResponseType, next: NextFunctionType) => {
  // ratelimit

  const ipHeader = req.headers["CF-Connecting-IP"];
  const ip =
    typeof ipHeader === "string"
      ? ipHeader
      : Array.isArray(ipHeader)
      ? ipHeader[0]
      : req.socket.remoteAddress || "";

  if (!ip) {
    next();
    return;
  }

  if (req.headers["rmfosho-real-key"] === `Bearer ${process.env.SPLEETER_API_KEY}` ||
      req.headers["rmfosho-real-key"] === process.env.SPLEETER_API_KEY) {
    next();
    return;
  }

  // ignore ws
  if (req.url.startsWith("/api/internal/socket") || req.url.startsWith("/api/user/socket")) {
    next();
    return;
  }

  const rateLimit = routesToLimit.find((route) => req.url.startsWith(route.url));
  if (rateLimit) {
    const currentTime = Date.now();
    const userRateLimits = rateLimitMap.get(ip) || [];

    const validEntries = userRateLimits.filter(
      (entry) => entry.url === rateLimit.url && currentTime - entry.timestamp < rateLimit.timeWindow
    );

    const currentCount = validEntries.length;
    if (currentCount >= rateLimit.count) {
      res.status(429).json({
        error: "Rate limit exceeded. Please try again later.",
      });
      return;

    }

    validEntries.push({ url: rateLimit.url, count: currentCount + 1, timestamp: currentTime });
    rateLimitMap.set(ip, validEntries);
  }

  next();
  return;


  
})

// cors
app.use((req: RequestType, res: ResponseType, next: NextFunctionType) => {
  console.log("cors", req.headers.origin, process.env.FRONTEND_URL);
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

userRoutes(app);

app.get("/", (req: RequestType, res: ResponseType) => {
  res.send("Hello from the backend!");
});

// start
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`ITS RUNNING!!! RAHH localhost:${PORT}`);
});
