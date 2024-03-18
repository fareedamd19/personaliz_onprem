import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'
import Image from 'next/image'
import React from 'react'

const Customize = () => {
    const {configData,fontThemeObj} = useGlobalStoreContext()
    const {title,description,backgroundColor,end_screen_logo}=JSON.parse(configData.end_screen)
   
  return (
    <>
      <section className="w-full h-[90vh] flex items-center justify-center">
        <div style={{backgroundColor:backgroundColor}} className='w-full md:w-[64%] h-[80vh] m-auto flex flex-col rounded-2xl p-3 md:p-10 items-center justify-center'>
        <h1 style={{fontFamily:fontThemeObj?.font_name}} className='text-2xl md:text-4xl text-center text-white font-bold '>{title}</h1>

        <p style={{fontFamily:fontThemeObj?.font_name}} className='text-white text-base md:text-xl text-center mt-6'>{description}</p>

        {end_screen_logo&&<Image className='mt-10' src={end_screen_logo} alt='icon' width={100} height={100}/>}
        </div>
      </section>  
    </>
  )
}

export default Customize