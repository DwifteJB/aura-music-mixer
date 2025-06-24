import { Socket } from "socket.io-client";

export type AppContextType = {
  user?: User;

  setUser: (user: User) => void;

  triedUserAuth: boolean;
};

export type CommunicationContextType = {
  socket: Socket | null;
  setSocket: (socket: Socket | null) => void;

  notifications: Notification[];
  ClearNotifications: () => void;
};

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

export type MixerJobCreated = {
  job_id: string;
  title: string;
  spleeter_jobs: SpleeterJob[];
  status: string;
  total_jobs: number;
  completed_jobs: number;
};

export interface SpleeterJob {
  job_id: string;
  filename: string;
  index: number;
}

export interface MixerJobProgress {
  job_id: string;
  spleeter_job_id: string;
  status: string;
  progress: number;
  overall_status: string;
  completed_jobs: number;
  total_jobs: number;
  vocals_url: string | null;
  instrumental_url: string | null;
  error: string | null;
  timestamp: number;
}
