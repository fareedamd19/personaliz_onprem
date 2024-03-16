import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'
import Image from 'next/image'
import React, {  useEffect, useRef, useState } from 'react'

const VideoContainer = () => {
  const {questionData}=useGlobalStoreContext()
    const personalizVideoSetInterval=useRef(null)
    const videoElm=useRef(null)
    const videoTimerRef=useRef(null)
    const[isVideoPlaying,setIsVideoPlaying]=useState(false)
    const [videoProgress,setVideoProgress]=useState(0)
    const [isMuted,setIsMuted]=useState(true)
 
    function getDuration(time=0){
        const minutes = Math.floor(time / 60);
        const seconds = Math.round(time - minutes * 60);
       if( isNaN(minutes)||isNaN(seconds)){
        return `00:00`
       }else
        return`${minutes}:${seconds<10?"0"+seconds:seconds}`
      } 

useEffect(()=>{
const video=videoElm.current
if(video){
    startVideoTracking(video)
}
return ()=>{
    removeVideoTracking()
}
//eslint-disable-next-line
},[videoElm?.current?.src])

function startVideoTracking(video){
personalizVideoSetInterval.current=setInterval(()=>{
    setVideoProgress(video.currentTime/video.duration*100)
    videoTimerRef.current.innerHTML=`${getDuration(Number(video.currentTime))} / ${getDuration(Number(video.duration))}`
    if(video.currentTime>=video.duration){
        setIsVideoPlaying(false)
    }  
},10)  
}
function removeVideoTracking(){
    clearInterval(personalizVideoSetInterval.current)
}

function handleVideoClick(){
if(videoElm.current){
  if(videoElm.current.paused){
    videoElm.current.play()
    setIsVideoPlaying(true)
    setIsMuted(false)
  }
  else{
    videoElm.current.pause()
    setIsVideoPlaying(false)
  }
}
}

  return (
    <>
        <section className='w-full h-full relative'>
        <video onClick={handleVideoClick} muted={isMuted} autoPlay ref={videoElm} poster='https://dyolkjkaata8s.cloudfront.net/Personaliz+Logo+ANimation+For+Video+Poster.gif' onError={(e)=>{e.target.src=`${questionData?.original_s3url}#t=0.001`}} className={`w-full h-full ${questionData?.video_fit==='zoomed'?'object-cover':'object-contain'}`} src={`${questionData?.video_url}#t=0.001`} playsInline preload='auto' allowFullScreen></video>
        {!isVideoPlaying&&<Image className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer' src='https://dyolkjkaata8s.cloudfront.net/personaliz_play_Icon.svg' height={80} width={80} alt='personaliz play icon'/>}

<div className='bg-black bg-opacity-10 w-full flex flex-col absolute top-0'>
<div className='w-full h-[0.75rem] bg-[#6b7280] '>
  <p style={{width:`${videoProgress}%`}} className='w-0 bg-black h-full'></p>
</div>

<div className='w-full px-1 py-1 mt-1'>
<p className='flex items-center gap-3 w-max ml-2'>
<span className='border border-white rounded-md p-1 bg-black bg-opacity-30'><Image src='https://d34um3r0i45esv.cloudfront.net/Control+Options/Replay+Icon.svg' width={20} height={20} alt='replay icon'/></span>
<span className='border border-white rounded-md p-1 bg-black bg-opacity-30'><Image src='https://d34um3r0i45esv.cloudfront.net/Control+Options/Restart+Icon.svg' width={20} height={20} alt='replay icon'/></span>
<span ref={videoTimerRef} className='border border-white rounded-md p-1 bg-black bg-opacity-30 text-white text-sm'>{`00:00 / 00:00`}</span>
</p>
</div>

        </div>
        </section>
    </>
  )
}

export default VideoContainer