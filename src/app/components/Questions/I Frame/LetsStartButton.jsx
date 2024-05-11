import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'
import { getProceedBtnTextColor } from '@/app/utils/Functions'
import React from 'react'

const LetsStartButton = () => {
    const {fontThemeObj,optionThemeObj,handleQuestionConatinerUpOrDown,is_RTL}=useGlobalStoreContext()
  return (
 <>
 <section className='w-full h-[170px] flex'>
    <button onClick={()=>handleQuestionConatinerUpOrDown('top')} style={{
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
    >{`Let's Start`}</button>
</section>
 </>
  )
}

export default LetsStartButton