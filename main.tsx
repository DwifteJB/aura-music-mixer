import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./src/css/index.css";

import Router from "./src/components/global/router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="w-screen h-screen main-bg">
      <Router />
    </div>
  </StrictMode>,
);
