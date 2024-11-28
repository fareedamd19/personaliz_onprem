import React, { useState, useRef } from "react";

export default function CandidateRecorder() {
  const [recording, setRecording] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const screenStreamRef = useRef(null);
  const cameraStreamRef = useRef(null);

  const startRecording = async () => {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    const cameraStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    screenStreamRef.current = screenStream;
    cameraStreamRef.current = cameraStream;

    const combinedStream = new MediaStream([
      ...screenStream.getTracks(),
      ...cameraStream.getTracks(),
    ]);
    const recorder = new MediaRecorder(combinedStream);
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
    screenStreamRef.current.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current.getTracks().forEach((track) => track.stop());
    setRecording(false);
  };

  return (
    <div className="fixed bottom-5 right-5 p-4 bg-blue-500 text-white rounded-full shadow-lg flex items-center">
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
        <a href={videoURL} download="recording.mp4" className="ml-4 underline">
          Download Video
        </a>
      )}
    </div>
  );
}
