import { useRef, useEffect } from 'react';

const AudioVisualizer = ({microphoneStream}) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if(!microphoneStream) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();

    const microphoneSource = audioContext.createMediaStreamSource(microphoneStream);
    microphoneSource.connect(analyser);

    // const initializeMicrophone = async () => {
    //   try {
    //     microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    //     const microphoneSource = audioContext.createMediaStreamSource(microphoneStream);
    //     microphoneSource.connect(analyser);
    //   } catch (error) {
    //     console.error('Error accessing microphone:', error);
    //   }
    // };

    // initializeMicrophone();

    const bufferLength = 1024;
    analyser.fftSize = bufferLength * 2;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;

      analyser.getByteTimeDomainData(dataArray);

      context.clearRect(0, 0, WIDTH, HEIGHT);
      context.lineWidth = 2;
      context.strokeStyle = '#ff3c4c';
      context.beginPath();

      const sliceWidth = (WIDTH * 1.0) / (bufferLength - 1);
      let x = 0;

      // Apply cubic interpolation to smooth the waveform
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 108.0;
        const y = (v * HEIGHT) / 2;
        const cp1x = x - sliceWidth;
        const cp1y = y;
        const cp2x = x + sliceWidth;
        const cp2y = y;

        if (i === 0) {
          context.moveTo(x, y);
        } else {
          context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
        }

        x += sliceWidth;
      }

      context.stroke();

      animationIdRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      if (microphoneStream) {
        microphoneStream.getTracks().forEach(track => track.stop());
      }
      audioContext.close();
    };
  }, [microphoneStream]);

  return <canvas className='h-[200px] w-full absolute top-1/2 -translate-y-1/2' ref={canvasRef} />;
};

export default AudioVisualizer;
