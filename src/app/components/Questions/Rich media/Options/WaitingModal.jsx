import Image from 'next/image'
import React from 'react'
import { IoMdCloseCircleOutline } from "react-icons/io";
const WaitingModal = ({handleGoBack}) => {
  return (
   <>
    <section className='w-full h-full flex flex-col items-center justify-center p-4 bg-white gap-7'>
    <Image src="https://dyolkjkaata8s.cloudfront.net/Personaliz+Logos/Personaliz+Black+Logo+With+Text.png" alt="brand logo" width={200} height={200} />
    <h1 className='text-black text-xl font-semibold text-center'>{`⏳ We're waiting for you to give us access to your camera & microphone...`}</h1>
    <p className='text-black text-base text-center'>{`Please follow your browser's instructions.`}</p>

    <p onClick={handleGoBack} className='w-[55px] h-[55px] shadow-lg p-1 rounded-full border border-[#e6e6e6] bg-white flex items-center justify-center mt-auto cursor-pointer'>
    <IoMdCloseCircleOutline className='text-5xl'/>
    </p>
    </section>
   </>
  )
}

export default WaitingModal