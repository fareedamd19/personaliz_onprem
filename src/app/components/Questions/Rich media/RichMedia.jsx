import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'
import React, { Fragment, useEffect, useState } from 'react'
import QuestionTitle from '../../Question Container/QuestionTitle'
import { FaVideo } from "react-icons/fa6";
import { AiFillAudio } from "react-icons/ai";
import { MdTextFields } from "react-icons/md";
import { PiLaptopFill } from "react-icons/pi";
import { GrAttachment } from "react-icons/gr";
import styles from "./Richmedia.module.css"
import { Tooltip } from "react-tooltip";
import { pauseAllVideos } from '@/app/utils/Functions';
import CameraRecorder from './Options/Camera Recorder/CameraRecorder';
import AudioRecorder from './Options/Audio Recorder/AudioRecorder';
import EnterText from './Options/Enter Text/EnterText';
import ScreenRecorder from './Options/Screen Recorder/ScreenRecorder';
import UploadFile from './Options/Upload File/UploadFile';


const rich_media_icons_obj={
  video:{icon:<FaVideo className='text-xl'/>,id:"rich_media_video_icon",text:"Record your video"},
  audio:{icon:<AiFillAudio className='text-2xl'/>,id:"rich_media_audio_icon",text:"Record your audio"},
  text:{icon:<MdTextFields className='text-2xl'/>,id:"rich_media_text_icon",text:"Enter your text"},
  screen:{icon:<PiLaptopFill className='text-2xl'/>,id:"rich_media_screen_icon",text:"Record your screen"},
  upload:{icon:<GrAttachment className='text-2xl'/>,id:"rich_media_upload_icon",text:"Upload your file"}

}

const RichMedia = () => {
  const {isQuestionOnTopOfVideo,currentQuestionData,fontThemeObj,optionThemeObj,handleQuestionConatinerUpOrDown}=useGlobalStoreContext()
const[options,setOptions]=useState([])
const [choosenOption,setChoosenOption]=useState(null)

useEffect(()=>{
  const optionsObj=JSON.parse(currentQuestionData.current.options)
  for(let key in optionsObj){
  setOptions(prev=>[...prev,optionsObj[key]])
  }
  return ()=>{
  setOptions([])
  }
  
  },[currentQuestionData])

function handleOptionClick(opt){
pauseAllVideos()
if(isQuestionOnTopOfVideo){
  handleQuestionConatinerUpOrDown('top')
}
setChoosenOption(opt)
}

function handleGoBack(){
  setChoosenOption(null)
}

  return (
   <>
    <section className='w-[90%] mx-auto mt-4'>
    {!choosenOption&&<Fragment>
    {currentQuestionData.current.text&&<QuestionTitle/>}

    <div className={`${styles.optionOuterCont} w-max flex flex-wrap gap-3 mt-5 mx-auto`}>
    {options.length>0&&options.map((option,index)=>{
    return <Fragment key={index}>
      <div onClick={()=>handleOptionClick(option)} id={`${rich_media_icons_obj[option.type]["id"]}`} style={{border:`1px solid ${optionThemeObj?.option_border_color}`}} className='w-[60px] h-[60px] rounded-full flex items-center justify-center p-1 cursor-pointer'>
      <p style={{
    fontFamily:fontThemeObj?.font_name,
    backgroundColor:optionThemeObj?.option_background_color,
    color:optionThemeObj?.option_text_color}} className='w-full h-full rounded-full flex items-center justify-center'>
      <span>{rich_media_icons_obj[option.type]["icon"]}</span>
    </p>
    <Tooltip className='rounded text-lg font-semibold' anchorId={`${rich_media_icons_obj[option.type]["id"]}`} place="right" content={`${rich_media_icons_obj[option.type]["text"]}`}/>
      </div>
    </Fragment>
    })}
    </div>
    </Fragment>}

    {choosenOption&&<>
      {choosenOption.type==="video"&&<CameraRecorder optionData={choosenOption} handleGoBack={handleGoBack}/>}
      {choosenOption.type==="audio"&&<AudioRecorder optionData={choosenOption} handleGoBack={handleGoBack}/>}
      {/* {choosenOption.type==="text"&&<EnterText optionData={choosenOption} handleGoBack={handleGoBack}/>} */}
      {/* {choosenOption.type==="screen"&&<ScreenRecorder optionData={choosenOption} handleGoBack={handleGoBack}/>} */}
      {/* {choosenOption.type==="upload"&&<UploadFile optionData={choosenOption} handleGoBack={handleGoBack}/>} */}
    </>}
    </section>
   </>
  )
}

export default RichMedia