import "../../css/player.css";

import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";

import { Button } from "@headlessui/react";
import { MashedSong } from "@/types";
import toast from "react-hot-toast";
import { Pause } from "lucide-react";




export default function TrackScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [mashedSong, setMashedSong] = useState<MashedSong | null>(null);
    const [isGettingMix, setIsGettingMix] = useState(false);
    const [realTitle, setRealTitle] = useState("");


    const vocalsRef = useRef<HTMLAudioElement | null>(null);
    const instrumentalRef = useRef<HTMLAudioElement | null>(null);

    const Navigate = useNavigate();

    const { id } = useParams<{ id: string }>();

    const getMixFromId = async (id: string) => {
        if (isGettingMix) return;
        setIsGettingMix(true);
        return new Promise<MashedSong | {
            error: string
        }>(async (resolve, reject) => {
            const response = await fetch(`${import.meta.env.VITE_MAIN_SERVER_URL}/api/v1/getMix?id=${id}`);

            const data: {
                mashedSong: MashedSong,
                error: string
            } = await response.json();

            console.log(data, data.mashedSong)

            if (!data.mashedSong) {
                if (data.error) {
                    return reject(data);
                } else {
                    return reject({
                        error: "Failed to grab this mix!"
                    });

                }
            }

            const vocalAudio = new Audio(data.mashedSong.vocalURL);
            const instrumentalAudio = new Audio(data.mashedSong.instrumentalURL);

            vocalAudio.volume = data.mashedSong.vocalVolume;
            instrumentalAudio.volume = data.mashedSong.instrumentalVolume;

            vocalsRef.current = vocalAudio;
            instrumentalRef.current = instrumentalAudio;

            const titleSplit = data.mashedSong.title.split("&")

            setRealTitle(`${titleSplit[0].trim().charAt(0)}x${titleSplit[1].trim().charAt(0)}`)

            setMashedSong((data as {
                mashedSong: MashedSong
            }).mashedSong);

            setIsLoading(false);

            return resolve(data);
        });
    }

    const getMix = (id: string) => {
        const prom = getMixFromId(id);

        prom.catch((err) => {
            toast.error(err.error || "Failed to grab this mix!");
            Navigate("/")
        })
    }

    const pause = () => {
        if (vocalsRef.current) {
            vocalsRef.current.pause();
        }

        if (instrumentalRef.current) {
            instrumentalRef.current.pause();
        }
    }

    const play = () => {

        if (vocalsRef.current) {
            vocalsRef.current.play();
        }

        if (instrumentalRef.current) {
            instrumentalRef.current.play();
        }
    }
    useEffect(() => {
        return () => {
            if (vocalsRef.current) {
                vocalsRef.current.pause();
                vocalsRef.current = null;
            }
            if (instrumentalRef.current) {
                instrumentalRef.current.pause();
                instrumentalRef.current = null;
            }
        };
    }, []);
    
    useEffect(() => {
        if (id && !isGettingMix) {
            getMix(id);
        }
    }, [id]);

    if (isLoading || !mashedSong) {
        return (
            <div className="select-none min-w-screen min-h-screen flex-col bg-[#0B0B0B] text-center items-center justify-center">
                <div className="min-w-screen items-center justify-center">
                    <div className="flex flex-col text-center items-center justify-center h-64">
                        <div className="soundbar-container-big min-w-20 min-h-20">
                            <div className="soundbar-big bg-purple-500 rounded-full animate-soundbar1"></div>
                            <div className="soundbar-big bg-purple-500 rounded-full animate-soundbar2"></div>
                            <div className="soundbar-big bg-purple-500 rounded-full animate-soundbar3"></div>
                            <div className="soundbar-big bg-purple-500 rounded-full animate-soundbar2"></div>
                            <div className="soundbar-big bg-purple-500 rounded-full animate-soundbar1"></div>
                            <div className="soundbar-big bg-purple-500 rounded-full animate-soundbar1"></div>
                            <div className="soundbar-big bg-purple-500 rounded-full animate-soundbar3"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="select-none flex-col">
            <div className="w-full h-10" />

            <div
                className="flex flex-col items-center gap-16 px-24 h-full"
                style={{
                    zIndex: "50",
                }}
            >
                <div
                    className={`top-5 sticky lg:sticky md:sticky sm:sticky w-full items-center sm:w-[400px] md:w-[400px] lg:w-[400px]`}
                >
                    <div>
                        <div className="aspect-square will-change-transform relative flex items-center justify-center bg-[#ee31ee] rounded-[15px]">
                            <span className="text-white text-8xl font-bold">
                                {realTitle}
                            </span>
                        </div>

                        <div className="text-center pt-4">
                            <span className="inter-medium text-xl">{mashedSong.title}</span>
                        </div>

                        <div className="pt-3 text-center space-x-4">

                            <Button
                                onClick={() => {
                                    play();
                                }}
                                className="rounded-[10px] backdrop-blur py-1 px-1 text-sm text-white text-right bg-[#ee31ee] hover:bg-[#ee31ee]/80"
                            >
                                <svg
                                    width="50"
                                    height="50"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M14 14.329v21.343c0 1.924 2.083 3.127 3.75 2.165l18.496-10.672c1.668-.962 1.668-3.368 0-4.33L17.75 12.162c-1.666-.962-3.749.241-3.749 2.165Z"
                                        fill="#fff"
                                    />
                                </svg>
                            </Button>

                            <Button
                                className="rounded-[10px] backdrop-blur py-1 px-1 text-sm text-white text-right bg-[#ee31ee] hover:bg-[#ee31ee]/80"
                                onClick={() => {
                                    pause();
                                }}
                            >
                                <Pause size={50} />
                            </Button>


                        </div>

                        <div className="text-center pt-2 z-50" style={{ zIndex: "50" }}>
                            <span className="inter text-base text-white select-none nowrap-text whitespace-nowrap">
                                <div className="w-full flex items-center justify-center">
                                    <span

                                        className="cursor-pointer inter text-white select-none"
                                    >
                                        {mashedSong.user.name}
                                    </span>
                                    <div className="flex items-center ml-1">

                                        {" • "} {new Date(mashedSong.createdAt).toLocaleDateString()}{" "}
                                    </div>
                                </div>
                            </span>
                        </div>

                        <br />
                        <div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}