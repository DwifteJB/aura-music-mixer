import { whoAmI } from "@/lib/api-helper";
import type { AppContextType, User, Notification } from "@/types";
import React, { useEffect } from "react";

export const AppContext = React.createContext<AppContextType>(null!);

// i hate having to do const AppContext = useContext(AppContextNotReal), rather this!!
// looking back on this, i used useAppContext ONCE. so far lmfaoo
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
    const lastUpdatedUser = new Date(
      Number(localStorage.getItem("lastUpdatedUser") || 0),
    );
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    console.log("user", user);
    console.log("lastUpdatedUser", lastUpdatedUser);

    if (user && lastUpdatedUser) {
      if (lastUpdatedUser.getTime() + 1000 * 60 * 60 > Date.now()) {
        console.log("set user", user);
        setUser(user);
        setTriedUserAuth(true);
      } else {
        console.log("user data is outdated, fetching new user data");
        try {
          const data = await whoAmI(user.key);

          if (data) {
            console.log("set user 1", data);
            setUser(data);
            localStorage.setItem("user", JSON.stringify(data));
            localStorage.setItem("key", user.key);
            localStorage.setItem(
              "lastUpdatedUser",
              Number(new Date()).toString(),
            );
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }
    } else {
      const cookies = document.cookie.split("; ");
      const key = cookies
        .find((cookie) => cookie.startsWith("key="))
        ?.split("=")[1];

      console.log("key in storage?", key);

      if (key) {
        try {
          const data = await whoAmI(key);
          if (data) {
            console.log("set user 2", data);
            setUser(data);
            localStorage.setItem("user", JSON.stringify(data));
            localStorage.setItem("key", key);
            localStorage.setItem(
              "lastUpdatedUser",
              Number(new Date()).toString(),
            );
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
