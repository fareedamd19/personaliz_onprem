import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'
import Image from 'next/image'
import React, {  useEffect, useRef, useState } from 'react'
import styles from "./VideoContainer.module.css"
import { Tooltip } from "react-tooltip";
import { RiFullscreenFill } from "react-icons/ri";
import SubTitleContainer from './SubTitleContainer';

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
  const {currentQuestionData,website_scroll_config,target_video_element,personaliz_branding,isVideoClickedOnFirstLoad,handleQuestionConatinerUpOrDown,questionContainerHeight,configData,max_video_watch_time,captureUserExit,isQuestionOnTopOfVideo}=useGlobalStoreContext()
 
    const personalizVideoSetInterval=useRef(null)
    const videoElm=useRef(null)
    const scrollVideoElm=useRef(null)
    const videoTimerRef=useRef(null)
    const [isVideoPlaying,setIsVideoPlaying]=useState(false)
    const [videoProgress,setVideoProgress]=useState(0)
    const [isMuted,setIsMuted]=useState(true)
    const posterUrl=personaliz_branding==="none"?"https://d2p77m460qjhbw.cloudfront.net/interactly_circular_loader_none.gif":"https://dyolkjkaata8s.cloudfront.net/Personaliz+Logo+ANimation+For+Video+Poster.gif"
    const alreadyAutomaticallyMovedUp=useRef(false)

    const subtitile_data=currentQuestionData?.current?.subtitle_data??null

function getVideoElementToTarget(){
  let video 
if(website_scroll_config){
  video=scrollVideoElm.current
}
else{
  video=videoElm.current
}
target_video_element.current=video
if(isVideoClickedOnFirstLoad.current){
  video.muted=false
  setIsVideoPlaying(true)
  setIsMuted(false)
}
if(!isVideoClickedOnFirstLoad.current&&!(+configData?.auto_play)){
  video.pause()
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
},[videoElm?.current?.src,scrollVideoElm?.current?.src,configData])

function startVideoTracking(video){

  
 
personalizVideoSetInterval.current=setInterval(()=>{
  handleCheckForAutomaticallyMoveUp(video)
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
    if(video.paused){
      setIsVideoPlaying(false)
    }
    else{
      if(isVideoClickedOnFirstLoad.current){
        setIsVideoPlaying(true)
      }
      else{
        setIsVideoPlaying(false)
      }
    }
},20)  
}
function removeVideoTracking(){
    clearInterval(personalizVideoSetInterval.current)
}

function handleVideoClick(){
  
  if(!isVideoPlaying){
    personalizPlayVideoFunction()
  }
  else {
    if(!isVideoClickedOnFirstLoad.current){personalizPlayVideoFunction()}
    else{
      personalizPauseVideoFunction()
    }
}

}

