import { BrowserRouter, Routes, Route } from "react-router";

// pages
import Home from "../../pages/home";
import Header from "./header";
import FourOhFour from "@/pages/404";
import MixerPage from "@/pages/mixer";

const Router = () => {
  return (
    <>
      <BrowserRouter>
        <Header />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />

          <Route path="/mixer" element={<MixerPage />} />
          <Route path="/mix" element={<MixerPage />} />

          {/* 404 */}
          <Route path="*" element={<FourOhFour />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default Router;
