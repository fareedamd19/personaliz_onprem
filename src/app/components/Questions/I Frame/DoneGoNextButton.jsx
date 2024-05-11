import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'
import { getProceedBtnTextColor } from '@/app/utils/Functions'
import React from 'react'

const DoneGoNextButton = ({source='iframe'}) => {
    const {fontThemeObj,optionThemeObj,getNextQuestion,is_RTL,globalHardcodedVariables}=useGlobalStoreContext()

function handleNextQuestion(){
  const ans=source==="iframe"?"Interacted with Iframe":"Calendar Event Booked"
  getNextQuestion(ans)
}

  return (
   <>
    <button onClick={handleNextQuestion} style={{
        fontFamily:fontThemeObj?.font_name,
        backgroundColor:optionThemeObj?.option_text_color,
        border:`2px solid ${optionThemeObj?.option_border_color}`,
        borderRadius:`${optionThemeObj?.option_border_radius}px`,
        color:getProceedBtnTextColor(optionThemeObj?.option_background_color, optionThemeObj?.option_text_color),
        fontSize:`${+fontThemeObj?.font_size}px`,
        direction:(is_RTL)?"rtl":"",
        unicodeBidi:(is_RTL)?"bidi-override":""
        }}
    className='w-[250px] h-[45px] font-bold m-auto'
    >{globalHardcodedVariables?.current?.Done_Go_Next_Text}</button>
   </>
  )
}

export default DoneGoNextButton