import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'
import Image from 'next/image'
import React, {  useEffect, useRef, useState } from 'react'
import styles from "./VideoContainer.module.css"

const websiteSrollContPosition={
  bottom_left:'bottom-[0.5rem] left-[0.5rem]',
  bottom_right:'bottom-[0.5rem] right-[0.5rem]',
  top_right:'top-[0.5rem] right-[0.5rem]',
  top_left:'top-[0.5rem] left-[0.5rem]'
}

const websiteSrollContShape={
  circle:'rounded-[50%]',
  square:'rounded-md'
}


const VideoContainer = () => {
  const {currentQuestionData,isFirstTimeVideoClicked,setIsFirstTimeVideoClicked,website_scroll_config}=useGlobalStoreContext()
  
    const personalizVideoSetInterval=useRef(null)
    const videoElm=useRef(null)
    const scrollVideoElm=useRef(null)
    const videoTimerRef=useRef(null)
    const [isVideoPlaying,setIsVideoPlaying]=useState(false)
    const [videoProgress,setVideoProgress]=useState(0)
    const [isMuted,setIsMuted]=useState(true)
 
function getVideoElementToTarget(){
  let video 
if(website_scroll_config){
  video=scrollVideoElm.current
}
else{
  video=videoElm.current
}
return video
}

    function getDuration(time=0){
        const minutes = Math.floor(time / 60);
        const seconds = Math.round(time - minutes * 60);
       if( isNaN(minutes)||isNaN(seconds)){
        return `00:00`
       }else
        return`${minutes}:${seconds<10?"0"+seconds:seconds}`
      } 

useEffect(()=>{
let video=getVideoElementToTarget()
if(video){
    startVideoTracking(video)
}
return ()=>{
    removeVideoTracking()
}
//eslint-disable-next-line
},[videoElm?.current?.src,scrollVideoElm?.current?.src])

function startVideoTracking(video){
personalizVideoSetInterval.current=setInterval(()=>{
    setVideoProgress(video.currentTime/video.duration*100)
    videoTimerRef.current.innerHTML=`${getDuration(Number(video.currentTime))} / ${getDuration(Number(video.duration))}`
    if(video.currentTime>=video.duration){
        setIsVideoPlaying(false)
        if(website_scroll_config){
          if(videoElm.current){
            videoElm.current.pause()
          }
        }
    }  
},10)  
}
function removeVideoTracking(){
    clearInterval(personalizVideoSetInterval.current)
}

function handleVideoClick(){
  
  if(!isVideoPlaying){
    personalizPlayVideoFunction()
  }
  else {
    if(!isFirstTimeVideoClicked){personalizPlayVideoFunction()}
    else{
      personalizPauseVideoFunction()
    }
}

}

function personalizPlayVideoFunction(){
  setIsVideoPlaying(true)
  if(!isFirstTimeVideoClicked){
    setIsFirstTimeVideoClicked(true)
    setIsMuted(false)
    videoElm.current.currentTime=0
    if(website_scroll_config){
      if(scrollVideoElm.current){
        scrollVideoElm.current.muted=false
        scrollVideoElm.current.currentTime=0
      }
    }
    else{
      videoElm.current.muted=false
    }
  }
  if(website_scroll_config){
    if(scrollVideoElm.current){

    if(videoElm.current.currentTime>=videoElm.current.duration){
      if(scrollVideoElm.current.currentTime>=scrollVideoElm.current.duration){
        videoElm.current.play()
      }
      
    }
    else{videoElm.current.play() }
    scrollVideoElm.current.play()
    }
    
  }else{
    videoElm.current.play()
  }
}
function personalizPauseVideoFunction(){
  setIsVideoPlaying(false)
  videoElm.current.pause()
  if(website_scroll_config){
    if(scrollVideoElm.current){
      scrollVideoElm.current.pause()
    }
  }
}

function handleSeekVideo(e){
  let video=getVideoElementToTarget()

const mainTarget=document.querySelector(`.${styles.prgressBarOuterCont}`)
const width = mainTarget.clientWidth;
const offsetX = e.nativeEvent.offsetX;
const percentage = (offsetX / width) ;
  let interactlyCurrentRange = percentage * (video.duration);

  if(scrollVideoElm.current){
      scrollVideoElm.current.currentTime= interactlyCurrentRange 
  }
  else{
    videoElm.current.currentTime= interactlyCurrentRange
  }
}

  return (
    <>
        <section className='w-full h-full relative'>
        <video onClick={handleVideoClick} muted autoPlay ref={videoElm} poster='https://dyolkjkaata8s.cloudfront.net/Personaliz+Logo+ANimation+For+Video+Poster.gif' onError={(e)=>{e.target.src=`${currentQuestionData?.original_s3url}#t=0.001`}} className={`w-full h-full ${currentQuestionData?.video_fit==='zoomed'?'object-cover':'object-contain'}`} src={`${currentQuestionData?.video_url}#t=0.001`} playsInline preload='auto' allowFullScreen></video>

        {website_scroll_config&&<div 
        className={`${styles.scrollVideoOuterCont} ${websiteSrollContPosition[website_scroll_config?.position]} ${websiteSrollContShape[website_scroll_config?.shape]}`}>
          <video className='h-full w-full object-cover object-center' muted autoPlay playsInline preload='auto' allowFullScreen ref={scrollVideoElm} src={`${website_scroll_config?.dyn_video_url}#t=0.001`} onError={(e)=>{e.target.src=`${website_scroll_config?.original_s3_url}#t=0.001`}}></video>
        </div>
        }

        {!isVideoPlaying&&<Image onClick={handleVideoClick} className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer' src='https://dyolkjkaata8s.cloudfront.net/personaliz_play_Icon.svg' height={80} width={80} alt='personaliz play icon'/>}

<div className='bg-black bg-opacity-10 w-full flex flex-col absolute top-0'>
<div onClick={handleSeekVideo} className={`${styles.prgressBarOuterCont} cursor-pointer w-full h-[0.75rem] bg-[#6b7280]`}>
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