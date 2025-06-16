import { BrowserRouter, Routes, Route } from "react-router";

// pages
import Home from "../../pages/home";
import Header from "./header";

const Router = () => {
  return (
    <>
      <Header />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default Router;
