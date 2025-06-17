export type AppContextType = {
  user?: User;
  notifications: Notification[];

  setUser: (user: User) => void;
  setNotifications: (notifications: Notification[]) => void;

  triedUserAuth: boolean;
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
