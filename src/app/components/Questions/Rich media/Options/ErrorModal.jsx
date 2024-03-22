import React from 'react'
import { IoMdCloseCircleOutline } from 'react-icons/io'

const ErrorModal = ({handleGoBack,targetSrc}) => {
  return (
   <>
      <section className='w-full h-full flex flex-col items-center justify-center p-4 bg-white gap-7'>
        <h1 className='text-black text-xl font-bold text-center'>{`Please enable ${targetSrc==="screen"?'screen &':targetSrc==="video"?"camera &":""} microphone permissions`}</h1>
        <p className='text-gray-400 text-base'>{`(You may have accidentally said no)`}</p>
        <p className='text-lg text-red-500 font-semibold'>How to fix?</p>
        {window.innerWidth>600?<p>{`Click the 🔒lock icon in your browser's address bar, set the correct permissions and then refresh this page.`}</p>:<>
            <ol className='flex flex-col gap-2'>
                <li className='text-sm'><span className='text-red-500 mr-2'>1.</span>Locate your browser settings.</li>
                <li className='text-sm'><span className='text-red-500 mr-2'>2.</span>{`Make sure to set the correct ${targetSrc==="screen"?'screen &':targetSrc==="video"?"camera &":""} microphone permissions for current website.`}</li>
                <li className='text-sm'><span className='text-red-500 mr-2'>3.</span>Finally,just refresh the page.</li>
            </ol>
        </>}

        <p onClick={handleGoBack} className='w-[55px] h-[55px] shadow-lg p-1 rounded-full border border-[#e6e6e6] bg-white flex items-center justify-center mt-auto cursor-pointer'>
    <IoMdCloseCircleOutline className='text-5xl'/>
    </p>
      </section>
   </>
  )
}

export default ErrorModal