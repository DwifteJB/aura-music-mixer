import { BrowserRouter, Routes, Route } from "react-router";

// pages
import Home from "../../pages/home";
import Header from "./header";
import FourOhFour from "@/pages/404";
import MixerPage from "@/pages/mixer";
import MixPage from "@/pages/mix";
import FinishMix from "@/pages/finishmix";
import LibraryPage from "@/pages/library";

const Router = () => {
  return (
    <>
      <BrowserRouter>
        <Header />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />

          <Route path="/mixer" element={<MixerPage />} />

          <Route path="/finishmix/:id" element={<FinishMix />} />
          <Route path="/mix/:id" element={<MixPage />} />

          <Route path="/library" element={<LibraryPage />} />

          {/* 404 */}
          <Route path="*" element={<FourOhFour />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default Router;
