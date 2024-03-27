import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext';
import React from 'react'
import { useCalendlyEventListener, InlineWidget } from "react-calendly";
import IframeLoader from '../../IframeLoader';

const Calendly = ({loading,url,setLoading}) => {
    const {getNextQuestion,isQuestionOnTopOfVideo}=useGlobalStoreContext()

    useCalendlyEventListener({
        onProfilePageViewed: () => setLoading(false),
        onEventScheduled: (e) => getNextQuestion('Calendar Event Booked'),
      });

  return (
   <>
   {loading&&<IframeLoader/>}
    <div className={`h-[55dvh] w-full rounded-md ${isQuestionOnTopOfVideo?'mt-0 md:-mt-11':""}`}>
    <InlineWidget styles={{height:"100%",width:"100%"}} url={url} />
    </div>
   </>
  )
}

export default Calendly