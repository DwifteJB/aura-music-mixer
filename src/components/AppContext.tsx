import type { AppContextType, User, Notification } from "@/types";
import React from "react";

export const AppContext = React.createContext<AppContextType>(null!);

// i hate having to do const AppContext = useContext(AppContextNotReal), rather this!!
export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    window.location.reload(); // no!
    throw new Error(
      "provider not found for the context!! this should not happen!!!",
    );
  }
  return context;
};
export const AppContextProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [user, setUser] = React.useState<User>(null!);
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      type: "info",
      message: "Welcome to Aura Music Mixer!",
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    },
    {
      type: "error",
      message: "error!!llll",
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    },
  ]);

  return (
    <AppContext.Provider
      value={{ user, setUser, notifications, setNotifications }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
