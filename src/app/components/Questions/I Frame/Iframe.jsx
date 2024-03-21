import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'
import React, { useEffect, useState } from 'react'
import LetsStartButton from './LetsStartButton'
import DoneGoNextButton from './DoneGoNextButton'
import IframeContainer from './IframeContainer'
import QuestionTitle from '../../Question Container/QuestionTitle'

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
{currentQuestionData.current.text&&<QuestionTitle/>}

<IframeContainer loading={loading} setLoading={setLoading} iframeUrl={iframeUrl}/>

<DoneGoNextButton/>
</section>}
</section>
    </>
  )
}

export default Iframe

