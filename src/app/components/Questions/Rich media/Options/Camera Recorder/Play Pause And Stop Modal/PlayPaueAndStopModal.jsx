import Image from 'next/image'
import React from 'react'
import { IoMdCloseCircleOutline } from 'react-icons/io'
import { Tooltip } from "react-tooltip";
import styles from "./PlayPaueAndStopModal.module.css"

const PlayPaueAndStopModal = ({startRecording,handleCloseCameraAndGoBack,showMoreOptions,pauseRecording=()=>{},stopRecording=()=>{},isRecording=false}) => {
  return (
   <>
    <div className='w-max flex flex-col gap-3 absolute bottom-0 left-1/2 -translate-x-1/2'>
    {!showMoreOptions&&<p className='w-full text-center text-white text-lg drop-shadow-lg font-extrabold'>Hit <strong className='text-[#f74e7b]'>{isRecording==="paused"?"RESUME":"RECORD"}</strong> to {isRecording==="paused"?"continue":"start"}!</p>}
   <div className='flex items-center justify-center gap-3'>
   {showMoreOptions&&<><p id='rich_media_pause_recording_btn' onClick={pauseRecording} className='w-[50px] h-[50px] shadow-lg p-1 rounded-full border border-[#e6e6e6] bg-white flex items-center justify-center mt-auto cursor-pointer'>
        <Image src='/onprem/chrome/Pause_Icon.svg' alt="pause icon" width={40} height={40} className='w-full h-full'/>
        </p>
    <p id='rich_media_stop_recording_btn' onClick={stopRecording} className={`${styles.stopRecordingOuterCont} w-[65px] h-[65px] shadow-lg p-1 rounded-full border border-[#e6e6e6] flex items-center justify-center mt-auto cursor-pointer mb-6`}>
    <Image src='/onprem/chrome/stop_recording_button_videoask.png'alt="stop icon" width={40} height={40} className='w-full h-full'/>
    </p></>}

        {!showMoreOptions&&<p id='rich_media_start_recording_btn' onClick={startRecording} className='w-[65px] h-[65px] shadow-lg p-1 rounded-full border border-[#e6e6e6] bg-white flex items-center justify-center mt-auto cursor-pointer'>
        <Image src='/onprem/chrome/start_recording_button_videoask.png' alt="record icon" width={40} height={40} className='w-full h-full'/>
        </p>}
        <p id='rich_media_cancel_goback_btn' onClick={handleCloseCameraAndGoBack} className='w-[50px] h-[50px] shadow-lg p-1 rounded-full border border-[#e6e6e6] bg-white flex items-center justify-center mt-auto cursor-pointer'>
        <IoMdCloseCircleOutline className='text-5xl'/>
        </p>

        {showMoreOptions&&<><Tooltip className='rounded text-lg font-semibold' anchorId={`rich_media_pause_recording_btn`} place="right" content={`Pause Recording`}/>
        <Tooltip className='rounded text-lg font-semibold' anchorId={`rich_media_stop_recording_btn`} place="right" content={`Stop Recording`}/></>}
        <Tooltip className='rounded text-lg font-semibold' anchorId={`rich_media_start_recording_btn`} place="right" content={`${isRecording==="paused"?"Resume":"Start"} Recording`}/>
        <Tooltip className='rounded text-lg font-semibold' anchorId={`rich_media_cancel_goback_btn`} place="right" content={`Cancel`}/>
   </div>
        </div>
   </>
  )
}

export default PlayPaueAndStopModal