import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'
import React, { useEffect, useState } from 'react'
import LetsStartButton from './LetsStartButton'
import DoneGoNextButton from './DoneGoNextButton'

const Iframe = () => {
    const {isQuestionOnTopOfVideo,currentQuestionData,fontThemeObj,is_RTL,getBackgroundColorForTitle,questionContainerHeight}=useGlobalStoreContext()
    const [loading,setLoading]=useState(false)
    const iframeUrl=JSON.parse(currentQuestionData.current.options)?.value
  
useEffect(()=>{
  setLoading((questionContainerHeight==="top"||!isQuestionOnTopOfVideo))

  return()=>{
    setLoading(false)
  }
},[questionContainerHeight,isQuestionOnTopOfVideo])

  return (
    <>
<section>
{isQuestionOnTopOfVideo&&questionContainerHeight==="mid"&&<LetsStartButton/>}
{(questionContainerHeight==="top"||!isQuestionOnTopOfVideo)&&<section className='w-[90%] h-full flex flex-col gap-3 mx-auto mt-4'>
{currentQuestionData.current.text&&<h1 style={{
fontFamily:fontThemeObj?.font_name,
fontSize:`${+fontThemeObj?.font_size}px`,
backgroundColor:getBackgroundColorForTitle(),
color:fontThemeObj?.title_text_color,
direction:(is_RTL)?"rtl":"",
unicodeBidi:(is_RTL)?"bidi-override":""
}} className={` ${isQuestionOnTopOfVideo?'text-center':''} w-full py-2 rounded-md font-semibold`}>{currentQuestionData.current.text}</h1>}
{loading&&<div className='w-full h-[50vh] rounded-md flex items-center justify-center bg-white'>
<div className='w-[117px] h-[117px]'>
<video className={`w-full h-full object-cover object-center`} src={"https://personaliz.s3.ap-south-1.amazonaws.com/PersonalizBlackLogoAnimatedForLoading.mp4"} playsInline muted autoPlay loop></video>
</div>
</div>}
<iframe className='w-full h-[50vh] rounded-md' src={iframeUrl} title="Iframe" onLoad={()=>{setLoading(false)}} ></iframe>

<DoneGoNextButton/>
</section>}
</section>
    </>
  )
}

export default Iframe

