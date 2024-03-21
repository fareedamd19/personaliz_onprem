import React, { useEffect, useRef } from 'react'

const RecordedVideoPreviewer = ({recordedVideoFile}) => {
    const videoRef=useRef(null)
    const tempVideoUrl=recordedVideoFile?window.URL.createObjectURL(recordedVideoFile):null

    useEffect(()=>{
        if(videoRef){
            if(videoRef.current){
                videoRef.current.muted=false
            }
        }
        },[videoRef])
  return (
    <>
        <div className='w-full h-full relative'>
            <video ref={videoRef} src={tempVideoUrl} controls autoPlay className='w-full h-full object-cover'/>
        </div>
    </>
  )
}

export default RecordedVideoPreviewer