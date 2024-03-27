import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext';
import React, { useEffect } from 'react'
import IframeLoader from '../../IframeLoader';

const Hubspot = ({setLoading,loading,url}) => {
    const {getNextQuestion}=useGlobalStoreContext()
const integrateMessageEventListener=(e)=>{  
    
        // Event is scheduled
         if( e.data.meetingBookSucceeded) {
            getNextQuestion('Calendar Event Booked');
            window.removeEventListener("message", integrateMessageEventListener);
        }
    
}

useEffect(()=>{
    const scriptElement = document.createElement('script');
    scriptElement.type = 'text/javascript';
    scriptElement.src = 'https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js';
    document.body.appendChild(scriptElement);
    window.addEventListener("message", integrateMessageEventListener);
    return ()=>{
        document.body.removeChild(scriptElement);
        window.removeEventListener("message", integrateMessageEventListener);
    }

//eslint-disable-next-line
},[])



  return (
  <>
    {loading&&<IframeLoader/>}

<iframe title='hubspot' src={url} className='shadow-lg w-full h-[65vh] rounded-md' onLoad={()=>{setLoading(false)}}/>
  </>
  )
}

export default Hubspot