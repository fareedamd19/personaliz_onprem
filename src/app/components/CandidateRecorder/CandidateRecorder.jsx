import React, { useState, useRef, useEffect } from "react";
import { DownloadIcon } from "@heroicons/react/outline";

export default function CandidateRecorder() {
  const [recording, setRecording] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const cameraStreamRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const initializeCamera = async () => {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      cameraStreamRef.current = cameraStream;
      if (videoRef.current) {
        videoRef.current.srcObject = cameraStream;
      }
    };

    initializeCamera();
  }, []);

  const startRecording = async () => {
    const cameraStream = cameraStreamRef.current;

    const recorder = new MediaRecorder(cameraStream);
    const chunks = [];

    recorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/mp4" });
      setVideoURL(URL.createObjectURL(blob));
    };

    recorder.start();
    setMediaRecorder(recorder);
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setRecording(false);
  };

  return (
    <>
      <div className="fixed top-24 right-5 w-36 h-36 z-[1000000] rounded-full overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-full object-cover"
        />
      </div>
      <div className="fixed bottom-5 right-5 p-4 bg-blue-500 text-white rounded-full shadow-lg flex items-center z-[1000000]">
        {recording ? (
          <button
            onClick={stopRecording}
            className="bg-red-500 px-4 py-2 rounded-full"
          >
            Stop Recording
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="bg-green-500 px-4 py-2 rounded-full"
          >
            Start Recording
          </button>
        )}
        {videoURL && (
          <a href={videoURL} download="recording.mp4" className="ml-4">
            <DownloadIcon className="h-6 w-6" />
          </a>
        )}
      </div>
    </>
  );
}
