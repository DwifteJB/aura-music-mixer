// little welcome to the user :3

import { useContext, useEffect, useState } from "react";
import { AppContext } from "../AppContext";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "motion/react";
import { Button } from "../ui/button";

import UsernameCreate from "./UsernameCreate";

import { Input } from "../ui/input";
const WelcomePopup = () => {
  const Context = useContext(AppContext);
  const [seenBefore, setSeenBefore] = useState(false);
  const [createUsernameOpen, setCreateUsernameOpen] = useState(false);

  useEffect(() => {
    setSeenBefore(Context.triedUserAuth && !!Context.user?.key);
  }, [Context.triedUserAuth]);

  return (
    <>
      <UsernameCreate
        open={createUsernameOpen}
        setOpen={setCreateUsernameOpen}
      />
      <Dialog
        open={!seenBefore}
        onOpenChange={() => {
          setSeenBefore(!seenBefore);
        }}
      >
        <DialogContent showCloseButton={false} className="bg-black">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Welcome to{" "}
              <span
                style={{
                  letterSpacing: "-0.09em",
                }}
              >
                Aurality Mixer!
              </span>
            </DialogTitle>
            <DialogDescription className="text-sm">
              <div className="w-full flex items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <img src="/bg.png" className="relative" />
                  <motion.img
                    animate={{
                      rotate: [0, 360],
                      scale: [0.95, 1],
                      transition: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      },
                    }}
                    src="/blend.png"
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  />
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <p className="text-sm">
              By continuing, you will have an account generated for you, with a
              key that will be used to access your mixes! If you already have a
              key and want to enter it, then use the other button!
              <br />
              <br />
              Thanks! rmfosho :3
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                // add key
                // setSeenBefore(true);
              }}
              className="bg-[#7a0675] hover:bg-[#7a0675]/80"
            >
              Enter Key
            </Button>
            <Button
              onClick={() => {
                //... generate key

                //.. add blah

                // setSeenBefore(true);
                setCreateUsernameOpen(true);
              }}
              className="bg-[var(--text-branding)] hover:bg-[#ee31ee]/80"
            >
              Continue!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WelcomePopup;
