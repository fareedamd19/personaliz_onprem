import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext';
import React from 'react'
import { useCalendlyEventListener, InlineWidget } from "react-calendly";
import IframeLoader from '../../IframeLoader';

const Calendly = ({loading,url,setLoading}) => {
    const {getNextQuestion}=useGlobalStoreContext()

    useCalendlyEventListener({
        onProfilePageViewed: () => setLoading(false),
        onEventScheduled: (e) => getNextQuestion('Calendar Event Booked'),
      });

  return (
   <>
   {loading&&<IframeLoader/>}
    <InlineWidget styles={{height:"55dvh",width:"100%",borderRadius:"6px"}} url={url} />
   </>
  )
}

export default Calendly