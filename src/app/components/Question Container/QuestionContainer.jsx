import React from 'react'
import SingleChoice from '../Questions/Single choice/SingleChoice'
import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'
import RichMedia from '../Questions/Rich media/RichMedia'


const QuestionContainer = () => {
  const {isQuestionOnTopOfVideo,currentQuestionData,configData}=useGlobalStoreContext()
    
  return (
    <section style={{backgroundImage: (!isQuestionOnTopOfVideo&&configData?.form_bg_image)?`url(${configData?.form_bg_image})`:"",
    backgroundColor: isQuestionOnTopOfVideo?"":configData?.form_bg_color
    }} className={`flex flex-col gap-4 w-full h-full ${!isQuestionOnTopOfVideo&&configData?.form_bg_image?'bg-cover bg-center':""}}`}>
    {currentQuestionData.current?.type==="single_choice"&&<SingleChoice/>}
    {currentQuestionData.current?.type==="rich_media"&&<RichMedia/>}
    
    </section>
  )
}

export default QuestionContainer