function personalizPlayVideoFunction(){
  setIsVideoPlaying(true)
  if(!isVideoClickedOnFirstLoad.current){
    isVideoClickedOnFirstLoad.current=true
    alreadyAutomaticallyMovedUp.current=false
    handleQuestionConatinerUpOrDown('down')
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


function handleCheckForAutomaticallyMoveUp(video){
  const videoPopupTimer=+currentQuestionData.current?.delay_interaction
  const maximizeOptionPannel=+configData?.maximize_option_panel
  const isLeadTriggeredType=+currentQuestionData.current?.is_lead_trigger
  const currentTime=video.currentTime
  const videoTotalDuration=video.duration
 
  if(currentTime>=(videoPopupTimer>=videoTotalDuration?videoTotalDuration:videoPopupTimer)){

    if(questionContainerHeight==='bottom'&&!alreadyAutomaticallyMovedUp.current){
  
      if(maximizeOptionPannel){
        if(isLeadTriggeredType){
          handleQuestionConatinerUpOrDown('top')
          alreadyAutomaticallyMovedUp.current=true
        }
        else{
          handleQuestionConatinerUpOrDown('up')
          alreadyAutomaticallyMovedUp.current=true
        }
      }
      else{           
        handleQuestionConatinerUpOrDown("up")
        alreadyAutomaticallyMovedUp.current=true
    }
    }

  }
 
}

function handleRestartVideoClick(){
  if(!isVideoClickedOnFirstLoad.current){
    isVideoClickedOnFirstLoad.current=true
  }
  max_video_watch_time.current=Math.max(max_video_watch_time.current,target_video_element.current.currentTime)
  setIsMuted(false)
  if(website_scroll_config){
    if(scrollVideoElm.current){
      scrollVideoElm.current.currentTime=0
      scrollVideoElm.current.play()
      scrollVideoElm.current.muted=false
    }
  }
  videoElm.current.currentTime=0
  videoElm.current.play()
  if(!website_scroll_config){
    videoElm.current.muted=false
  }

}

function handleRestartSessionClick(){
  captureUserExit()
  window.location.reload()
}
function handleToggleSound(){
  if(!isVideoClickedOnFirstLoad.current){
    isVideoClickedOnFirstLoad.current=true
  }
  if(isMuted){
    setIsMuted(false)
    if(website_scroll_config){
      scrollVideoElm.current.muted=false
    }
    else{
      videoElm.current.muted=false
    }
  }
  else{
    setIsMuted(true)
    if(website_scroll_config){
      scrollVideoElm.current.muted=true
    }
    else{
      videoElm.current.muted=true
    }
  }

}
function handleFullscreen(){
  const personaliz_video_outer_conatiner=document.querySelector(`.${styles.videoOuterConatiner}`)
  if(document.fullscreenElement ===personaliz_video_outer_conatiner){
    if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    else if (document.webkitFullscreenElement) {
        document.webkitCancelFullScreen();
      } else if (document.mozFullScreenElement) {
        document.mozCancelFullScreen();
      } else if (document.msFullscreenElement) {
        document.msExitFullscreen();
      }
}
else

if (personaliz_video_outer_conatiner.requestFullscreen) {
    personaliz_video_outer_conatiner.requestFullscreen();
  } else if (personaliz_video_outer_conatiner.mozRequestFullScreen) { // Firefox
    personaliz_video_outer_conatiner.mozRequestFullScreen();
  } else if (personaliz_video_outer_conatiner.webkitRequestFullscreen) { // Chrome, Safari, Opera
    personaliz_video_outer_conatiner.webkitRequestFullscreen();
  } else if (personaliz_video_outer_conatiner.msRequestFullscreen) { // Edge
    personaliz_video_outer_conatiner.msRequestFullscreen();
  }else if (videoElm.current.webkitEnterFullScreen) { // Iphone
    videoElm.current.webkitEnterFullScreen();
  }
}
  return (
    <>
        <section className={`${styles.videoOuterConatiner} w-full h-full relative`}>

        {/* MAIN VIDEO */}
        <video onClick={handleVideoClick} muted autoPlay ref={videoElm} poster={posterUrl} onError={(e)=>{e.target.src=`${currentQuestionData.current?.original_s3url}#t=0.001`}} className={`w-full h-full ${currentQuestionData.current?.video_fit==='zoomed'?'object-cover':'object-contain'}`} src={`${currentQuestionData.current?.video_url}#t=0.001`} playsInline preload='auto' allowFullScreen></video>

        {/* WEBSITE SCROLL VIDEO */}
        {website_scroll_config&&<div 
        className={`${styles.scrollVideoOuterCont} ${websiteSrollContPosition[website_scroll_config?.position]} ${websiteSrollContShape[website_scroll_config?.shape]}`}>
          <video className={`h-full w-full object-cover object-center ${websiteSrollContShape[website_scroll_config?.shape]}`} muted autoPlay playsInline preload='auto' allowFullScreen ref={scrollVideoElm} src={`${website_scroll_config?.dyn_video_url}#t=0.001`} poster={posterUrl} onError={(e)=>{e.target.src=`${website_scroll_config?.original_s3_url}#t=0.001`}}></video>
        </div>
        }

{/* SUBTITLE CONTAINER */}
{/* {subtitile_data&&<SubTitleContainer subtitile_data={subtitile_data}/>} */}

{/* PLAY ICON */}
{!isVideoPlaying&&<Image onClick={handleVideoClick} className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer' src='https://dyolkjkaata8s.cloudfront.net/personaliz_play_Icon.svg' height={80} width={80} alt='personaliz play icon'/>}


<div className='bg-black bg-opacity-10 w-full flex flex-col absolute top-0'>
{/* VIDEO PROGRESS BAR */}
<div onClick={handleSeekVideo} className={`${styles.prgressBarOuterCont} cursor-pointer w-full h-[0.75rem] bg-[#6b7280]`}>
  <p style={{width:`${videoProgress}%`}} className='w-0 bg-black h-full'></p>
</div>

{/* VIDEO CONTROLS BAR */}
<div className='w-full px-1 py-1 mt-1 flex items-center'>
<div className='flex items-center gap-3 w-max ml-2'>
<span onClick={handleRestartVideoClick} id='restart_video_tooltip_id' className='cursor-pointer border border-white rounded-md p-1 bg-black bg-opacity-30'><Image src='https://d34um3r0i45esv.cloudfront.net/Control+Options/Replay+Icon.svg' width={20} height={20} alt='replay icon'/></span>
<Tooltip style={{borderRadius:"5px"}} anchorId="restart_video_tooltip_id" place="bottom" content={'Restart video'}/>
<span onClick={handleRestartSessionClick} id='restart_session_tooltip_id' className='cursor-pointer border border-white rounded-md p-1 bg-black bg-opacity-30'><Image src='https://d34um3r0i45esv.cloudfront.net/Control+Options/Restart+Icon.svg' width={20} height={20} alt='replay icon'/></span>
<Tooltip style={{borderRadius:"5px"}} anchorId="restart_session_tooltip_id" place="bottom" content={'Restart session'}/>
<span ref={videoTimerRef} className='cursor-default border border-white rounded-md p-1 bg-black bg-opacity-30 text-white text-sm'>{`00:00 / 00:00`}</span>
</div>

<div className='flex items-center gap-3 w-max ml-auto'>
<span onClick={handleToggleSound} className='cursor-pointer border border-white rounded-md p-1 bg-black bg-opacity-30'>
{isMuted?<Image src='https://d34um3r0i45esv.cloudfront.net/Control+Options/Mute+icon.svg' width={20} height={20} alt='mute icon'/>:
<Image src='https://d34um3r0i45esv.cloudfront.net/Control+Options/Sound+icon.svg' width={20} height={20} alt='sound icon'/>
}
</span>
<span onClick={handleFullscreen} className='cursor-pointer border border-white rounded-md p-1 bg-black bg-opacity-30'>
<RiFullscreenFill className='text-white text-xl'/>
</span>
</div>
</div>

</div>

{/* COMPANY BRAND LOGO */}
 {personaliz_branding!=="none"&&<div style={{display:(isQuestionOnTopOfVideo&&questionContainerHeight==='bottom')?"none":""}} className='bg-black bg-opacity-50 text-white text-lg font-sans font-bold w-full h-[35px] absolute right-0 bottom-0 flex items-center justify-center gap-2 z-50'><em>Powered by</em><Image src="https://personaliz-uploads.s3.ap-south-1.amazonaws.com/Personaliz_white_logo.png" alt="brandLogo" width={30} height={30}/> <em>Personaliz.ai</em></div>}
</section>
    </>
  )
}

export default VideoContainer