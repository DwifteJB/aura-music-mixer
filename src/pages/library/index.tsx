import { getMyMixedSongs } from "@/lib/api-helper";
import "../../css/player.css";


import { mashedSongsFromServer } from "@/types";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

import { motion } from "motion/react"


const MixedSong = ({
    song
}: {
    song: mashedSongsFromServer["mixedSongs"][number]
}) => {

    const navigate = useNavigate();

    const realTitle = song.title.split("&")

    return (
        <div>
            <motion.div whileHover={{
                scale: 0.9,
                transition: { duration: 0.1 },
                rotate: 4
            }}
                whileTap={{ scale: 1 }} onClick={() => {
                    navigate(`/mix/${song.id}`);
                }} className="aspect-square cursor-pointer w-64 h-64 will-change-transform relative flex items-center justify-center bg-[#ee31ee] rounded-[15px]">
                <span className="text-white text-8xl font-bold">
                    {realTitle[0].trim().charAt(1).toUpperCase()}x{realTitle[1].trim().charAt(1).toUpperCase()}
                </span>
            </motion.div>
            <span>{song.title.length > 25 ? song.title.substring(0, 25) + "..." : song.title}</span>
        </div>
    );
}

const LibraryPage = () => {
    const [mixedSongs, setMixedSongs] = useState<mashedSongsFromServer["mixedSongs"] | null>(null);
    const [loading, setIsLoading] = useState<boolean>(true);

    const getMixedSongs = () => {
        const songs = getMyMixedSongs();

        songs.then((res) => {
            setMixedSongs(res.mixedSongs);
            setIsLoading(false);
        }).catch((e) => {
            console.error(e);
            toast.error("Failed to load mixed songs");
            setIsLoading(false);
        })
    }

    useEffect(() => {
        getMixedSongs();
    }, [])

    if (loading) {
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
        <div className="mt-8">
            <div className="flex flex-col items-center justify-center">
                <span className="text-3xl tracking-tighter">
                    Your library!
                </span>

                <div className="mt-8 !bg-[#141414] rounded-sm p-5 max-w-[1200px]">
                    {mixedSongs && mixedSongs.length === 0 ? (
                        <span className="text-xl !text-white/80">
                            No mixed songs found. Try creating some!
                        </span>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {mixedSongs?.map((song) => (
                                <MixedSong key={song.id} song={song} />
                            ))}


                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LibraryPage;
