import React from 'react'

const IframeContainer = ({loading,iframeUrl,setLoading}) => {

  return (
  <>
    {loading&&<div className='shadow-lg w-full h-[50vh] rounded-md flex items-center justify-center bg-white'>
<div className='w-[117px] h-[117px]'>
<video className={`w-full h-full object-cover object-center`} src={"https://personaliz.s3.ap-south-1.amazonaws.com/PersonalizBlackLogoAnimatedForLoading.mp4"} playsInline muted autoPlay loop></video>
</div>
</div>}
<iframe id='personaliz_play_iframe_for_iframe_type_ques' className='shadow-lg w-full h-[50vh] rounded-md' src={iframeUrl} title="Iframe" onLoad={()=>{setLoading(false)}} ></iframe>
  </>
  )
}

export default IframeContainer