import { createContext, useContext, useEffect, useState } from "react";

const alphabet = ["","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
const breakPointNumber=720

const GlobalStoreContext = createContext();
const GlobalStoreProvider = ({ children }) => {
    const [firstLoadData, setFirstLoadData] = useState(null)
    const [questionData, setQuestionData] = useState(null)
    const [showErrorModal, setShowErrorModal] = useState(null)
    const [configData,setConfigData]=useState(null)
    const [isQuestionOnTopOfVideo,setIsQuestionOnTopOfVideo]=useState(true)
    const [fontThemeObj,setFontThemeObj]=useState(null)
    const [optionThemeObj,setOptionThemeObj]=useState(null)
    const [numberThemeObj,setNumberThemeObj]=useState(null)
    const [customHeader,setCustomHeader]=useState(null)
    const [questionContainerHeight,setQuestionContainerHeight]=useState('mid')

useEffect(()=>{
if(firstLoadData){
    setQuestionData(firstLoadData?.questions)
    if(firstLoadData?.videoConfig){
        const configData=firstLoadData?.videoConfig
        setConfigData(configData)
        const viewData=JSON.parse(configData?.widget_view)?.desktop_video_view?.landing_page
        // setIsQuestionOnTopOfVideo(window.innerWidth < breakPointNumber||(viewData.video_view==="landscape"||(viewData.video_view==="portrait"&&viewData.display_options==="on_video")))
        // if(firstLoadData.videoConfig.font_obj){
        //     let fontFamilyName=JSON.parse(firstLoadData.videoConfig.font_obj).font_name
        //     if(fontFamilyName){
        //     let style = window.document.createElement('style');
        //     style.textContent = `@import url("https://fonts.googleapis.com/css2?family=${fontFamilyName}&display=swap")`;
        //     window.document.head.appendChild(style);
        //     }
      
        //   }
    }
}
},[firstLoadData])


useEffect(()=>{
if(configData){
   
    setFontThemeObj(JSON.parse(configData?.font_obj))
    setOptionThemeObj(JSON.parse(configData?.options_obj))
    setNumberThemeObj(JSON.parse(configData?.numbered_list_obj))
    setCustomHeader(JSON.parse(configData?.custom_header))
}
},[configData])

useEffect(() => {
   
    const handleResize = () => {
      if (window.innerWidth < breakPointNumber) {
        setIsQuestionOnTopOfVideo(true);
      } 
    };

    // Initial setup
    handleResize();

    // Event listener for window resize
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  function handleQuestionConatinerUpOrDown(opt){
   
// if(opt==="up"){
// if(questionContainerHeight==='top'){return}
// if(questionContainerHeight==='mid'){
//     setQuestionContainerHeight('top')
// }
// else if(questionContainerHeight==='bottom'){
//     setQuestionContainerHeight('mid')
// }
// }
// else if (opt==="down"){
//   if(questionContainerHeight==='bottom'){return}
//   if(questionContainerHeight==='mid'){
//       setQuestionContainerHeight('bottom')
//   }
//   else if(questionContainerHeight==='top'){
//       setQuestionContainerHeight('mid')
//   }
// }
  }

  function getHeightOfQuestionContainer(){
    if(!isQuestionOnTopOfVideo){
      return '100%'
    }
    else {
      if(questionContainerHeight==='top'){
        return '100%'
      }
      else if(questionContainerHeight==='mid'){
        return '40%'
      }
      else if(questionContainerHeight==='bottom'){
        return '3%'
      }
    }
  }

  function getPositionOfUpAndDownArrow(){
    if(questionContainerHeight==='top'){
      return {right:'0.5rem'}
    }
    else if(questionContainerHeight==='mid'){
      return {right:'0.5rem'}
    }
    else if(questionContainerHeight==='bottom'){
      return {right:'50%' ,transform:'translateX(-50%)'}
    }
  }

  function returnNumberOrAlpabet(number){
    if(numberThemeObj?.numbered_type==="number"){
        return `${number+1}`
    }
    else return alphabet[number+1]
}


    return (
    <GlobalStoreContext.Provider
    value={{firstLoadData,setFirstLoadData,
            questionData,setQuestionData,
            showErrorModal, setShowErrorModal,
            configData,isQuestionOnTopOfVideo,
            fontThemeObj,optionThemeObj,
            numberThemeObj,customHeader,
            handleQuestionConatinerUpOrDown,questionContainerHeight,
            getHeightOfQuestionContainer,getPositionOfUpAndDownArrow,
            returnNumberOrAlpabet,  
                
                
            }}
    >
    {children}
    </GlobalStoreContext.Provider>
    );
}

const useGlobalStoreContext = () => {
    return useContext(GlobalStoreContext);
};

export { useGlobalStoreContext, GlobalStoreProvider };