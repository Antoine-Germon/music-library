import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";

import { useLoaderData } from 'react-router-dom';

import "./SongPage.css";
import { EffectCoverflow } from "swiper/modules";
import { useEffect, useRef, useState } from "react";

type Song = {
    title: string;
    audioPath: string;
    thumbnailPath: string;
};

export function loader() {
    return fetch("http://localhost:5000/api/songs",
        {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        }
    )
        .then((res) => res.json())
        .then((data) => {
            console.log("Fetched songs:", data);
            return data;
        })
        .catch((error) => console.error("Error fetching songs:", error));
}

function SongPage() {
    const songs = useLoaderData() as Song[];
    const [currentSong, setCurrentSong] = useState<Song>({
        title: "",
        audioPath: "",
        thumbnailPath: "",
    });

    // Refs for controlling the <audio> element and Swiper instance
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const swiperRef = useRef<any>(null);

    const updateCurrentSong = (song: Song, songIndex: number | null = null) => {
        setCurrentSong(song);

        if (audioRef.current) {
            audioRef.current.src = `http://localhost:5000${song.audioPath}`;
            audioRef.current.load();
            audioRef.current.play();
        }

        // Programmatically slide to the song if an index is provided
        if (swiperRef.current && songIndex !== null) {
            swiperRef.current.slideTo(songIndex);
        }
    };

    const handleSlideChange = (swiper: any) => {
        const activeIndex = swiper.activeIndex; // Get the active slide index
        const song = songs[activeIndex]; // Get the corresponding song
        if (song) {
            updateCurrentSong(song);
        }
    };

    useEffect(() => {
        if (songs.length > 0) {
            setCurrentSong(songs[0]);
        }
    }, [songs]);

    return (
        <div className="song-page">
            <Swiper
                effect={"coverflow"}
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={"auto"}
                spaceBetween={-50}
                coverflowEffect={{
                    rotate: 20,
                    stretch: 0,
                    depth: 100,
                    modifier: 1,
                    slideShadows: true,
                }}
                pagination={true}
                modules={[EffectCoverflow]}
                className="song-swiper"
                onSlideChange={handleSlideChange} // Listen to slide changes
                onSwiper={(swiper) => (swiperRef.current = swiper)} // Save Swiper instance
            >
                {songs.map((song, index) => (
                    <SwiperSlide
                        key={song.title}
                        onClick={() => updateCurrentSong(song, index)} // Pass the index for slideTo
                    >
                        
                        <img
                            src={`http://localhost:5000${song.thumbnailPath}`}
                            alt={song.title}
                            className="yt-thumbnail"
                        />
                    </SwiperSlide>
                ))}
            </Swiper>

            <div className="current-song">
                <p>{currentSong.title}</p>
                <audio controls ref={audioRef}>
                    <source
                        src={
                            currentSong.audioPath ? `http://localhost:5000${currentSong.audioPath}` : "#"
                        }
                        type="audio/mpeg"
                    />
                    Your browser does not support the audio element.
                </audio>
            </div>
        </div>
    );
}

export default SongPage;
