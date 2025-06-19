import {
  AlertTriangle,
  Bell,
  Home,
  Info,
  Library,
  Search,
  User,
} from "lucide-react";
import { useAppContext } from "../AppContext";

import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { animated, useSpring } from "@react-spring/web";
import { useNavigate } from "react-router";

const Header = () => {
  const Context = useAppContext();
  const navigate = useNavigate();

  const [spring, api] = useSpring(() => ({
    from: { transform: "translateY(-5%)", rotate: "9deg" },
    to: { transform: "translateY(0%)", rotate: "0deg" },
    config: { tension: 200, friction: 20 },
    reset: true,
  }));
  return (
    <div className="w-screen items-center justify-center flex">
      <header
        className="w-[98%] h-16 bg-transparent "
        style={{
          borderBottomColor: "#1F1F1F",
          borderBottomWidth: "1px",
          borderBottomStyle: "ridge",
          borderBottomLeftRadius: "4px",
          borderBottomRightRadius: "4px",
        }}
      >
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center w-1/3 ">
            <Home
              className="mr-4 cursor-pointer"
              onClick={() => {
                navigate("/");
              }}
            />
            <Library className="mr-4" />
            <Search className="mr-4" />
          </div>
          <div className="flex items-center w-1/3 justify-center">
            <img src="logo.png" className="aspect-square w-8 h-8 mr-2" />
            <img src="mixer-full.png" className="h-10" />
            {/* <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "24px",
                fontWeight: "bold",
                letterSpacing: "-0.09em",
              }}
            >
              auralitymixer
            </span> */}
          </div>
          <div className="flex items-center w-1/3 justify-end">
            <Popover
              onOpenChange={() => {
                api.start({
                  from: { transform: "translateY(-5%)", rotate: "9deg" },
                  to: { transform: "translateY(0%)", rotate: "0deg" },
                  config: { tension: 200, friction: 20 },
                  reset: true,
                });
              }}
            >
              <PopoverTrigger asChild>
                <animated.div style={spring}>
                  <Bell className="mr-4 cursor-pointer"></Bell>

                  {Context.notifications.length > 0 && (
                    <span className="absolute cursor-pointer left-[13px] top-[8px] bg-red-500 text-white text-xs rounded-full px-1">
                      {Context.notifications.length}
                    </span>
                  )}
                </animated.div>
              </PopoverTrigger>
              <PopoverContent
                className="bg-black mr-3 mt-2 ibm-plex-mono-regular"
                style={{}}
              >
                <div className="">
                  <span className="tracking-tight ibm-plex-mono-regular">
                    Notifications
                  </span>

                  <div className="w-full border-[#e4dada] border-b h-1" />

                  <div className="pt-2">
                    <div className="flex flex-col gap-2">
                      {Context.notifications.length === 0 ? (
                        <span className="text-sm ibm-plex-mono-regular text-gray-400">
                          You have no notifications.
                        </span>
                      ) : (
                        Context.notifications.map((notification) => (
                          <div className="border-white items-center justify-center p-2 border rounded-2xl">
                            <div className="flex  gap-2 p-2 ">
                              <div className="w-1/5  h-full">
                                {(() => {
                                  switch (notification.type) {
                                    case "pending":
                                      return <Info size={32} color="blue" />;
                                    case "info":
                                      return <Info size={32} color="white" />;
                                    case "error":
                                      return (
                                        <AlertTriangle
                                          size={32}
                                          color="#F80F3A"
                                        />
                                      );
                                    default:
                                      return <Bell size={32} />;
                                  }
                                })()}
                              </div>
                              <div>
                                <span className="text-sm ibm-plex-mono-regular tracking-tight">
                                  {notification.message}
                                </span>
                              </div>
                            </div>

                            <div className="w-full items-center justify-center flex mt-2">
                              <span className="text-xs ibm-plex-mono-regular !text-gray-400">
                                {new Date(
                                  notification.createdAt,
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))
                      )}

                      {Context.notifications.length > 0 && (
                        <div className="w-full items-center justify-center">
                          <span className="text-xs !text-gray-400 cursor-pointer hover:text-white transition-all duration-200">
                            Clear All
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex justify-center items-center bg-[#1F1F1F] rounded-full p-2">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="cursor-pointer">
                    <User fill="white" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="bg-black w-fit mr-3 mt-2">
                  <span className="text-xs ibm-plex-mono-regular tracking-tight">
                    logged in as{" "}
                  </span>
                  <span className="text-xs ibm-plex-mono-regular tracking-tight">
                    {Context.user ? Context.user.name : "no one!!?"}
                  </span>

                  <br />
                  <br />
                  <span
                    className="text-xs cursor-pointer !text-blue-300 ibm-plex-mono-regular tracking-tight"
                    onClick={() => {
                      Context.setUser(null!);
                      localStorage.removeItem("user");
                      localStorage.removeItem("key");
                      localStorage.removeItem("lastUpdatedUser");

                      fetch(
                        `${import.meta.env.VITE_MAIN_SERVER_URL}/api/v1/user/logout`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          credentials: "include",
                        },
                      );
                    }}
                  >
                    sign out!
                  </span>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
