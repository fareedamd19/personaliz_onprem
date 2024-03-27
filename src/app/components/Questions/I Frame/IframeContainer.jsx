import React from 'react'
import IframeLoader from '../IframeLoader'

const IframeContainer = ({loading,iframeUrl,setLoading}) => {

  return (
  <>
    {loading&&<IframeLoader/>}
<iframe id='personaliz_play_iframe_for_iframe_type_ques' className='shadow-lg w-full h-[55dvh] rounded-md' src={iframeUrl} title="Iframe" onLoad={()=>{setLoading(false)}} ></iframe>
  </>
  )
}

export default IframeContainer