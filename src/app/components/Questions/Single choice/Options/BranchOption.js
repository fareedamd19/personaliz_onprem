import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext';
import React from 'react'

const BranchOption = ({option,index}) => {
    const {fontThemeObj,optionThemeObj,isQuestionOnTopOfVideo,numberThemeObj,returnNumberOrAlpabet} = useGlobalStoreContext();
  return (
   <>
    <div style={{
    fontFamily:fontThemeObj?.font_name,
    backgroundColor:optionThemeObj?.option_background_color,
    border:`1px solid ${optionThemeObj?.option_border_color}`,
    borderRadius:`${optionThemeObj?.option_border_radius}px`,
    color:optionThemeObj?.option_text_color,
    fontSize:`${+fontThemeObj?.font_size-3}px`,
    }} 
    className={`${isQuestionOnTopOfVideo?'w-[80%] md:w-[40%] mx-auto':'w-[80%]'} h-max p-4 py-3 md:-mb-2 cursor-pointer hover:scale-105`}><span style={{
        backgroundColor:numberThemeObj?.numbered_background_color,
        border:`1px solid ${numberThemeObj?.numbered_border_color}`,
        borderRadius:`${numberThemeObj.numbered_border_radius}px`,
        color:numberThemeObj?.numbered_text_color,
    }} className={`${isQuestionOnTopOfVideo?'m-auto':''} px-2 py-1 mr-4`}>{returnNumberOrAlpabet(index)}</span>{option.text}</div>
   </>
  )
}

export default BranchOption