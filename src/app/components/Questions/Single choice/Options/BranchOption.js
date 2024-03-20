import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext';
import React from 'react'

const BranchOption = ({option,index}) => {
    const {fontThemeObj,optionThemeObj,isQuestionOnTopOfVideo,numberThemeObj,returnNumberOrAlpabet,getNextQuestion,configData} = useGlobalStoreContext();
  return (
   <>
    <div onClick={()=>getNextQuestion(option.text)} style={{
    fontFamily:fontThemeObj?.font_name,
    backgroundColor:optionThemeObj?.option_background_color,
    border:`1px solid ${optionThemeObj?.option_border_color}`,
    borderRadius:`${optionThemeObj?.option_border_radius}px`,
    color:optionThemeObj?.option_text_color,
    fontSize:`${+fontThemeObj?.font_size-3}px`,
    }} 
    className={`${isQuestionOnTopOfVideo?'w-[90%] md:w-[40%] mx-auto':'w-full'} h-max p-4 py-3 md:-mb-2 cursor-pointer hover:scale-105 flex items-center`}><span style={{
        backgroundColor:numberThemeObj?.numbered_background_color,
        border:`1px solid ${numberThemeObj?.numbered_border_color}`,
        borderRadius:`${numberThemeObj.numbered_border_radius}px`,
        color:numberThemeObj?.numbered_text_color,
    }} className={`w-[28px] h-[28px] flex items-center justify-center mr-4`}>{returnNumberOrAlpabet(index)}</span><span style={{
      direction:(+configData?.is_RTL)?"rtl":"",
      unicodeBidi:(+configData?.is_RTL)?"bidi-override":""
    }}>{option.text}</span></div>
   </>
  )
}

export default BranchOption