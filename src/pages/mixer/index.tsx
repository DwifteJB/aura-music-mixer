import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeftRight } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

import * as idf from "id3js";
import { ID3Tag } from "id3js/lib/id3Tag";
import { useCommunicationContext } from "@/components/CommunicationContext";

import { motion } from "motion/react";

interface SongDetails {
  title: string;
  image?: {
    mimeType: string;
    data: ArrayBuffer;
  };
  file: File;
  filename: string;
  size: string;
  type: string;
}

interface TagWithImage extends ID3Tag {
  images?: {
    mimeType: string;
    data: ArrayBuffer;
    description?: string;
    type: string;
  }[];
}

const RateLimitCard = ({ time }: { time: Date }) => {
  const [remainingTime, setRemainingTime] = useState(
    new Date(time.getTime() - new Date().getTime()),
  );

  useEffect(() => {
    setRemainingTime(time);

    const now = new Date();
    const diff = time.getTime() - now.getTime();
    console.log("diff", diff, time, now);
    if (diff <= 0) {
      setRemainingTime(new Date(0));
    } else {
      setRemainingTime(new Date(diff));
    }

    const interval = setInterval(() => {
      const now = new Date();
      const diff = time.getTime() - now.getTime();
      console.log("diff", diff, time, now);
      if (diff <= 0) {
        clearInterval(interval);
        setRemainingTime(new Date(0));
      } else {
        setRemainingTime(new Date(diff));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [time]);
  return (
    <Card className=" w-[50%]">
      <CardHeader>
        <CardTitle className="text-3xl">You are ratelimited</CardTitle>
        <CardDescription className="text-xl">
          Please wait {remainingTime.getMinutes()} minutes and{" "}
          {remainingTime.getSeconds()} seconds to mix another song, this is due
          to the lack of resources (I, a solo developer) have for GPU-intensive
          tasks. Sorry for the inconvenience! :3
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
const MixerPage = () => {
  const CommunicationContext = useCommunicationContext();

  const [cardOneHovered, setCardOneHovered] = useState(false);
  const [cardTwoHovered, setCardTwoHovered] = useState(false);

  const [songOne, setSongOne] = useState<SongDetails | null>(null);
  const [songTwo, setSongTwo] = useState<SongDetails | null>(null);

  const [rateLimitTime, setRateLimitTime] = useState<Date | null>(null);

  const songOneImageUrl = useMemo(() => {
    if (songOne?.image) {
      return URL.createObjectURL(
        new Blob([songOne.image.data], { type: songOne.image.mimeType }),
      );
    }
    return null;
  }, [songOne?.image]);

  const songTwoImageUrl = useMemo(() => {
    if (songTwo?.image) {
      return URL.createObjectURL(
        new Blob([songTwo.image.data], { type: songTwo.image.mimeType }),
      );
    }
    return null;
  }, [songTwo?.image]);

  useEffect(() => {
    return () => {
      if (songOneImageUrl) URL.revokeObjectURL(songOneImageUrl);
      if (songTwoImageUrl) URL.revokeObjectURL(songTwoImageUrl);
    };
  }, [songOneImageUrl, songTwoImageUrl]);

  const onFilePick = async (songType: "one" | "two", file: File) => {
    try {
      const tags: TagWithImage | null = await idf.fromFile(file);
      console.log("tags", tags);

      if (songType === "one") {
        setSongOne({
          title: tags?.title || file.name,
          image: tags?.images?.[0]
            ? {
                mimeType: tags.images[0].mimeType,
                data: tags.images[0].data,
              }
            : {
                data: await fetch("/logo.png").then((res) => res.arrayBuffer()),
                mimeType: "image/png",
              },
          file: file,
          filename: file.name,
          size: `${(file.size / 1024).toFixed(2)} KB`,
          type: file.type,
        });
      } else if (songType === "two") {
        setSongTwo({
          title: tags?.title || file.name,
          image: tags?.images?.[0]
            ? {
                mimeType: tags.images[0].mimeType,
                data: tags.images[0].data,
              }
            : {
                data: await fetch("/logo.png").then((res) => res.arrayBuffer()),
                mimeType: "image/png",
              },
          file: file,
          filename: file.name,
          size: `${(file.size / 1024).toFixed(2)} KB`,
          type: file.type,
        });
      }
    } catch {
      console.error("Error reading ID3 tags:", file);
      if (songType === "one") {
        setSongOne({
          title: file.name,
          file: file,
          filename: file.name,
          size: `${(file.size / 1024).toFixed(2)} KB`,
          type: file.type,
          image: {
            data: await fetch("/logo.png").then((res) => res.arrayBuffer()),
            mimeType: "image/png",
          },
        });
      } else if (songType === "two") {
        setSongTwo({
          title: file.name,
          file: file,
          filename: file.name,
          size: `${(file.size / 1024).toFixed(2)} KB`,
          type: file.type,
          image: {
            data: await fetch("/logo.png").then((res) => res.arrayBuffer()),
            mimeType: "image/png",
          },
        });
      }
    }

    console.log("set", songType, "with file", file);
  };

  if (!CommunicationContext.socket) {
    return (
      <div className="mt-6 justify-center items-center w-full">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl tracking-tighter text-center mb-6">
            Connecting to the server...
          </h1>
          <p className="text-lg text-gray-500">
            Please wait while we establish a connection.
          </p>
        </div>
      </div>
    );
  }

  if (rateLimitTime) {
    return (
      <div className="mt-6 justify-center items-center w-full">
        <div className="flex flex-col items-center justify-center">
          <RateLimitCard time={rateLimitTime} />
        </div>
      </div>
    );
  }
  return (
    <div className="mt-6 justify-center items-center w-full">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl tracking-tighter text-center mb-6">
          i needa figure out tf to put here
        </h1>
        <Card className="bg-black w-[80%]">
          <CardContent>
            <div className="flex flex-row justify-center items-center space-x-4">
              <motion.div
                animate={{
                  rotate: cardOneHovered ? -2 : 0,
                  scale: cardOneHovered ? 1.05 : 1,
                }}
                className="p-3"
                transition={{
                  type: "tween",
                  stiffness: 300,
                  damping: 20,
                  mass: 0.5,
                }}
              >
                <Card
                  onMouseEnter={() => setCardOneHovered(true)}
                  onMouseLeave={() => setCardOneHovered(false)}
                  className="min-w-[100px] md:min-w-[200px] sm:min-w-[125px] lg:min-w-[250px] aspect-square p-12 flex items-center justify-center relative overflow-hidden transition-all duration-300"
                  style={{
                    cursor: "pointer",
                  }}
                >
                  <div
                    className="absolute inset-0 transition-all duration-300"
                    style={{
                      backgroundImage: songOneImageUrl
                        ? `url(${songOneImageUrl})`
                        : "url('/grid.png')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      filter:
                        cardOneHovered && !songOne?.image
                          ? "blur(4px)"
                          : "none",
                    }}
                  />
                  {songOne && (
                    <div className="absolute top-0 left-0 right-0 p-3 bg-black/70 backdrop-blur-sm z-10">
                      <p className="text-white text-sm font-medium truncate">
                        {songOne.title}
                      </p>
                    </div>
                  )}
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-300 z-10 ${
                      cardOneHovered
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-95"
                    }`}
                  >
                    <div
                      className="text-center p-4 rounded-lg bg-black/20 backdrop-blur-sm shadow-2xl border border-white/10"
                      style={{ textShadow: "0 0 20px rgba(255,255,255,0.5)" }}
                    >
                      <CardTitle className="text-white text-lg mb-2">
                        Upload your song
                      </CardTitle>
                      <CardDescription className="text-gray-200">
                        Click to upload a file
                      </CardDescription>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="audio/*"
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        onFilePick("one", e.target.files[0]);
                      }
                    }}
                    tabIndex={-1}
                    aria-label="Upload song one"
                  />
                </Card>
              </motion.div>
              <motion.div animate={{
                rotate: cardOneHovered || cardTwoHovered ? 0 : 2,
                scale: cardOneHovered || cardTwoHovered ? 1 : 1.05,
              }}
                className="flex items-center justify-center"
                transition={{
                  type: "tween",
                  stiffness: 300,
                  damping: 20,
                  mass: 0.5,
              }}>
                <ArrowLeftRight size={128} strokeWidth={1} />
              </motion.div>

              <motion.div
                animate={{
                  rotate: cardTwoHovered ? -2 : 0,
                  scale: cardTwoHovered ? 1.05 : 1,
                }}
                className="p-3"
                transition={{
                  type: "tween",
                  stiffness: 300,
                  damping: 20,
                  mass: 0.5,
                }}
              >
                <Card
                  onMouseEnter={() => setCardTwoHovered(true)}
                  onMouseLeave={() => setCardTwoHovered(false)}
                  className="min-w-[100px] md:min-w-[200px] sm:min-w-[125px] lg:min-w-[250px] aspect-square p-12 flex items-center justify-center relative overflow-hidden transition-all duration-300"
                  style={{
                    cursor: "pointer",
                  }}
                >
                  <div
                    className="absolute inset-0 transition-all duration-300"
                    style={{
                      backgroundImage: songTwoImageUrl
                        ? `url(${songTwoImageUrl})`
                        : "url('/grid.png')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      filter:
                        cardTwoHovered && !songTwo?.image
                          ? "blur(4px)"
                          : "none",
                    }}
                  />
                  {songTwo && (
                    <div className="absolute top-0 left-0 right-0 p-3 bg-black/70 backdrop-blur-sm z-10">
                      <p className="text-white text-sm font-medium truncate">
                        {songTwo.title}
                      </p>
                    </div>
                  )}
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-300 z-10 ${
                      cardTwoHovered
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-95"
                    }`}
                  >
                    <div
                      className="text-center p-4 rounded-lg bg-black/20 backdrop-blur-sm shadow-2xl border border-white/10"
                      style={{ textShadow: "0 0 20px rgba(255,255,255,0.5)" }}
                    >
                      <CardTitle className="text-white text-lg mb-2">
                        Upload your song
                      </CardTitle>
                      <CardDescription className="text-gray-200">
                        Click to upload a file
                      </CardDescription>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="audio/*"
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        onFilePick("two", e.target.files[0]);
                      }
                    }}
                    tabIndex={-1}
                    aria-label="Upload song two"
                  />
                </Card>
              </motion.div>
            </div>
            <div className="mt-4 text-center items-center w-full justify-center">
              <Button
                disabled={!songOne && !songTwo}
                size={"lg"}
                className="bg-[var(--text-branding)] hover:bg-[#ee31ee]/80 text-white w-[30%]"
              >
                <span className="text-lg ">Mix!</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <h1 className="text-2xl tracking-tighter text-center mt-12">
          Need some inspiration? Check out some of the mixes by the community!
        </h1>

        <span>MIXES WOULD GO HERE :3</span>
      </div>
    </div>
  );
};

export default MixerPage;
