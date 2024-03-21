import useClickOutside from '@/app/utils/useClickOutside';
import React, { Fragment, useRef, useState } from 'react'
import { FaVideo } from 'react-icons/fa'
import { RiSettings4Fill } from "react-icons/ri";

const CameraOptions = ({listOfVideoCameraOptions,selectedVideoId,handleResetRecorderWithNewId}) => {
   
const [showOptions,setShowOptions]=useState(false)
const ignoreElement = useRef(null);
const domNode = useClickOutside(() => setShowOptions(false),ignoreElement.current);
function chooseNewCamera(deviceId){
  if(selectedVideoId===deviceId){
    return
  }
    setShowOptions(false)
    handleResetRecorderWithNewId(deviceId)
}

  return (
    <>
        <section className='relative'>
           <div className='w-max relative flex flex-col gap-1 items-center'>
            <button onClick={()=>setShowOptions(true)} className='h-[48px] w-[48px] rounded-full flex items-center justify-center bg-[#11111199] cursor-pointer hover:bg-black hover:bg-opacity-70'>
            <FaVideo className='text-white text-2xl hover:scale-110 transition-all'/>
            <RiSettings4Fill className="absolute right-[1px] -top-[1px] text-gray-300 outline-black"/>
           </button>
           <p className='text-white text-sm drop-shadow-lg'>Camera</p>
           </div>
           {showOptions&&<div ref={domNode} className='w-max rounded-lg bg-white flex flex-col p-2 absolute top-[75px] -left-[5rem]'>
        {listOfVideoCameraOptions.map((item)=>{
            return <Fragment key={item.deviceId}>
                <p onClick={()=>chooseNewCamera(item.deviceId)} className='p-1 rounded text-black text-sm font-bold hover:bg-gray-200 cursor-pointer'>{item.label} <span className={`${selectedVideoId===item.deviceId?'':'hidden'} text-black font-extrabold ml-1`}>✔</span></p>
            </Fragment>
        })}
           </div>}
        </section>
    </>
  )
}

export default CameraOptions