// little welcome to the user :3

import { useContext, useState } from "react";
import { AppContext } from "../AppContext";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

import toast from "react-hot-toast";
import { loginWithKey } from "@/lib/api-helper";

const EnterKey = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const Context = useContext(AppContext);
  const [key, setKey] = useState("");
  const [loggingin, setLoggingIn] = useState(false);

  const LOGIN_WITH_DA_KEY = async (key: string) => {
    return new Promise(async (resolve, reject) => {
      if (key.length < 3) {
        return reject(new Error("Key must be at least 3 characters long"));
      }

      if (loggingin) {
        return reject(new Error("Login in progress!!"));
      }

      setLoggingIn(true);

      try {
        const res = await loginWithKey(key);

        if (res?.id && res.key) {
          Context.setUser({
            id: res.id,
            name: res.name,
            key: res.key,
          });

          localStorage.setItem("key", res.key);
          localStorage.setItem("user", JSON.stringify(res));
          localStorage.setItem("lastUpdatedUser", new Date().toISOString());

          setLoggingIn(false);
          return resolve(res);
        } else {
          setLoggingIn(false);
          return reject(new Error("Failed to login with key"));
        }
      } catch (err) {
        setLoggingIn(false);
        return reject(
          err instanceof Error ? err : new Error("An error occurred"),
        );
      }
    });
  };

  const startLoginUser = () => {
    const promise = LOGIN_WITH_DA_KEY(key);

    toast.promise(promise, {
      loading: "Logging in...",
      success: "You have been logged in!",
      error: (err) => {
        setLoggingIn(false);
        return err instanceof Error ? err.message : "An error occurred";
      },
    });

    promise.then((res) => {
      if (res) {
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-black">
        <DialogHeader>
          <DialogTitle>Enter your key!</DialogTitle>
          <DialogDescription className="text-sm">
            <div className="pt-2 pb-2">
              <span className="text-xs pb-1 text-gray-400">Key</span>
              <Input
                onChange={(e) => {
                  setKey(e.target.value.trim());
                }}
                value={key}
                placeholder="2d5b86:6f3c6b:jvw8fp"
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
              startLoginUser();
            }}
            disabled={loggingin}
            className="bg-[var(--text-branding)] hover:bg-[#ee31ee]/80"
          >
            Login
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnterKey;
