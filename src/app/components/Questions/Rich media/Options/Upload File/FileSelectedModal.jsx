import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'
import { addOpacity, getProceedBtnTextColor } from '@/app/utils/Functions'
import React from 'react'
import { RiDeleteBin6Line } from "react-icons/ri";
import styles from "./UploadFile.module.css"
const FileSelectedModal = ({filesArray,handleRemoveFile,handleJump}) => {
    const {is_RTL,fontThemeObj,optionThemeObj,globalHardcodedVariables}=useGlobalStoreContext()


  return (
    <>
<section className='w-full flex flex-col gap-5'>
<div className={`${styles.scrollableContainer} w-full flex flex-col gap-3 max-h-[50dvh] md:max-h-[60dvh] overflow-y-auto`}>
   {filesArray.map((file)=>{
    return <div key={file.id} className='flex items-center gap-4 w-full'>
    <p className='border-2 border-dashed backdrop-blur rounded-md px-3 py-2 w-[80%] md:w-full break-words font-semibold' style={{borderColor:optionThemeObj?.option_text_color,backgroundColor:addOpacity(optionThemeObj?.option_text_color),color:optionThemeObj?.option_text_color}}>{file.data.name}</p>
    <p onClick={()=>handleRemoveFile(file.id)} className='border border-dashed backdrop-blur rounded-md w-6 h-8 flex cursor-pointer' style={{borderColor:optionThemeObj?.option_text_color,backgroundColor:addOpacity(optionThemeObj?.option_text_color),color:optionThemeObj?.option_text_color}}><RiDeleteBin6Line className='m-auto text-lg'/></p>
    </div>
   })} 
</div>
 <button onClick={handleJump} className='py-1 px-4 font-medium w-max m-auto' style={{
        fontFamily:fontThemeObj?.font_name,
        backgroundColor:optionThemeObj?.option_text_color,
        border:`2px solid ${optionThemeObj?.option_border_color}`,
        borderRadius:`${optionThemeObj?.option_border_radius}px`,
        color:getProceedBtnTextColor(optionThemeObj?.option_background_color, optionThemeObj?.option_text_color),
        fontSize:`${+fontThemeObj?.font_size}px`,
        direction:(is_RTL)?"rtl":"",
        unicodeBidi:(is_RTL)?"bidi-override":""
        }}>
        {globalHardcodedVariables?.current?.submitText}</button>
</section>
    </>
  )
}

export default FileSelectedModal