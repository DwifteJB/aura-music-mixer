import type { AppContextType, User, Notification } from "@/types";
import React, { useEffect } from "react";

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
  const [triedUserAuth, setTriedUserAuth] = React.useState(true);
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

  const AUTH_USER = async () => {
    const lastUpdatedUser = Date.parse(
      localStorage.getItem("lastUpdatedUser") || "0",
    );
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (user && lastUpdatedUser) {
      if (lastUpdatedUser + 1000 * 60 * 60 > Date.now()) {
        console.log("set user", user);
        setUser(user);
        setTriedUserAuth(true);
      }
    } else {
      const cookies = document.cookie.split("; ");
      const key = cookies
        .find((cookie) => cookie.startsWith("key="))
        ?.split("=")[1];

      if (key) {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_MAIN_SERVER_URL}/api/v1/user/whoami`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: key,
              },
              credentials: "include",
            },
          );

          if (!res.ok) {
            throw new Error("Failed to fetch user data");
          }

          const data = await res.json();
          if (data.user) {
            console.log("set user 2", data.user);
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("key", key);
            localStorage.setItem("lastUpdatedUser", new Date().toISOString());
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }
      setTriedUserAuth(true);
    }
  };

  useEffect(() => {
    AUTH_USER();
  }, []);

  return (
    <AppContext.Provider
      value={{ user, setUser, notifications, setNotifications, triedUserAuth }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
