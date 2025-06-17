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
import { Input } from "../ui/input";

import toast from "react-hot-toast";

const UsernameCreate = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const Context = useContext(AppContext);
  const [username, setUsername] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);

  const CREATE_USERRR = async (username: string) => {
    if (username.length < 3 || username.length > 16) {
      toast.error(
        username.length < 3
          ? "Username must be at least 3 characters long!"
          : "Username must be less than 16 characters long!",
      );
      return;
    }

    if (creatingUser) {
      toast.error("you are already being made!!!");
      return;
    }

    setCreatingUser(true);
  };

  const startCreateUser = () => {
    const promise = CREATE_USERRR(username);

    toast.promise(promise, {
      loading: "Creating user...",
      success: "Your profile has been made!¬",
      error: (err) => {
        setCreatingUser(false);
        return err instanceof Error ? err.message : "Failed to create user!";
      },
    });
  };

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="bg-black">
        <DialogHeader>
          <DialogTitle>Select your username!</DialogTitle>
          <DialogDescription className="text-sm">
            <div className="pt-2 pb-2">
              <span className="text-xs pb-1 text-gray-400">Username</span>
              <Input
                onChange={(e) => {
                  setUsername(
                    e.target.value.trim().replace(/[^a-zA-Z0-9_]/g, ""),
                  );
                }}
                value={username}
                placeholder="rmfosho"
              />
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            onClick={() => {
              //... generate key

              //.. add blah

              //   setSeenBefore(true);
              startCreateUser();
            }}
            disabled={creatingUser}
            className="bg-[var(--text-branding)] hover:bg-[#ee31ee]/80"
          >
            Create Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UsernameCreate;
