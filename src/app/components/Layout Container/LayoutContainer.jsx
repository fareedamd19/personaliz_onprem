import React from 'react'
import VideoContainer from '../Video Conatiner/VideoContainer'
import QuestionContainer from '../Question Container/QuestionContainer'
import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'
import styles from "./LayoutContainer.module.css"
import { FaAngleDown } from "react-icons/fa";
import { FaAngleUp } from "react-icons/fa";



const LayoutContainer = () => {
  const {isQuestionOnTopOfVideo,questionContainerHeight,handleQuestionConatinerUpOrDown,getHeightOfQuestionContainer,getPositionOfUpAndDownArrow,currentQuestionData}=useGlobalStoreContext()

  
      
  return (
  <main className='w-full h-[90vh] flex items-center justify-center'>
<div className={`h-[90%] w-[99%] lg:w-[80%] xl:w-[65%] bg shadow-lg rounded-lg relative flex overflow-hidden`}>
<div className={`${isQuestionOnTopOfVideo?'w-full':'w-[50%]'} h-full`}><VideoContainer/></div>

{currentQuestionData?.current?.type!=="video"&&<div style={{height:getHeightOfQuestionContainer(),transition:isQuestionOnTopOfVideo?"height 0.2s":""}} className={`${styles.layoutOuterMostScrollableCont} overflow-y-auto ${isQuestionOnTopOfVideo?'w-full':'w-[50%]'} ${isQuestionOnTopOfVideo?`absolute bottom-0 left-0 z-10`:'h-full'} ${isQuestionOnTopOfVideo&&'bg-black bg-opacity-20'}`}>

{isQuestionOnTopOfVideo&&<div style={getPositionOfUpAndDownArrow()} className='w-max h-max flex flex-col gap-2 absolute top-0 right-2 z-50'>
{questionContainerHeight!=='top'&&<span onClick={()=>handleQuestionConatinerUpOrDown('up')} className='bg-white p-0 rounded cursor-pointer'><FaAngleUp className='text-lg'/></span>}
{questionContainerHeight!=='bottom'&&<span onClick={()=>handleQuestionConatinerUpOrDown('down')} className='bg-white p-0 rounded cursor-pointer'><FaAngleDown className='text-lg'/></span>}
</div>}
<QuestionContainer/>
</div>}

</div>
  </main>
  )
}

export default LayoutContainer