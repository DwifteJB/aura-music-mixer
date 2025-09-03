// main home page, add any pages you add to the router!! rahh!!

import { Button } from "@/components/ui/button";
import { getMixFromId } from "@/lib/api-helper";
import { MixResponse } from "@/types";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

import WavesurferPlayer from '@wavesurfer/react'

// audioContexts

const MixPage = () => {
    const [mixRes, setMixResponse] = useState<MixResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams<{ id: string }>();

    const [vocalsUrl, setVocalsUrl] = useState<string | null>(null);
    const [instrumentalsUrl, setInstrumentalsUrl] = useState<string | null>(null);

    const getMixResponseFromId = async (id: string) => {
        const mix = await getMixFromId(id);

        if (mix) {
            setMixResponse(mix);
            console.log(mix);
            console.log(mix.job.results)

            /*

            mix.job.results = {
  "5639782e-9580-4bdf-bd16-1ea341191f1f": {
    "vocals_url": "http://localhost:5000/download/5639782e-9580-4bdf-bd16-1ea341191f1f/5639782e-9580-4bdf-bd16-1ea341191f1f_vocals.mp3",
    "completed_at": "2025-09-03T03:34:20.978Z",
    "instrumental_url": "http://localhost:5000/download/5639782e-9580-4bdf-bd16-1ea341191f1f/5639782e-9580-4bdf-bd16-1ea341191f1f_instrumental.mp3"
  },
  "df569787-8298-415a-b885-0a5c11aec382": {
    "vocals_url": "http://localhost:5000/download/df569787-8298-415a-b885-0a5c11aec382/df569787-8298-415a-b885-0a5c11aec382_vocals.mp3",
    "completed_at": "2025-09-03T03:34:01.753Z",
    "instrumental_url": "http://localhost:5000/download/df569787-8298-415a-b885-0a5c11aec382/df569787-8298-415a-b885-0a5c11aec382_instrumental.mp3"
  }
}

*/

        // first is vocals, second is instru
        setVocalsUrl(mix.job.results[Object.keys(mix.job.results)[0]].vocals_url);
        setInstrumentalsUrl(mix.job.results[Object.keys(mix.job.results)[0]].instrumental_url);

        console.log(mix.job.results[Object.keys(mix.job.results)[0]].vocals_url);
        console.log(mix.job.results[Object.keys(mix.job.results)[0]].instrumental_url);

        } else {
            setError("Failed to fetch mix data");
        }
    }

    useEffect(() => {
        if (id) {
            getMixResponseFromId(id);
        }
    }, [id]);

    if (!id) {
        return <h1>loading...</h1>
    }

    if (error) {
        return <h1>{error}</h1>;
    }

    if (!mixRes) {
        return <h1>loading...</h1>;
    }


    return (
        <div className="mt-8">
            <div className="flex flex-col items-center justify-center">
                <span className="text-3xl tracking-tighter">
                    Mix Between {mixRes.job.title.replaceAll(".mp3", "")}
                </span>

                <span className="text-2xl tracking-tighter">
                    Created by {mixRes.job.user.name}
                </span>


                <div className="mt-8 !bg-[#141414] rounded-sm p-5 w-[80%] flex justify-center">
                   <img src="/logo.png" alt="Logo" />
                </div>

                <WavesurferPlayer
                    url={vocalsUrl || ""}

                    onReady={() => console.log("Wavesurfer is ready")}
                />
            </div>
        </div>
    );
};

export default MixPage;
