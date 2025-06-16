import { Headphones, Home, Library, Search, User } from "lucide-react";

const Header = () => {
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
            <Home className="mr-4" />
            <Library className="mr-4" />
            <Search className="mr-4" />
          </div>
          <div className="flex items-center w-1/3 justify-center">
            <img src="logo.png" className="aspect-square w-8 h-8 mr-2" />
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "24px",
                fontWeight: "bold",
                letterSpacing: "-0.09em",
              }}
            >
              auralitymixer
            </span>
          </div>
          <div className="flex items-center w-1/3 justify-end">
            <div className="flex justify-center items-center bg-[#1F1F1F] rounded-full p-2">
              <User fill="white"></User>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
