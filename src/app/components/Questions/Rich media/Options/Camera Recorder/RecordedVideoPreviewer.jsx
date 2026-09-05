import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'



const RecordedVideoPreviewer = ({recordedVideoFile,handleNoClick,handleYesClick,src}) => {
   
    const videoRef=useRef(null)
    const tempVideoUrl=useRef(recordedVideoFile?window.URL.createObjectURL(recordedVideoFile):null)
    const [isPlaying,setIsPlaying]=useState(false)
    useEffect(()=>{
        if(videoRef){
            if(videoRef.current){
                videoRef.current.muted=false
                videoRef.current.play()
                setIsPlaying(true)

                videoRef.current.addEventListener("ended", function() {
                    setIsPlaying(false)
                  });
            }
        }

       return ()=>{
           
       } 
        },[videoRef])


function handleVideoClick(){
if(isPlaying){
    videoRef.current.pause()
    setIsPlaying(false)
}
else{
    videoRef.current.play()
    setIsPlaying(true)
}
}

  return (
    <>
       {tempVideoUrl.current&& <div className='w-full h-full relative cursor-pointer'>
      
            <video onClick={handleVideoClick} ref={videoRef} src={tempVideoUrl.current} className='w-full h-full object-cover'/>
            {!isPlaying&&<Image onClick={handleVideoClick} className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' src='/onprem/chrome/personaliz_play_Icon.svg' height={80} width={80} alt='personaliz play icon'/>}

            <div className='flex flex-col gap-3 absolute bottom-3 left-1/2 -translate-x-1/2'>
                <p className='text-white text-lg font-semibold text-center'>Ready to send ?</p>
                <p className='flex gap-3'>
                <span onClick={handleYesClick} className='size-[86px] rounded-full bg-[#36cf71cc] text-white text-2xl font-bold flex items-center justify-center hover:scale-105'>Yes</span>
                <span onClick={handleNoClick} className='size-[86px] rounded-full bg-[#959595cc] text-white text-2xl font-bold flex items-center justify-center hover:scale-105'>No</span>
                </p>
            </div>
        </div>}
    </>
  )
}

export default RecordedVideoPreviewer