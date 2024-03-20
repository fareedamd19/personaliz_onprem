import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'
import React, { Fragment, useEffect, useState } from 'react'
import { IoCheckmark } from "react-icons/io5";
const MultipleChoice = () => {

const {isQuestionOnTopOfVideo,currentQuestionData,fontThemeObj,optionThemeObj,numberThemeObj,getBackgroundColorForTitle,getNextQuestion,globalHardcodedVariables,configData}=useGlobalStoreContext()
const[options,setOptions]=useState([])
const [selectedOptionsIndexArray,setSelectedOptionsIndexArray]=useState([])
const [showError,setShowError]=useState(false)
   
useEffect(()=>{
const optionsObj=JSON.parse(currentQuestionData.current.options)
for(let key in optionsObj){
setOptions(prev=>[...prev,optionsObj[key]])
}
return ()=>{
setOptions([])
}

},[currentQuestionData])


function handleOptionClick(idx){
if(selectedOptionsIndexArray.includes(idx)){
    setSelectedOptionsIndexArray(prev=>prev.filter(item=>item!==idx))
}else{
    setSelectedOptionsIndexArray(prev=>[...prev,idx])
}

}

function handleJump(){
    if(selectedOptionsIndexArray.length>0){
        setShowError(false)
        let answerArray=[]
        selectedOptionsIndexArray.forEach((item)=>{
            answerArray.push(options[item])
        })

        getNextQuestion(JSON.stringify(answerArray))
    }else{
        setShowError(true)
    }
}

  return (
    <>
          <section className='w-[90%] mx-auto mt-4'>
    {currentQuestionData.current.text&&<h1 style={{
        fontFamily:fontThemeObj?.font_name,
        fontSize:`${+fontThemeObj?.font_size}px`,
        backgroundColor:getBackgroundColorForTitle(),
        color:fontThemeObj?.title_text_color,
        direction:(+configData?.is_RTL)?"rtl":"",
        unicodeBidi:(+configData?.is_RTL)?"bidi-override":""
        }} className={` ${isQuestionOnTopOfVideo?'text-center':''} w-full py-2 rounded-md font-semibold`}>{currentQuestionData.current.text}</h1>}

    <div className={`w-full flex ${!isQuestionOnTopOfVideo?'flex-col gap-7':'gap-4'} flex-wrap mt-3`}>
    {options.length>0&&options.map((option,index)=>{
    return <Fragment key={index}>
    <div onClick={()=>handleOptionClick(index)} style={{
    fontFamily:fontThemeObj?.font_name,
    backgroundColor:optionThemeObj?.option_background_color,
    border:`${selectedOptionsIndexArray.includes(index)?'2px':'1px'} solid ${optionThemeObj?.option_border_color}`,
    borderRadius:`${optionThemeObj?.option_border_radius}px`,
    color:optionThemeObj?.option_text_color,
    fontSize:`${+fontThemeObj?.font_size-3}px`,
    }} 
    className={`${isQuestionOnTopOfVideo?'w-[90%] md:w-[40%] mx-auto':'w-full'} h-max p-4 py-3 md:-mb-2 cursor-pointer hover:scale-x-105  flex items-center`}>
    <span style={{
        backgroundColor:numberThemeObj?.numbered_text_color,
        border:`${selectedOptionsIndexArray.includes(index)?'2px':'1px'} solid ${numberThemeObj?.numbered_border_color}`,
        borderRadius:`3px`,
        color:numberThemeObj?.numbered_background_color,
    }} className={`w-[14px] h-[14px] flex items-center justify-center mr-4 font-extrabold`}>
     {selectedOptionsIndexArray.includes(index)?`✔`:""}
    </span>
    <span style={{
        direction:(+configData?.is_RTL)?"rtl":"",
        unicodeBidi:(+configData?.is_RTL)?"bidi-override":"",
    }}>{option}</span></div>
    </Fragment>
    })}
   
        </div>
        <div className={`flex flex-col gap-2 ${isQuestionOnTopOfVideo?"mt-4":"mt-7"}`}>
        {showError&&<p style={{fontFamily:fontThemeObj?.font_name,fontSize:`${+fontThemeObj?.font_size-3}px`}} className='bg-black bg-opacity-60 w-max px-2 py-1 rounded-md'><span className='text-red-500 opacity-100 font-bold'>Select atleast one option first</span></p>}

        <button onClick={handleJump} className='py-1 font-bold' style={{
        fontFamily:fontThemeObj?.font_name,
        backgroundColor:optionThemeObj?.option_text_color,
        border:`2px solid ${optionThemeObj?.option_border_color}`,
        borderRadius:`${optionThemeObj?.option_border_radius}px`,
        color:optionThemeObj?.option_background_color,
        fontSize:`${+fontThemeObj?.font_size}px`,
        direction:(+configData?.is_RTL)?"rtl":"",
        unicodeBidi:(+configData?.is_RTL)?"bidi-override":""
        }}>
        {globalHardcodedVariables?.current?.ProceedText}</button>
        </div>
        
        </section>
    </>
  )
}

export default MultipleChoice