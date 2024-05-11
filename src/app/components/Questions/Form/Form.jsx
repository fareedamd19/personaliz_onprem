import React, { Fragment, useEffect, useState } from 'react'
import Location from './Options/Location/Location'
import QuestionTitle from '../../Question Container/QuestionTitle'
import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'
import InputModal from './Options/Input Modal/InputModal'
import { getProceedBtnTextColor } from '@/app/utils/Functions'
import PhoneNumber from './Options/Phone Number/PhoneNumber'

const Form = () => {
  const {isQuestionOnTopOfVideo,currentQuestionData,fontThemeObj,optionThemeObj,is_RTL,globalHardcodedVariables,getNextQuestion}=useGlobalStoreContext()
  const[options,setOptions]=useState([])
  const [formInputValue,setFormInputValue]=useState({})
  const [showError,setShowError]=useState(null)
  const [loading,setLoading]=useState(false)
 
//GET OPTIONS
  useEffect(()=>{
    const dummyOptionArray=[]
    const optionsObj=JSON.parse(currentQuestionData.current.options)
    for(let key in optionsObj){
      dummyOptionArray.push(optionsObj[key])
    }
    setOptions(dummyOptionArray)
    createFormInputs(dummyOptionArray)
    return ()=>{
    setOptions([])
    setFormInputValue([])
    }
    
    },[currentQuestionData])


//CREATE INPUTS
function createFormInputs(arr){

  let tempObj={}
  arr.forEach((item)=>{
    if(item.type==="phone"){
      tempObj[item.variable]={type:item.type,answer:"",dialCode:""}
    }
    else{
      tempObj[item.variable]={type:item.type,answer:""}
    }
  
  })
  setFormInputValue(tempObj)
}

function handleInputChange(e){
  let {value,name}=e.target
  setFormInputValue((prev) => ({
    ...prev,
    [name]: {
      ...prev[name],
      answer: value
    }
  }))
}

function updateCustomFormInput(value,name,dialCode=null){
  if(dialCode){
    setFormInputValue((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        answer: value,
        dialCode:dialCode
      }
    }))
  }

  else{
    setFormInputValue((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        answer: value
      }
    }))
  }
  
}

function checkAnswerNotEmptyAndValid(data) {
  const emptyError = [];
  const invalidNameError = [];
  const invalidPhoneError = [];

  for (const key in data) {
      if (data.hasOwnProperty(key)) {
          const entry = data[key];
          if (!entry.hasOwnProperty("answer") || entry.answer.trim() === "") {
              emptyError.push(`Error: 'answer' field is empty for ${key}`);
          } else {
              if (entry.type === "name" && !/^[a-zA-Z\s]+$/.test(entry.answer)|| entry.answer.length > 30) {
                  invalidNameError.push(`Error: 'answer' for ${key} should contain only characters less than 30`);
              } else if (entry.type === "phone" && (!/^\d+$/.test(entry.answer) || entry.answer.length < 5)) {
                  invalidPhoneError.push(`Error: 'answer' for ${key} should contain only numbers (0-9) and have a minimum length of 5 digits`);
              }
          }
      }
  }
  return { emptyError, invalidNameError, invalidPhoneError };
}

function handleFormSubmit(e){
  e.preventDefault()
  setLoading(true)
  const { emptyError, invalidNameError, invalidPhoneError } = checkAnswerNotEmptyAndValid(formInputValue);
  if (emptyError.length > 0) {
    setShowError('Fill all fields inorder to proceed.')
    setLoading(false)
  }
  else if(invalidNameError.length > 0){
    setShowError('Name should contain only alphabets (a-z, A-Z) less than 30 characters.')
    setLoading(false)
  }
  else if(invalidPhoneError.length > 0){
    setShowError('Phone number should contain only numbers (0-9) and have a minimum length of 5 digits.')
    setLoading(false)
  }
  else{
    setShowError(null)
 
    let formInputs = {};
    options.forEach((opt,idx) => {
      formInputs[idx+1]=opt
    })
   
    let interactlyInputs={}
    for(let key in formInputValue){
     
      if(formInputValue[key].type==="phone"){
        interactlyInputs[key]=`${formInputValue[key].dialCode} ${formInputValue[key].answer}`
      }
      else{
        interactlyInputs[key]=formInputValue[key].answer
      }
      
    }
  
    for (const key in formInputs) {
      const variable = formInputs[key].variable;
      if (interactlyInputs.hasOwnProperty(variable)) {
          formInputs[key].answer = interactlyInputs[variable];
      }
  }
 
  setLoading(false)
    getNextQuestion(formInputs,currentQuestionData.current,JSON.stringify(interactlyInputs))

  }
  
}

  return (
    <>
      <section className='w-[90%] mx-auto mt-4'>
      {currentQuestionData.current.text&&<QuestionTitle/>}

      <form onSubmit={handleFormSubmit} className={`${isQuestionOnTopOfVideo?'w-[90%] md:w-[50%] mx-auto':'w-full'} flex flex-col gap-5 my-2`}>
      {options.map((opt)=>{
        return <Fragment key={opt.variable}>

        {opt.type==='location'?<Location updateLocationFormInput={updateCustomFormInput} option={opt}/>:opt.type==='phone'?<PhoneNumber updatePhoneFormInput={updateCustomFormInput} formInputValue={formInputValue} option={opt}/>:<InputModal option={opt} handleInputChange={handleInputChange} formInputValue={formInputValue}/>}
        </Fragment>
      })}

      <div className={`flex flex-col gap-2 ${isQuestionOnTopOfVideo?"mt-4":"mt-4"}`}>
        {showError&&<p style={{fontFamily:fontThemeObj?.font_name,fontSize:`${+fontThemeObj?.font_size-3}px`}} className='bg-black bg-opacity-60 w-max max-w-full px-2 py-1 rounded-md'><span className='text-red-500 opacity-100 font-bold'>{showError}</span></p>}

        <button disabled={loading} type='submit' className='py-1 font-bold' style={{
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
        </div>
      </form>
      </section>
    </>
  )
}

export default Form