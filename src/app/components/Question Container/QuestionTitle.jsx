import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'
import React from 'react'

const QuestionTitle = () => {
    const {isQuestionOnTopOfVideo,currentQuestionData,fontThemeObj,getBackgroundColorForTitle,is_RTL}=useGlobalStoreContext()
  return (
    <>
        <h1 style={{
        fontFamily:fontThemeObj?.font_name,
        fontSize:`${+fontThemeObj?.font_size}px`,
        backgroundColor:getBackgroundColorForTitle(),
        color:fontThemeObj?.title_text_color,
        }} className={` ${isQuestionOnTopOfVideo?'text-center':''} w-full py-2 rounded-md font-semibold`}><span style={{direction:(is_RTL)?"rtl":"",
        unicodeBidi:(is_RTL)?"bidi-override":""}}>
            {currentQuestionData.current.text}
        </span></h1>
    </>
  )
}

export default QuestionTitle