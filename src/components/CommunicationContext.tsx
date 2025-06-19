// communication between backend and frontend!!!

import { CommunicationContextType } from '@/types';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from "socket.io-client";
import { useAppContext } from './AppContext';

const CommunicationContext = createContext<CommunicationContextType>(null!);

export const CommunicationContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const MainContext = useAppContext();
  const [socket, setSocket] = useState<Socket | null>(null);

  const connectToSocket = (userKey: string) => {
    const socketURL = import.meta.env.VITE_WS_URL;

    if (!socketURL) {
        console.error("No URL for socket...?")
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
        }
    })

    startSocket.on("connect", () => {
      console.log("Connected to socket server");
      setSocket(startSocket);
    });
    
    startSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      setSocket(null);
    });

    startSocket.on("disconnect", () => {
      console.log("Disconnected from socket server");
      setSocket(null);
    });

    // startSocket.connect();

    setSocket(startSocket);
  }

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
    <CommunicationContext.Provider value={{ socket, setSocket }}>
      {children}
    </CommunicationContext.Provider>
  );
}

export const useCommunicationContext = () => {
  const context = useContext(CommunicationContext);
  if (!context) {
    throw new Error("you are not within the CommunicationContextProvider buddy!");
  }
  return context;
};


export default CommunicationContextProvider;