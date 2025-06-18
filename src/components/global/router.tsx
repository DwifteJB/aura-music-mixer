import { BrowserRouter, Routes, Route } from "react-router";

// pages
import Home from "../../pages/home";
import Header from "./header";
import FourOhFour from "@/pages/404";

const Router = () => {
  return (
    <>
      <Header />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* 404 */}
          <Route path="*" element={<FourOhFour />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default Router;
