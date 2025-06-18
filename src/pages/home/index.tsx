// main home page, add any pages you add to the router!! rahh!!

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="mt-8">
      <div className="flex flex-col items-center justify-center">
        <span className="text-3xl tracking-tighter">
          Welcome to Auralitymixer!
        </span>

        <div className="mt-8 !bg-[#141414] rounded-sm p-5 w-[80%]">
          <span className="text-3xl">Mix your music</span>

          <br />
          <br />

          <span className="text-xl !text-white/80">
            Supply your own music files and mix the vocals and instrumentals
            together to make something new; Tweak the volume, the pitch and
            more!
          </span>
          
          <br />
          <br />

          <Button
            onClick={() => {
              navigate("/mixer");
            }}
            className="rounded-sm cursor-pointer p-4 bg-[var(--text-branding)] hover:bg-[#ee31ee]/80"
          >
            <span className="text-xl !text-white/80">Get Started</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
