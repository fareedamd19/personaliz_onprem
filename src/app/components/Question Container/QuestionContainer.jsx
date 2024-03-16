import React from 'react'
import SingleChoice from '../Questions/Single choice/SingleChoice'
import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'

const QuestionContainer = () => {
  const {isQuestionOnTopOfVideo,questionData,configData}=useGlobalStoreContext()
    
  return (
    <section style={{backgroundImage: (!isQuestionOnTopOfVideo&&configData?.form_bg_image)?`url(${configData?.form_bg_image})`:"",
    backgroundColor: isQuestionOnTopOfVideo?"":configData?.form_bg_color
    }} className={`flex flex-col gap-4 w-full h-full ${!isQuestionOnTopOfVideo&&configData?.form_bg_image?'bg-cover bg-center':""}}`}>
    {questionData?.type==="single_choice"&&<SingleChoice/>}
    

    </section>
  )
}

export default QuestionContainer