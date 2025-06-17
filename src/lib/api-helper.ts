import type { User } from "@/types";

export const getUserFromKey = async (key: string): Promise<User | null> => {
  const response = await fetch(
    `${process.env.MAIN_SERVER_URL}/api/v1/user/whoami`,
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

export const createUser = async (username: string): Promise<User | null> => {
  const response = await fetch(
    `${process.env.MAIN_SERVER_URL}/api/v1/user/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to create user");
  }

  const res = await response.json();

  return res.user || null;
};
