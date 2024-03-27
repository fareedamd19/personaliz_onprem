import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'
import React, { useEffect, useState } from 'react'
import LetsStartButton from '../I Frame/LetsStartButton'
import QuestionTitle from '../../Question Container/QuestionTitle'
import IframeContainer from '../I Frame/IframeContainer'
import DoneGoNextButton from '../I Frame/DoneGoNextButton'
import Calendly from './Option/Calendly'
import Hubspot from './Option/Hubspot'

const Calender = () => {
    const {isQuestionOnTopOfVideo,currentQuestionData,questionContainerHeight}=useGlobalStoreContext()
    const [loading,setLoading]=useState(false)
    const {type:calendar_type,value:calendar_url}=JSON.parse(currentQuestionData.current.options)
  
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
{(calendar_type==="tidycal"||calendar_type==="tucalendi")&&<>
<IframeContainer loading={loading} setLoading={setLoading} iframeUrl={calendar_url}/>

<DoneGoNextButton source="calendar"/>
</>
}
{calendar_type==="calendly"&&<Calendly loading={loading} setLoading={setLoading} url={calendar_url}/>}
{calendar_type==="hubspot"&&<Hubspot loading={loading} setLoading={setLoading} url={calendar_url}/>}

</section>}
</section>
    </>
  )
}

export default Calender

