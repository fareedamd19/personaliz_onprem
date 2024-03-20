import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'
import React, { Fragment, useEffect, useState } from 'react'
import BranchOption from './Options/BranchOption';
import UrlOption from './Options/UrlOption';



const SingleChoice = () => {

const {isQuestionOnTopOfVideo,currentQuestionData,fontThemeObj,configData,getBackgroundColorForTitle}=useGlobalStoreContext()
   
    const[options,setOptions]=useState([])
   

    useEffect(()=>{
        const optionsObj=JSON.parse(currentQuestionData.current.options)
        for(let key in optionsObj){
            setOptions(prev=>[...prev,optionsObj[key]])
        }
return ()=>{
    setOptions([])
}
    },[currentQuestionData])


  return (
    <>
    <section className={`w-[90%] mx-auto mt-4`}>
    {currentQuestionData.current.text&&<h1 style={{
        fontFamily:fontThemeObj?.font_name,
        fontSize:`${+fontThemeObj?.font_size}px`,
        backgroundColor:getBackgroundColorForTitle(),
        color:fontThemeObj?.title_text_color,
        direction:(+configData?.is_RTL)?"rtl":"",
        unicodeBidi:(+configData?.is_RTL)?"bidi-override":""
        }} className={` ${isQuestionOnTopOfVideo?'text-center':''} w-full py-2 rounded-md font-semibold`}>{currentQuestionData.current.text}</h1>}

    <div className={`w-full h-full flex ${!isQuestionOnTopOfVideo?'flex-col gap-7':'gap-2 md:gap-4'} flex-wrap mt-3`}>
    {options.length>0&&options.map((option,index)=>{
    return <Fragment key={index}>
    {option.type==='branch'?
    <BranchOption option={option} index={index} />
    :
    <UrlOption option={option} index={index} />
    }
    </Fragment>
    })}
        </div>

        </section>
    </>
  )
}

export default SingleChoice