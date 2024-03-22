import React, { useEffect, useState } from 'react'
import styles from "./EnterText.module.css"
import { FaArrowRight } from "react-icons/fa6";
import { IoCloseOutline } from "react-icons/io5";
import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext';


const EnterText = ({optionData,handleGoBack}) => {
  const {is_RTL,getNextQuestion} = useGlobalStoreContext()
  const limit=+optionData?.length_limit
  const [text,setText]=useState("")

  useEffect(()=>{
    if (text.length > limit) {

      // Slice the text to the allowed length
      setText(text.slice(0, limit));
    }

  },[text,limit])

  function submitResult(){
    getNextQuestion(JSON.stringify({type:"text",data:text}))
  }

  return (
   <section className='w-full h-[76dvh] bg-white shadow-lg rounded-md flex flex-col overflow-hidden'>
   <textarea onChange={(e)=>setText(e.target.value)} value={text} style={{height:"70%",direction:(is_RTL)?"rtl":"",
      unicodeBidi:(is_RTL)?"bidi-override":""}} className='w-full h-full p-8 md:p-9 text-xl md:text-2xl border-none outline-none resize-none' autoFocus placeholder='Type here...'></textarea>

    <div className='flex gap-6 w-full mt-2 items-center justify-center'>
      <button disabled={!text} onClick={submitResult} style={{backgroundColor:text?"#36cf71cc":"",cursor:text?"":"not-allowed"}} className={`${styles.submitButton} size-[50px] md:size-[96px] rounded-full`}><FaArrowRight style={{color:text?"#fff":""}} className='text-3xl md:text-4xl text-black text-opacity-20'/></button>

      <button onClick={handleGoBack} className={styles.backBtn}><IoCloseOutline/></button>
    </div>
   </section>
  )
}

export default EnterText