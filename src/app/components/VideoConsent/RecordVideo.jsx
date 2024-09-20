import { useState, useRef, useEffect } from "react";
import { IoPlay, IoVideocamOutline } from "react-icons/io5";
import { Button } from "../ui/button";
import { FaCheckCircle, FaStop } from "react-icons/fa";
import { MdOutlinePause } from "react-icons/md";
import { IoMdRefresh } from "react-icons/io";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

const VideoRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);
  const [recordingStartTime, setRecordingStartTime] = useState(null);

  const recordedChunks = useRef([]);
  const videoRef = useRef(null);

  useEffect(() => {
    if (recordingStartTime && isRecording) {
      const checkMaxDuration = setInterval(() => {
        if (recordingStartTime && Date.now() - recordingStartTime >= 60000) {
          handleStopRecording();
          clearInterval(checkMaxDuration);
        }
      }, 1000);

      return () => clearInterval(checkMaxDuration);
    }
    // eslint-disable-next-line
  }, [recordingStartTime, isRecording]);

  useEffect(() => {
    startWebcam();

    return () => {
      if (videoRef.current) {
        // eslint-disable-next-line
        const stream = videoRef.current.srcObject;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      }
    };
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error("Error accessing media devices", error);
    }
  };

  const startRecording = () => {
    try {
      const stream = videoRef.current.srcObject;
      const options = { mimeType: "video/webm; codecs=vp8" };
      const newMediaRecorder = new MediaRecorder(stream, options);
      setMediaRecorder(newMediaRecorder);

      newMediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      newMediaRecorder.onstop = () => {
        if (recordedChunks.current.length > 0) {
          const blob = new Blob(recordedChunks.current, { type: "video/webm" });
          setVideoBlob(blob);
        }
      };

      newMediaRecorder.start();
      setIsRecording(true);
      setRecordingStartTime(Date.now());
    } catch (error) {
      console.error("Error starting recording", error);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "paused") {
      mediaRecorder.resume();
      setIsPaused(false);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
      setRecordingStartTime(null);

      if (videoRef.current) {
        const stream = videoRef.current.srcObject;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      }
    }
  };

  const handleRestartRecording = () => {
    recordedChunks.current = [];
    setVideoBlob(null);
    startWebcam();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="md:mx-6">
        {videoBlob ? (
          <video
            controls
            key={URL.createObjectURL(videoBlob)}
            src={URL.createObjectURL(videoBlob)}
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            poster="https://via.placeholder.com/400x300?text=No+Video"
          />
        )}
      </div>

      <div className="flex-center gap-2">
        {!isRecording && !videoBlob ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="flex-center w-max rounded-full p-2 bg-black"
                onClick={startRecording}
              >
                <IoVideocamOutline className="text-white text-2xl cursor-pointer" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Start Recording</p>
            </TooltipContent>
          </Tooltip>
        ) : isRecording ? (
          <>
            <CountdownCircleTimer
              isPlaying={!isPaused}
              duration={60}
              colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
              colorsTime={[60, 40, 20, 0]}
              size={35}
              strokeWidth={3}
            >
              {({ remainingTime }) => remainingTime}
            </CountdownCircleTimer>
            <Button
              className="flex-center w-max rounded-full p-2 bg-black"
              onClick={isPaused ? resumeRecording : pauseRecording}
            >
              {isPaused ? (
                <IoPlay className="text-white text-xl cursor-pointer" />
              ) : (
                <MdOutlinePause className="text-white text-xl cursor-pointer" />
              )}
            </Button>
            <Button
              className="flex-center w-max rounded-full p-2 bg-black"
              onClick={handleStopRecording}
            >
              <FaStop className="text-white text-lg cursor-pointer" />
            </Button>
          </>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="flex-center w-max rounded-full p-2 bg-black"
                onClick={handleRestartRecording}
              >
                <IoMdRefresh className="text-white text-xl cursor-pointer" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Re-record</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <p cTooltipe="text-center">Face the camera and read the message below.</p>

      <p className="p-1 py-2 md:p-3 md:px-5 bg-gray-200 rounded-lg text-center italic">
        My name is <strong>Santosh</strong>, <br />I am interviewing for{" "}
        <strong>Frontend Enineer</strong> role at <strong>Oscorp</strong>
      </p>

      <Button onClick={() => {}} disabled={!videoBlob || isRecording}>
        <FaCheckCircle className=" text-lg mr-2" />
        Finish Reading
      </Button>
    </div>
  );
};

export default VideoRecorder;
