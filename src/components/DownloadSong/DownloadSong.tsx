import React, { createRef, useState } from 'react';
import { Cropper, ReactCropperElement } from 'react-cropper';
import { Outlet } from 'react-router-dom';

import "cropperjs/dist/cropper.css";

function DownloadSong() {
    const [image, setImage] = useState<string | null>(null);
    const cropperRef = createRef<ReactCropperElement>();
    const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);
    const [originalImageName, setOriginalImageName] = useState<string | null>(null);

    const saveCropData = () => {
        if (typeof cropperRef.current?.cropper !== "undefined") {
            cropperRef.current?.cropper.getCroppedCanvas().toBlob((blob: Blob | null) => {
                const formData = new FormData();
                if (!blob) return;
                let name = originalImageName ? originalImageName.slice(6) : "croppedImage.png";
                formData.append('croppedImage', blob, name);
                fetch('http://localhost:5000/api/upload', {
                    method: 'POST',
                    body: formData,
                }).then(res => res.json()).then(data => {
                    /* setImage("#");
                    setOriginalImageName(null); */
                });
            });
        }
    };

    return (
        <>
            <input type="text" onChange={(e) => {
                setYoutubeUrl(e.target.value);
                console.log(youtubeUrl);
            }} />
            <button onClick={() => {
                if (!youtubeUrl) {
                    return;
                }

                fetch('http://localhost:5000/api/download', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "youtubeUrl": youtubeUrl,
                    }),
                }).then(res => res.json()).then(data => {
                    setOriginalImageName(data.thumbnailPath);
                    setImage(`http://localhost:5000${data.thumbnailPath}`);
                });
            }}>Download</button>
            <Cropper
                src={image ?? "#"}
                ref={cropperRef}
                aspectRatio={1}
                style={{ height: 400, width: "100%" }}
                zoomTo={0.5}
                initialAspectRatio={1}
                viewMode={1}
                minCropBoxHeight={10}
                minCropBoxWidth={10}
                background={false}
                responsive={true}
                autoCropArea={1}
                checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
                guides={true}
            />
            <button style={{ float: "right" }} onClick={saveCropData}>
              Save
            </button>
            <Outlet />
        </>
    );
}

export default DownloadSong;
