import { createContext, useContext, useEffect, useRef, useState } from "react";
import { checkIfParamsArePresent } from "../utils/Functions";

const alphabet = ["","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
const breakPointNumber=720

const GlobalStoreContext = createContext();
const GlobalStoreProvider = ({ children }) => {
    const[isLoading,setIsLoading]=useState(true)
    const [personaliz_branding, setPersonaliz_branding] = useState(null)
    const [campaignName, setCampaignName] = useState(null)
    const [personalizSessionId, setPersonalizSessionId] = useState(null)
    const [website_scroll_config, setWebsite_scroll_config] = useState(null)
    const [firstLoadData, setFirstLoadData] = useState(null)
    const currentQuestionData=useRef(null)
    const [showErrorModal, setShowErrorModal] = useState(null)
    const [configData,setConfigData]=useState(null)
    const [isQuestionOnTopOfVideo,setIsQuestionOnTopOfVideo]=useState(true)
    const [fontThemeObj,setFontThemeObj]=useState(null)
    const [optionThemeObj,setOptionThemeObj]=useState(null)
    const [numberThemeObj,setNumberThemeObj]=useState(null)
    const [customHeader,setCustomHeader]=useState(null)
    const [questionContainerHeight,setQuestionContainerHeight]=useState('bottom')
    const [showThankYouPage,setShowThankYouPage]=useState(false)
    const max_video_watch_time=useRef(0)
    const target_video_element=useRef(null)
    const stored_watch_time_for_api_called=useRef(null)
    const is_user_exit_api_called=useRef(false)
    const isVideoClickedOnFirstLoad=useRef(false)

useEffect(()=>{
if(firstLoadData){
  console.log("firstLoadData",firstLoadData)
  document.querySelector("body").addEventListener('mouseleave', captureUserExit);
  currentQuestionData.current=firstLoadData?.questions
    setCampaignName(firstLoadData?.campaign_name)
    setPersonaliz_branding(firstLoadData?.personaliz_branding)
    setPersonalizSessionId(firstLoadData?.session_id)
    setWebsite_scroll_config(firstLoadData?.website_scroll_config)
    if(firstLoadData?.videoConfig){
        const configData=firstLoadData?.videoConfig
        setConfigData(configData)
        const viewData=JSON.parse(configData?.widget_view)?.desktop_video_view?.landing_page
        setIsQuestionOnTopOfVideo(window.innerWidth < breakPointNumber||(viewData.video_view==="landscape"||(viewData.video_view==="portrait"&&viewData.display_options==="on_video")))
        if(firstLoadData.videoConfig.font_obj){
            let fontFamilyName=JSON.parse(firstLoadData.videoConfig.font_obj).font_name
            if(fontFamilyName){
            let style = window.document.createElement('style');
            style.textContent = `@import url("https://fonts.googleapis.com/css2?family=${fontFamilyName}&display=swap")`;
            window.document.head.appendChild(style);
            }
      
          }
    }
}
return ()=>{
  document.querySelector("body").removeEventListener('mouseleave', captureUserExit);
}

//eslint-disable-next-line
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
   if(!isQuestionOnTopOfVideo){return}
if(opt==="up"){
if(questionContainerHeight==='top'){return}
if(questionContainerHeight==='mid'){
    setQuestionContainerHeight('top')
}
else if(questionContainerHeight==='bottom'){
    setQuestionContainerHeight('mid')
}
}
else if (opt==="down"){
  if(questionContainerHeight==='bottom'){return}
  if(questionContainerHeight==='mid'){
      setQuestionContainerHeight('bottom')
  }
  else if(questionContainerHeight==='top'){
      setQuestionContainerHeight('mid')
  }
}
else if(opt==="top"){
  if(questionContainerHeight==='top'){return}
  else{
    setQuestionContainerHeight('top')
  }
}
else if(opt==="bottom"){
  if(questionContainerHeight==='bottom'){return}
  else{
    setQuestionContainerHeight('bottom')
  }
}
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


function getUrlLinkToBeRedirectedTo(url,personaliz_campaign_name,questionmarkOrAnd){
  return `${url}${questionmarkOrAnd}utm_campaign=${personaliz_campaign_name}&utm_medium=social&utm_source=Personaliz.ai`
}


function getStatusWatchTimeAndWatchTimePercentage(payload_status) {
 
  const watch_time= isVideoClickedOnFirstLoad.current?Math.max(max_video_watch_time.current,target_video_element.current.currentTime):0

  const video_total_duration = target_video_element?.current?.duration||0;

  const watch_time_percentage=(watch_time/video_total_duration)*100

  const status=payload_status?payload_status:isVideoClickedOnFirstLoad.current?'Clicked':'Loaded'

 

  return {watch_time,watch_time_percentage,status}

}

async function getNextQuestion(payload,quesData=currentQuestionData.current, form_field_variables){
  let{watch_time,watch_time_percentage,status}=getStatusWatchTimeAndWatchTimePercentage('Answered')
  const {campaignId,contact_id,mode}=checkIfParamsArePresent() 
  setIsLoading(true)

  watch_time= quesData.type==='auto_redirect'?0:watch_time
  watch_time_percentage= quesData.type==='auto_redirect'?0:watch_time_percentage

  const isJSONString = (str) =>{
    try {
        JSON.parse(str);
        return true;
    } catch (error) {
        return false;
    }
}
const question_text = quesData ? quesData.text : "";
const answer = isJSONString(payload) ? JSON.parse(payload) : payload;

const res = await fetch(`${process.env.NEXT_PUBLIC_API}/video/nextQuestion`, {
  headers: {
      'Content-Type': 'application/json'
  },
  body: JSON.stringify({
      "contact_id": contact_id ?? null,
      "action": "answer",
      "ivideo_id": campaignId,
      question_text,
      "payload": JSON.stringify({status,type: quesData?.type, session_var: quesData?.session_var, answer,watch_time,watch_time_percentage:watch_time_percentage??0}),
      "session_id": firstLoadData.session_id,
      "question_id": quesData.question_id,
      "mode":mode??null,
      "form_field_variables": form_field_variables ? form_field_variables : payload
  }),
  method: 'POST'
});
const interactlyResponseData = await res.json();
if(interactlyResponseData.status){
  setWebsite_scroll_config(null)
  setIsLoading(false)
  max_video_watch_time.current=0
  is_user_exit_api_called.current=false
  isVideoClickedOnFirstLoad.current=true
  if(!interactlyResponseData?.data?.questions){
    setShowThankYouPage(true)
  }
  else if(interactlyResponseData?.data?.questions?.type === "auto_redirect"){
    currentQuestionData.current=interactlyResponseData?.data?.questions
    handleAutoRedirectOption(interactlyResponseData.data.questions)
  }
  else if(interactlyResponseData?.data?.questions){
    currentQuestionData.current=interactlyResponseData?.data?.questions
    if(interactlyResponseData?.data?.questions?.type === "video"){
      setIsQuestionOnTopOfVideo(true)
    }
  }
}
else{
  setIsLoading(false)
}
}

async function hanleJumpForURL(payload,quesData=currentQuestionData.current, form_field_variables){
  const{watch_time,watch_time_percentage,status}=getStatusWatchTimeAndWatchTimePercentage('Answered')
  const {campaignId,contact_id,mode}=checkIfParamsArePresent() 

 
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/video/urlOptionSelect`, {
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "action": "answer",
            "contact_id": contact_id ,
            "ivideo_id": campaignId,
            "payload": JSON.stringify({status,type: quesData?.type, session_var: quesData?.session_var, answer: payload,watch_time,watch_time_percentage:watch_time_percentage??0}),
            "question_text":"Redirect to url",
            "session_id": firstLoadData.session_id,
            "question_id": quesData.question_id,
            "mode":mode??null
        }),
        method: 'POST'
    });
}


const captureUserExit = async () => {
  const quesData=currentQuestionData.current
  if(quesData?.type==="auto_redirect"){return}
  const {campaignId,contact_id,mode}=checkIfParamsArePresent() 
  let{watch_time,watch_time_percentage,status}=quesData?.type==="auto_redirect"?getStatusWatchTimeAndWatchTimePercentage('Answered'):getStatusWatchTimeAndWatchTimePercentage()
  watch_time=quesData?.type==="auto_redirect"?0:watch_time
  watch_time_percentage=quesData?.type==="auto_redirect"?0:watch_time_percentage
  if(is_user_exit_api_called.current&&(stored_watch_time_for_api_called.current===watch_time)){return}


  const question_text = quesData ? quesData.text : "";
  const answer = quesData?.type==="auto_redirect"?'Redirected to url':''

  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/video/capture_user_exit`, {
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          "contact_id": contact_id ?? null,
          "action": "answer",
          "ivideo_id": campaignId,
          question_text,
          "payload": JSON.stringify({status,type: quesData?.type, session_var: quesData?.session_var, answer,watch_time,watch_time_percentage:watch_time_percentage??0}),
          "session_id": firstLoadData.session_id,
          "question_id": quesData?.question_id,
          "mode":mode??null,
          "form_field_variables": ''
      }),
      method: 'POST'
  });
 
  const interactlyResponseData = await res.json();
  if(interactlyResponseData.status){
      is_user_exit_api_called.current=true 
      stored_watch_time_for_api_called.current=watch_time 
  }
}


function handleAutoRedirectOption(quesData){
  const options = JSON.parse(quesData.options);
  const {url, session_var,open_new_tab} = options;
  let queryParams = "";
  if(session_var) {
    for(let [index, item] of session_var.entries()) {
        if(Array.isArray(item)) {
            item = item.join(',');
        }
        queryParams += `${item}=${sessionVarAnswers[item]}${session_var.length - 1 !== index ? "&" : ""}`
    }
}
const finalUrl = `${url}?utm_campaign=${campaignName}&utm_medium=social&utm_source=Personaliz.ai&${queryParams}`
const anchor = document.createElement('a');
anchor.href = finalUrl;
anchor.target = open_new_tab?'_blank':'_self';
anchor.style.display = "none";
document.body.appendChild(anchor);
anchor.click();

getNextQuestion('Redirected to url',quesData);
}

    return (
    <GlobalStoreContext.Provider
    value={{isLoading,setIsLoading,firstLoadData,setFirstLoadData,
            currentQuestionData,
            showErrorModal, setShowErrorModal,
            configData,isQuestionOnTopOfVideo,
            fontThemeObj,optionThemeObj,
            numberThemeObj,customHeader,
            handleQuestionConatinerUpOrDown,questionContainerHeight,
            getHeightOfQuestionContainer,getPositionOfUpAndDownArrow,
            returnNumberOrAlpabet,personaliz_branding,campaignName,
            personalizSessionId,website_scroll_config,getUrlLinkToBeRedirectedTo, 
            target_video_element,getNextQuestion,hanleJumpForURL,showThankYouPage,
            isVideoClickedOnFirstLoad,max_video_watch_time,captureUserExit
                
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