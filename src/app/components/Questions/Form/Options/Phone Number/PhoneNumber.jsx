import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'
import CountryCodePicker from '@/app/utils/Country Code Picker/CountryCodePicker'
import React, { useEffect, useState } from 'react'
import styles from "./PhoneNumber.module.css"
const PhoneNumber = ({option,updatePhoneFormInput,formInputValue}) => {
    const {fontThemeObj,optionThemeObj,choosenCountryCode}=useGlobalStoreContext()
    const [selectedCountry,setSelectedCountry]=useState(null)
   
function returnPlaceholerType(type){
if(type==='phone'){return 'number'}
else if (type==='email'){return 'email'}
else if (type==='url'){return 'url'}
else if (type==="number"){return 'number'}
else return 'text'
}

useEffect(()=>{
if(selectedCountry){
  updatePhoneFormInput(formInputValue[option.variable]?.answer,option.variable,selectedCountry?.dialCode) 
}
//eslint-disable-next-line
},[selectedCountry])

function handleInputChange(e){
  let {value}=e.target
  updatePhoneFormInput(value,option.variable,selectedCountry?.dialCode)
}

  return (
   <div className='relative w-full h-full'>
   <CountryCodePicker choosenCountryCode={choosenCountryCode.current} selectedCountry={selectedCountry} setCountrySelected={setSelectedCountry} optionThemeObj={optionThemeObj}/>
    <input style={{
    fontFamily:fontThemeObj?.font_name,
    backgroundColor:optionThemeObj?.option_background_color,
    border:`2px solid ${optionThemeObj?.option_border_color}`,
    borderRadius:`${optionThemeObj?.option_border_radius}px`,
    color:optionThemeObj?.option_text_color,
    fontSize:`${+fontThemeObj?.font_size-3}px`,
    }} 
    className={`${styles.inputCont} w-full h-max p-4 pl-20 py-3 md:-mb-2 flex items-center focus:outline-none`} placeholder={option.place_holder} type={returnPlaceholerType(option.type)} min={0} name={option.variable} value={formInputValue[option.variable]?.answer} onChange={handleInputChange} required/>
   </div>
  )
}

export default PhoneNumber