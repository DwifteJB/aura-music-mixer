// communication between backend and frontend!!!

import { CommunicationContextType } from "@/types";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAppContext } from "./AppContext";
import { Notification } from "@/types";
import toast from "react-hot-toast";

const CommunicationContext = createContext<CommunicationContextType>(null!);

export const CommunicationContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const MainContext = useAppContext();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [serverDown, setServerDown] = useState<boolean | null>(null);

  const isServerDown = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_MAIN_SERVER_URL);
    if (!res.ok) {
      setServerDown(true);
    } else {
      setServerDown(false);
    }
    } catch {
      setServerDown(true);
    }
  }

  const connectToSocket = (userKey: string) => {
    const socketURL = import.meta.env.VITE_WS_URL;

    if (!socketURL) {
      console.error("No URL for socket...?");
      return;
    }

    console.log("Connecting to socket at:", socketURL);

    const startSocket = io(socketURL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        key: userKey,
      },
    });

    startSocket.on("connect", () => {
      setNotifications((prev) => [
        ...prev,
        {
          type: "info",
          message: "Connected to the auralitymixer servers.",
          id: `socket-connect`,
          createdAt: new Date().toISOString(),
        },
      ]);
      console.log("Connected to socket server");
      setSocket(startSocket);
    });

    startSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      setSocket(null);
    });

    startSocket.on("disconnect", () => {
      console.log("Disconnected from socket server");
      // RECONNECT!
      startSocket.connect();
      // setSocket(null);
    });

    startSocket.on("mixer_job_created", (data) => {
      console.log("Mixer job created:", data);
    });

    startSocket.on("mixer_job_progress", (data) => {
      console.log("Mixer job progress:", data);
    });

    startSocket.on("notification", (notification: Notification) => {
      console.log("Notification received:", notification);
      const existingNotification = notifications.find(
        (n) => n.id === notification.id,
      );

      if (existingNotification) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, ...notification } : n,
          ),
        );
        return;
      }

      setNotifications((prev) => [...prev, notification]);
    });

    // startSocket.connect();

    setSocket(startSocket);
  };

  useEffect(() => {
    if (serverDown === null) {
      isServerDown();
    } else if (serverDown) {
      toast.error(
        "The server is currently down. Please try again later.",
        {
          duration: 200000
        }
      );
      setNotifications((prev) => [
        ...prev,
        {
          type: "error",
          message: "The server is currently down. Please try again later.",
          id: `server-down`,
          createdAt: new Date().toISOString(),
        },
      ]);
    } else {
      setNotifications((prev) =>
        prev.filter((n) => n.id !== "server-down"),
      );
    }
  }, [serverDown]);

  const ClearNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    if (!MainContext.triedUserAuth || !MainContext.user) {
      setSocket(null);
    }

    if (MainContext.triedUserAuth && MainContext.user && !socket) {
      connectToSocket(MainContext.user.key);
    } else if (MainContext.triedUserAuth && MainContext.user && socket) {
      socket.auth = { key: MainContext.user.key };
      socket.connect();
    }
  }, [MainContext.user, MainContext.triedUserAuth]);

  return (
    <CommunicationContext.Provider
      value={{ socket, setSocket, notifications, ClearNotifications }}
    >
      {children}
    </CommunicationContext.Provider>
  );
};

export const useCommunicationContext = () => {
  const context = useContext(CommunicationContext);
  if (!context) {
    throw new Error(
      "you are not within the CommunicationContextProvider buddy!",
    );
  }
  return context;
};

export default CommunicationContextProvider;
