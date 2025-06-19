import { Socket } from "socket.io-client";

export type AppContextType = {
  user?: User;
  notifications: Notification[];

  setUser: (user: User) => void;
  setNotifications: (notifications: Notification[]) => void;

  triedUserAuth: boolean;
};

export type CommunicationContextType = {
  socket: Socket | null;
  setSocket: (socket: Socket | null) => void;
}

export type User = {
  id: string;
  key: string;
  name?: string;
};

export type Notification = {
  type: "info" | "pending" | "error";
  message: string;
  id: string;
  createdAt: string;
};

