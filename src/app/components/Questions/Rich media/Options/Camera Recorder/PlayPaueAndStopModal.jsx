import Image from 'next/image'
import React from 'react'
import { IoMdCloseCircleOutline } from 'react-icons/io'

const PlayPaueAndStopModal = ({startRecording,handleCloseCameraAndGoBack,showMoreOptions,pauseRecording=()=>{},stopRecording=()=>{}}) => {
  return (
   <>
    <div className='w-max flex gap-3 absolute bottom-0 left-1/2 -translate-x-1/2'>
    {showMoreOptions&&<><p onClick={pauseRecording} className='w-[50px] h-[50px] shadow-lg p-1 rounded-full border border-[#e6e6e6] bg-white flex items-center justify-center mt-auto cursor-pointer'>
        <Image src='https://d34um3r0i45esv.cloudfront.net/rich_media_icons/Pause+Icon.svg' alt="record icon" width={40} height={40} className='w-full h-full'/>
        </p>
    <p onClick={stopRecording} className='w-[65px] h-[65px] shadow-lg p-1 rounded-full border border-[#e6e6e6] bg-white flex items-center justify-center mt-auto cursor-pointer mb-6'>
    <Image src='https://d34um3r0i45esv.cloudfront.net/rich_media_icons/stop_recording_button_videoask.png'alt="record icon" width={40} height={40} className='w-full h-full'/>
    </p></>}

        {!showMoreOptions&&<p onClick={startRecording} className='w-[65px] h-[65px] shadow-lg p-1 rounded-full border border-[#e6e6e6] bg-white flex items-center justify-center mt-auto cursor-pointer'>
        <Image src='https://d34um3r0i45esv.cloudfront.net/rich_media_icons/start_recording_button_videoask.png' alt="record icon" width={40} height={40} className='w-full h-full'/>
        </p>}
        <p onClick={handleCloseCameraAndGoBack} className='w-[50px] h-[50px] shadow-lg p-1 rounded-full border border-[#e6e6e6] bg-white flex items-center justify-center mt-auto cursor-pointer'>
        <IoMdCloseCircleOutline className='text-5xl'/>
        </p>
        </div>
   </>
  )
}

export default PlayPaueAndStopModal