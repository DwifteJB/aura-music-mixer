import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeftRight, Blend } from "lucide-react";

/*
two image boxes, one left, one right:

on hover over img show "press me to upload a file"

use id3 to read the tags and display img, else generate img from name/file name

once click mix -> api request -> ws deals with ai split, queue, rate limit, etc.
-> real time updates -> then after, send 4 audio files
(song 1 vocals, song 1 instrumentals, song 2 vocals, song 2 instrumentals)

allow user to change volume, pitch, etc. of each file (SoundTouchJS)
then figure out how to mix them to be downloadable

then allow user to post -> public -> set album art, title, description

store data of the original file names/tags...


boom!!!!!!!!

*/

const RateLimitCard = () => {
  return (
    <Card className=" w-[50%]">
      <CardHeader>
        <CardTitle className="text-3xl">You are ratelimited</CardTitle>
        <CardDescription className="text-xl">
          Please wait 3 minutes and 30 seconds to mix another song, this is due
          to the lack of resources (I, a solo developer) have for GPU-intensive
          tasks. Sorry for the inconvenience! :3
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

const MixerPage = () => {
  return (
    <div className="mt-6 justify-center items-center w-full">
      <div className="flex flex-col items-center justify-center">
        {/* <RateLimitCard /> */}

        <h1 className="text-4xl tracking-tighter text-center mb-6">
          mix mix mix!67
        </h1>
        <Card className="bg-black w-[80%]">
          <CardContent>
            {/* two image boxes, left and right, mix icon in the middle */}

            <div className="flex flex-row justify-center items-center space-x-4">
              <Card
                className="min-w-[200px] aspect-square p-12 flex items-center justify-center"
                style={{
                  backgroundImage: "url('/grid.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  cursor: "pointer",
                }}
              >
                {/* <CardAction>
                      <CardTitle className="text-white text-lg">Upload your song</CardTitle>
                      <CardDescription className="text-gray-400">Click to upload a file</CardDescription>
                    </CardAction> */}
              </Card>

              <ArrowLeftRight size={128} strokeWidth={1} />

              <Card
                className="min-w-[200px] aspect-square p-12 flex items-center justify-center"
                style={{
                  backgroundImage: "url('/grid.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  cursor: "pointer",
                }}
              >
                {/* <CardAction>
                      <CardTitle className="text-white text-lg">Upload your song</CardTitle>
                      <CardDescription className="text-gray-400">Click to upload a file</CardDescription>
                    </CardAction> */}
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MixerPage;
