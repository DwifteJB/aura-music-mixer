// main home page, add any pages you add to the router!! rahh!!

import { getFinishMixFromId } from "@/lib/api-helper";
import { MixResponse } from "@/types";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Play, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

// audioContexts

const FinishMix = () => {
    const navigate = useNavigate();
    const [mixRes, setMixResponse] = useState<MixResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams<{ id: string }>();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [songOne, setSongOne] = useState<{
        name: string,
        vocalUrl: string
        instrumentalUrl: string
        jobId: string;
        useVocals?: boolean;
        useInstrumentals?: boolean;
        volume?: number;
    } | null>(null);

    const [songTwo, setSongTwo] = useState<{
        name: string,
        vocalUrl: string
        instrumentalUrl: string
        jobId: string;
        useVocals?: boolean;
        useInstrumentals?: boolean;
        volume?: number;
    } | null>(null);

    const songOneVocalRef = useRef<HTMLAudioElement | null>(null);
    const songTwoVocalRef = useRef<HTMLAudioElement | null>(null);
    const songOneInstrumentalRef = useRef<HTMLAudioElement | null>(null);
    const songTwoInstrumentalRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (songOne?.vocalUrl && songOne?.instrumentalUrl) {
            songOneVocalRef.current = new Audio(songOne.vocalUrl);
            songOneInstrumentalRef.current = new Audio(songOne.instrumentalUrl);
        }
        if (songTwo?.vocalUrl && songTwo?.instrumentalUrl) {
            songTwoVocalRef.current = new Audio(songTwo.vocalUrl);
            songTwoInstrumentalRef.current = new Audio(songTwo.instrumentalUrl);
        }
    }, [songOne?.vocalUrl, songOne?.instrumentalUrl, songTwo?.vocalUrl, songTwo?.instrumentalUrl]);

    const handlePlay = () => {
        // Play enabled tracks
        if (songOne?.useVocals) songOneVocalRef.current?.play();
        if (songOne?.useInstrumentals) songOneInstrumentalRef.current?.play();
        if (songTwo?.useVocals) songTwoVocalRef.current?.play();
        if (songTwo?.useInstrumentals) songTwoInstrumentalRef.current?.play();
    };

    const handleStop = () => {
        // Stop all tracks
        [songOneVocalRef, songOneInstrumentalRef, songTwoVocalRef, songTwoInstrumentalRef].forEach(ref => {
            if (ref.current) {
                ref.current.pause();
                ref.current.currentTime = 0;
            }
        });
    };

    const sendMix = () => {
        const prom = sendBackData();

        toast.promise(prom, {
            loading: "Sending mix data...",
            success: "Mix data sent successfully!",
            error: "Failed to send mix data"
        })
    }

    const sendBackData = async () => {
        if (!songOne || !songTwo) return;
        if (!mixRes) return;
        if (isSubmitting) return;

        const data = {
            // vocalURL: songOne?.useVocals ? songOne.vocalUrl : songTwo?.vocalUrl,
            // instrumentalURL: songOne?.useInstrumentals ? songOne.instrumentalUrl : songTwo?.instrumentalUrl,
            // vocalVolume: songOne?.useVocals ? songOne.volume : songTwo?.volume,
            // instrumentalVolume: songOne?.useInstrumentals ? songOne.volume : songTwo?.volume,
            // title: mixRes.job.title,

            jobId: mixRes.job.id,
            vocals: songOne?.useVocals ? songOne.vocalUrl : songTwo?.vocalUrl,
            instrumentals: songOne?.useInstrumentals ? songOne.instrumentalUrl : songTwo?.instrumentalUrl,
            vocalVolume: (songOne?.useVocals ? songOne.volume : songTwo?.volume) || 1,
            instrumentalVolume: (songOne?.useInstrumentals ? songOne.volume : songTwo?.volume) || 1,
        }

        console.log(data);

        setIsSubmitting(true);

        try {
            const x = await fetch(`${import.meta.env.VITE_MAIN_SERVER_URL}/api/v1/finishmix`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(data)
            })

            if (!x.ok) {
                alert("Failed to send mix data");
            }

            const json = await x.json();

            if (json) {
                console.log("Mix data sent successfully:", json);

                if (json.id) {
                    navigate(`/mix/${json.id}`);
                } else {
                    navigate("/")
                }
            }
        } catch (e) {
            console.error("Error sending mix data:", e);
        }

    }

    const getMixResponseFromId = async (id: string) => {
        try {
            const mix = await getFinishMixFromId(id);

            if (mix) {
                setMixResponse(mix);
                console.log(mix);
                console.log(mix.job.results)

                for (const key of Object.keys(mix.job.JobIdToRealName)) {
                    console.warn(key, mix.job.JobIdToRealName[key]);

                    const song = {
                        name: mix.job.JobIdToRealName[key],
                        vocalUrl: mix.job.results[key].vocals_url,
                        instrumentalUrl: mix.job.results[key].instrumental_url,
                        jobId: key
                    }

                    console.log(song);

                    const idx = Object.keys(mix.job.JobIdToRealName).indexOf(key);

                    if (idx === 0) {
                        setSongOne({
                            ...song,
                            useVocals: true
                        });
                        console.warn("Set song one:", song);
                    } else if (idx === 1) {
                        setSongTwo({
                            ...song,
                            useVocals: false,
                            useInstrumentals: true
                        });
                        console.warn("Set song two:", song);
                    }
                }

            } else {
                setError("Failed to fetch mix data");
                console.error("Failed to fetch mix data");
                navigate("/");
            }
        } catch (e) {
            console.error("Error fetching mix data:", e);
            toast.error("Failed to fetch mix data");
            navigate("/");
        }
    }

    useEffect(() => {
        if (songOne && songOne.volume) {
            if (songOneVocalRef.current) {
                songOneVocalRef.current.volume = songOne.volume;
            }
            if (songOneInstrumentalRef.current) {
                songOneInstrumentalRef.current.volume = songOne.volume;
            }
        }
        if (songTwo && songTwo.volume) {
            if (songTwoVocalRef.current) {
                songTwoVocalRef.current.volume = songTwo.volume;
            }
            if (songTwoInstrumentalRef.current) {
                songTwoInstrumentalRef.current.volume = songTwo.volume;
            }
        }
    }, [songOne, songTwo]);

    useEffect(() => {
        if (id) {
            try {
                getMixResponseFromId(id);
            } catch (e) {
                toast.error("Failed to fetch mix data");
                console.error("Failed to fetch mix data:", e);
                navigate("/");
            }
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
                    Finish your mix ({mixRes.job.title.replaceAll(".mp3", "")})
                </span>

                <span className="text-2xl tracking-tighter">
                    Final steps, {mixRes.job.user.name}
                </span>


                <div className="mt-8 !bg-[#141414] rounded-sm p-5 w-[80%] justify-center">


                    <div className="grid grid-cols-2">
                        {songOne && (
                            <div className="flex flex-col gap-2 w-[100%]">
                                <h1>{songOne.name}</h1>

                                <div
                                    className="flex flex-row items-center gap-2"
                                >
                                    <Checkbox
                                        checked={songOne.useVocals}
                                        onCheckedChange={(checked) => {
                                            handleStop();
                                            setSongOne({ ...songOne, useVocals: checked === true });
                                            if (songTwo) {
                                                setSongTwo({
                                                    name: songTwo.name,
                                                    vocalUrl: songTwo.vocalUrl,
                                                    instrumentalUrl: songTwo.instrumentalUrl,
                                                    jobId: songTwo.jobId,
                                                    useVocals: checked !== true,
                                                    useInstrumentals: songTwo.useInstrumentals
                                                });
                                            }
                                        }}
                                    />
                                    <span className="text-sm font-normal">
                                        Use Vocals
                                    </span>
                                </div>

                                <div
                                    className="flex flex-row items-center gap-2"
                                >
                                    <Checkbox
                                        checked={songOne.useInstrumentals}
                                        onCheckedChange={(checked) => {
                                            handleStop();

                                            setSongOne({ ...songOne, useInstrumentals: checked === true });
                                            if (songTwo) {
                                                setSongTwo({
                                                    name: songTwo.name,
                                                    vocalUrl: songTwo.vocalUrl,
                                                    instrumentalUrl: songTwo.instrumentalUrl,
                                                    jobId: songTwo.jobId,
                                                    useVocals: songTwo.useVocals,
                                                    useInstrumentals: checked !== true,
                                                });
                                            }
                                        }}
                                    />
                                    <span className="text-sm font-normal">
                                        Use Instrumentals
                                    </span>
                                </div>

                                <div
                                    className="flex flex-row items-center gap-2"
                                >
                                    <span className="text-sm font-normal">
                                        Volume
                                    </span>
                                    <Slider className="w-[50%]" defaultValue={[100]} max={100} step={1} onValueChange={(val) => {
                                        console.log(val[0])
                                        // setSongOne({ ...songOne, volume: val[0] });
                                        if (songOne) {
                                            setSongOne({ ...songOne, volume: val[0] / 100 });
                                            console.log(songOne.volume)
                                        }
                                    }} />
                                </div>

                                <h1 className="opacity-0">02 BROKEN ROAD (feat. Don Toliver).mp3</h1>



                            </div>
                        )}

                        {songTwo && (
                            <div className="flex flex-col gap-2 w-[100%]">
                                <h1>{songTwo.name}</h1>

                                <div
                                    className="flex flex-row items-center gap-2"
                                >
                                    <Checkbox
                                        checked={songTwo.useVocals}
                                        onCheckedChange={(checked) => {
                                            handleStop();

                                            setSongTwo({ ...songTwo, useVocals: checked === true });
                                            if (songOne) {
                                                setSongOne({
                                                    name: songOne.name,
                                                    vocalUrl: songOne.vocalUrl,
                                                    instrumentalUrl: songOne.instrumentalUrl,
                                                    jobId: songOne.jobId,
                                                    useVocals: checked !== true,
                                                    useInstrumentals: songOne.useInstrumentals
                                                });
                                            }
                                        }}
                                    />
                                    <span className="text-sm font-normal">
                                        Use Vocals
                                    </span>
                                </div>

                                <div
                                    className="flex flex-row items-center gap-2"
                                >
                                    <Checkbox
                                        checked={songTwo.useInstrumentals}
                                        onCheckedChange={(checked) => {
                                            handleStop();

                                            setSongTwo({ ...songTwo, useInstrumentals: checked === true });
                                            if (songOne) {
                                                setSongOne({
                                                    name: songOne.name,
                                                    vocalUrl: songOne.vocalUrl,
                                                    instrumentalUrl: songOne.instrumentalUrl,
                                                    jobId: songOne.jobId,
                                                    useVocals: songOne.useVocals,
                                                    useInstrumentals: checked !== true,
                                                });
                                            }
                                        }}
                                    />
                                    <span className="text-sm font-normal">
                                        Use Instrumentals
                                    </span>
                                </div>

                                <div
                                    className="flex flex-row items-center gap-2"
                                >
                                    <span className="text-sm font-normal">
                                        Volume
                                    </span>
                                    <Slider className="w-[50%]" defaultValue={[100]} max={100} step={1} onValueChange={(val) => {
                                        console.log(val[0])
                                        // setSongOne({ ...songOne, volume: val[0] });
                                        if (songTwo) {
                                            setSongTwo({ ...songTwo, volume: val[0] / 100 });
                                        }
                                    }} />
                                </div>

                                <h1 className="opacity-0">02 BROKEN ROAD (feat. Don Toliver).mp3</h1>

                            </div>
                        )}



                    </div>



                    <div className="flex">
                        <div className="flex flex-row gap-3">
                            <Button size={"lg"} className="bg-[#ee31ee] hover:bg-[#ee31ee]/80" onClick={handlePlay}>
                                <Play size={64} />
                            </Button>

                            <Button size={"lg"} className="bg-[#ee31ee] hover:bg-[#ee31ee]/80" onClick={handleStop}>
                                <StopCircle size={64} />
                            </Button>
                        </div>

                        <div className="flex flex-col gap-2 ml-auto">
                            <Button disabled={isSubmitting} onClick={sendMix} size={"lg"} className="bg-[#ee31ee] hover:bg-[#ee31ee]/80">
                                Save Mix
                            </Button>
                        </div>
                    </div>
                </div>






            </div>
        </div>
    );
};

export default FinishMix;
