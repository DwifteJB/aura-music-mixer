import type { User } from "@/types";

export const getUserFromKey = async (key: string): Promise<User | null> => {
  const response = await fetch(
    `${import.meta.env.VITE_MAIN_SERVER_URL}/api/v1/user/whoami`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${key}`,
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }

  const res = await response.json();

  return res.user || null;
};

export const loginWithKey = async (key: string): Promise<User | null> => {
  const response = await fetch(
    `${import.meta.env.VITE_MAIN_SERVER_URL}/api/v1/user/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key }),
      credentials: "include",
    },
  );

  const res = await response.json();
  if (!response.ok) {
    throw new Error(res.error || "Failed to login with key");
  }

  return res.user || null;
};

export const createUser = async (username: string): Promise<User | null> => {
  const response = await fetch(
    `${import.meta.env.VITE_MAIN_SERVER_URL}/api/v1/user/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
      credentials: "include",
    },
  );

  const res = await response.json();

  if (!response.ok) {
    throw new Error(res.error || "Failed to create user");
  }

  return res.user || null;
};
