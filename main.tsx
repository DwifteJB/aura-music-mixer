import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./src/css/index.css";

import Router from "./src/components/global/router";
import { Toaster } from "react-hot-toast";

import AppContextProvider from "./src/components/AppContext";

import WelcomeDialog from "./src/components/popups/WelcomePopup";



createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster
      toastOptions={{
        style: {
          backgroundColor: "#1F1F1F",
          color: "white",
          fontFamily: "Inter, sans-serif",
          fontSize: "16px",
        },
      }}
    />
    <AppContextProvider>
      {/* additional */}
      <WelcomeDialog />
      {/* main */}
      <div className="w-screen h-screen main-bg">
        <Router />
      </div>
    </AppContextProvider>
  </StrictMode>,
);
