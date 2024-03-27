import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'
import React from 'react'
import styles from "./Input.module.css"
const InputModal = ({option,handleInputChange,formInputValue}) => {
    const {fontThemeObj,optionThemeObj,is_RTL}=useGlobalStoreContext()

function returnPlaceholerType(type){
if(type==='phone'){return 'number'}
else if (type==='email'){return 'email'}
else if (type==='url'){return 'url'}
else if (type==="number"){return 'number'}
else return 'text'
}

function returnPlaceholderText(text){
  if(is_RTL&&(option.type==="name"||option.type==="text")){
    return text.split("").reverse().join("")
  }
  else {return text}
}

  return (
   <>
    <input style={{
    fontFamily:fontThemeObj?.font_name,
    backgroundColor:optionThemeObj?.option_background_color,
    border:`2px solid ${optionThemeObj?.option_border_color}`,
    borderRadius:`${optionThemeObj?.option_border_radius}px`,
    color:optionThemeObj?.option_text_color,
    fontSize:`${+fontThemeObj?.font_size-3}px`,
    direction:(is_RTL&&(option.type==="name"||option.type==="text"))?"rtl":"",
    unicodeBidi:(is_RTL&&(option.type==="name"||option.type==="text"))?"bidi-override":""
    }} 
    className={`${styles.inputCont} w-full h-max p-4 py-3 md:-mb-2 flex items-center focus:outline-none`} placeholder={returnPlaceholderText(option.place_holder)} type={returnPlaceholerType(option.type)} min={0} name={option.variable} value={formInputValue[option.variable]?.answer} onChange={handleInputChange} required/>
   </>
  )
}

export default InputModal