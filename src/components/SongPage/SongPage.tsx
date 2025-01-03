import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";

import { Form, Outlet, useLoaderData, useNavigation } from 'react-router-dom';
import { NavLinkWithQuery } from '@/linkWithQuery';

import "./SongPage.css";
import { EffectCoverflow } from "swiper/modules";
import { useEffect, useState } from "react";

type Song = {
    title: string;
    audio: string;
    thumbnail: string;
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

    const [currentSong, setCurrentSong] = useState<Song | null>(null);

    return (
        <>
            <Swiper
                effect={"coverflow"}
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={"auto"}
                spaceBetween={100}
                coverflowEffect={{
                    rotate: 25,
                    stretch: 0,
                    depth: 100,
                    modifier: 1,
                    slideShadows: true,
                }}
                pagination={true}
                modules={[EffectCoverflow]}
                className="song-swiper"
            >
                {songs.map((song) => (
                    <SwiperSlide key={song.title} onClick={() => setCurrentSong(song)}>
                        <div>
                            <img
                                src={`http://localhost:5000${song.thumbnail}`}
                                alt={song.title}
                                className="yt-thumbnail"
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {currentSong && (
                <div className="current-song">
                    <p>{currentSong.title}</p>
                    <audio controls>
                        <source
                            src={`http://localhost:5000${currentSong.audio}`}
                            type="audio/mpeg"
                        />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            )}
        </>
    );
}

export default SongPage;
