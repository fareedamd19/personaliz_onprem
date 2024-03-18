import React from 'react'
import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'
import Image from 'next/image'

const ErrorModal = () => {
    const {showErrorModal}=useGlobalStoreContext()
   
  return (
    
    <section className='w-full h-screen flex items-center justify-center'>
    <div style={{boxShadow:'0 0 4px #00000040'}} className='w-[95%] md:w-[64%] h-[80vh] m-auto flex flex-col items-center justify-center gap-4 rounded-2xl bg-white p-4 md:p-10'>
    <h1 className='text-2xl md:text-4xl font-bold text-center'>{showErrorModal[0]}</h1>
    <p className='text-2xl md:text-4xl font-bold text-center'>{showErrorModal[1]}</p>
    <Image src={showErrorModal[2]} alt='error' width={300} height={300}/>
    </div>
    </section>
  )
}

export default ErrorModal