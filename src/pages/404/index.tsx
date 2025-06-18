// 404 :D

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

import { motion } from "motion/react";


const FourOhFour = () => {
  const navigate = useNavigate();
  return <div>
    <div className="flex flex-col items-center justify-center -mt-32 w-screen h-screen">
        <motion.img src="/blend.png" className="w-[400px] h-[400px]" animate={{
            rotate: [0, 360],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "linear",
            },
        }} />
      <span className="text-3xl tracking-tighter">404s and heartbreaks</span>
      <span className="text-xl tracking-tighter">you should not be here, was this a mistake?</span>
        <Button onClick={() => {
            navigate("/");
        }} className="rounded-sm cursor-pointer p-4 bg-[var(--text-branding)] hover:bg-[#ee31ee]/80 mt-8">
            <span className="text-xl !text-white/80">
                head back
            </span>
        </Button>
     
    </div>
  </div>;
};

export default FourOhFour;
