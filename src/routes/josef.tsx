import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

const VIDEO_URL =
  "/__l5e/assets-v1/8727fddc-71d0-4d23-b95b-07f9a2870bd5/intro.mp4";

export const Route = createFileRoute("/josef")({
  component: JosefVideo,
});

function JosefVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      window.location.href = "/";
    };

    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-4">
      <video
        ref={videoRef}
        src={VIDEO_URL}
        controls
        autoPlay
        playsInline
        className="max-h-[90vh] w-full max-w-5xl rounded-lg shadow-2xl"
      >
        <a href={VIDEO_URL}>Video herunterladen</a>
      </video>
    </main>
  );
}