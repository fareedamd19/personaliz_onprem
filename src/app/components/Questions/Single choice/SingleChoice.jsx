import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'
import Link from 'next/link'
import React, { Fragment, useEffect, useState } from 'react'
import BranchOption from './Options/BranchOption';
import UrlOption from './Options/UrlOption';



const SingleChoice = () => {

const {isQuestionOnTopOfVideo,questionData,fontThemeObj,optionThemeObj,configData}=useGlobalStoreContext()
   
    const[options,setOptions]=useState([])
   

    useEffect(()=>{
        const optionsObj=JSON.parse(questionData.options)
        for(let key in optionsObj){
            setOptions(prev=>[...prev,optionsObj[key]])
        }
return ()=>{
    setOptions([])
}
    },[questionData])


    function getBackgroundColorForTitle(){
        if(configData?.form_bg_color){
            return configData?.form_bg_color
        }
        else if(optionThemeObj?.option_background_color){
            return optionThemeObj?.option_background_color
        }
        else{
            return '#000'
        }
    }


  return (
    <>
    <section className='w-[90%] mx-auto mt-4'>
    {questionData.text&&<h1 style={{
        fontFamily:fontThemeObj?.font_name,
        fontSize:`${+fontThemeObj?.font_size}px`,
        backgroundColor:getBackgroundColorForTitle(),
        color:fontThemeObj?.title_text_color
        }} className={` ${isQuestionOnTopOfVideo?'text-center':''} w-full py-2 rounded-md`}>{questionData.text}</h1>}

    <div className={`w-full h-full flex ${!isQuestionOnTopOfVideo?'flex-col gap-7':''} flex-wrap mt-3 pb-9`}>
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