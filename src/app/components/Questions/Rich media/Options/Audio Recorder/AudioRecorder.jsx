import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import WaitingModal from '../WaitingModal'
import ErrorModal from '../ErrorModal'
import PlayPaueAndStopModal from '../Camera Recorder/Play Pause And Stop Modal/PlayPaueAndStopModal'
import MicOptions from '../Camera Recorder/MicOptions'
import styles from "./AudioRecorder.module.css"
import AudioVisualizer from './AudioVisualizer'
import RecordedVideoPreviewer from '../Camera Recorder/RecordedVideoPreviewer'


function AudioRecorder({optionData,handleGoBack}) {
    const {personaliz_branding,getUrlForUploadedFile}=useGlobalStoreContext()

const posterUrl=personaliz_branding==="none"?"https://personaliz.s3.ap-south-1.amazonaws.com/Personaliz+Logos/Personaliz+Custom+Loader+Poster.gif":"https://dyolkjkaata8s.cloudfront.net/Personaliz+Logo+ANimation+For+Video+Poster.gif"
const [showErrorModal,setShowErrorModal]=useState(false)
const [showWaitingModal,setShowWaitingModal]=useState(false)
const [loading,setLoading]=useState(false)
const isRestartedCalled=useRef(false)
const [listOfAudioOptions,setListOfAudioOptions]=useState([])
const mediaStreamObj=useRef(null)
const mediaRecorder=useRef(null)
const [selectedAudioId,setSelectedAudioId]=useState(null)
const [startRecording,setStartRecording]=useState(false)
const timer=useRef(0)
const [showCountDown,setShowCountDown]=useState(false)
const timer_id=useRef(null)
const [showMoreOptions,setShowMoreOptions]=useState(false)
const [recordedVideoFile,setRecordedVideoFile]=useState(null)
const final_data_chunks=useRef([])
const [microphoneStream,setmicrophoneStream]=useState(null)

useEffect(()=>{
    if(optionData){
        timer.current=((+optionData?.length_limit)/1000)
    }
    setLoading(true)
    setShowWaitingModal(true)
    startRecordingMediaFunction()
    setTimeout(()=>{
    setLoading(false) 
    },2000)
return ()=>{
    isRestartedCalled.current=false;mediaStreamObj.current=null;setLoading(false);timer.current=0;setSelectedAudioId(null);setListOfAudioOptions([]);setmicrophoneStream(null);
}

//eslint-disable-next-line
},[optionData])


//GET DURATION
function getDuration(time){
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;
    return`${minutes}:${seconds<10?0:""}${seconds}`
 } 

function handleSettingUpMediaRecorder(){
    let tempMediaRecorder=new MediaRecorder(mediaStreamObj.current)
    setmicrophoneStream(mediaStreamObj.current)
    mediaRecorder.current=tempMediaRecorder
    
    tempMediaRecorder.ondataavailable = function(ev) {
        let tempArray=final_data_chunks.current
        tempArray.push(ev.data)
        final_data_chunks.current =tempArray;
    };
    tempMediaRecorder.onstop = async (ev)=>{
        createATempFileToPreview()
    }

   
}

 async function startRecordingMediaFunction(){
    let mediaConstraintObj = { 
        audio: true, 
        video: false
        }
   try { 
    mediaStreamObj.current=await navigator.mediaDevices.getUserMedia(mediaConstraintObj)
    setShowWaitingModal(false)
    setLoading(false)
    
    const devices=await navigator.mediaDevices.enumerateDevices()
    const audioDevices = devices.filter(device => device.kind === 'audioinput');
    setListOfAudioOptions(audioDevices)
    const selectedAudioDevice = audioDevices[0];
    setSelectedAudioId(selectedAudioDevice.deviceId)
    await stopRecordingMediaFunction()

    mediaStreamObj.current=await navigator.mediaDevices.getUserMedia({audio:{ deviceId: selectedAudioDevice.deviceId },video:false})
    handleSettingUpMediaRecorder()
    
   } catch (error) {
    console.log("error",error)
    setShowWaitingModal(false)
    setShowErrorModal(true)
    setLoading(false)
   }
 }

async function stopRecordingMediaFunction(){
    if(mediaStreamObj.current&&mediaStreamObj.current.getTracks().length>0){
        mediaStreamObj.current.getTracks().forEach((track) => track.stop());
            }
    mediaStreamObj.current=null
    mediaRecorder.current=null
   
}

async function handleCloseCameraAndGoBack(){
    if(mediaRecorder.current.state==="paused"||mediaRecorder.current.state==="recording"){
        resetCameraRecorder()
       }
  
   
    else{
        await stopRecordingMediaFunction()
        handleGoBack()
    }
}

async function resetCameraRecorder(){
    await stopRecordingMediaFunction()
    clearInterval(timer_id.current)
    setShowMoreOptions(false)
    setStartRecording(false)
    timer.current=((+optionData?.length_limit)/1000)
    setRecordedVideoFile(null)
    startRecordingMediaFunction()
   
}


async function handleResetRecorderWithNewAudioId(newId){
    setSelectedAudioId(newId)
    await stopRecordingMediaFunction()

    mediaStreamObj.current=await navigator.mediaDevices.getUserMedia({audio:{ deviceId: newId },video:false})
    handleSettingUpMediaRecorder()
}

async function startTimerCountdown(){
setShowCountDown(true)
let timer=4
for(let i=0;i<=4;i++){
    setTimeout(()=>{
       timer=timer-1
       if(document.querySelector(`.${styles.countdownTimer}`)){
        document.querySelector(`.${styles.countdownTimer}`).innerHTML=timer!==0?timer:'Start'
       }
  
    if(timer<0){
    startCameraRecording()
    }
    },i*1000)
}
}

async function checkStartOfMediaRecorderAndHandle(){

    if(startRecording &&mediaRecorder.current.state!=="paused"){return}
    if(mediaRecorder.current.state==="recording"){return}
    setStartRecording(true) 
   if(mediaRecorder.current.state==="inactive"){
    startTimerCountdown()
   }
   else if(mediaRecorder.current.state==="paused"){
       resumeRecording()
   }
}

async function startCameraRecording(){
    setShowCountDown(false)
    setShowMoreOptions(true)
    if(mediaRecorder.current){
      mediaRecorder.current.start();
      timer_id.current=setInterval(trackTimerCountDown,1000)
    } 
    
}

function trackPercentageOfTimerLeft(currentTime){
    const currentTimer=currentTime-1
    const totalTime=(+optionData?.length_limit)/1000
    const percentage=((totalTime-currentTimer)/totalTime)*100
    
    const stopButton=document.getElementById('rich_media_stop_recording_btn')
    if(stopButton){
        stopButton.style=`--value:${percentage}%`
    }
    }

function trackTimerCountDown(){
    let new_timer=timer.current
    trackPercentageOfTimerLeft(new_timer)
    if(new_timer===0){
        stopRecording()
    }
    else{
        timer.current=new_timer-1
        if(document.getElementById('rich_media_timer_dropdown')){
            document.getElementById('rich_media_timer_dropdown').innerHTML=getDuration(timer.current)
        }  
    }
}

function pauseRecording(){
    clearInterval(timer_id.current)
    mediaRecorder.current.pause();  
    setShowMoreOptions(false)
}

function resumeRecording(){
    mediaRecorder.current.resume();
    setShowMoreOptions(true)
    setTimeout(()=>{
    trackPercentageOfTimerLeft(timer.current)
    },10)
    timer_id.current=setInterval(trackTimerCountDown,1000)
}
function stopRecording(){
    clearInterval(timer_id.current)
    mediaRecorder.current.stop();
    setShowMoreOptions(false)
    timer.current=((+optionData?.length_limit)/1000)
}

async function createATempFileToPreview(){
    
    if(mediaStreamObj.current){
        mediaStreamObj.current.getTracks().forEach((track) => track.stop());
   
 
     // Concatenate all data chunks into a single blob
     const blob = new Blob(final_data_chunks.current, { type: 'audio/mp3' });

     // Create a file from the blob and set it as the recorded video file
     const new_file = new File([blob], 'AudioRecording.mp3', { type: 'audio/mp3' });
     setRecordedVideoFile(new_file);
 
     // Clear the data chunks
     final_data_chunks.current=[]
    }
    else{
        final_data_chunks.current=[] 
    }
}

function handleNoClick(){
    setRecordedVideoFile(null)
    setStartRecording(false)
    setRecordedVideoFile(null)
    startRecordingMediaFunction()
}

function handleYesClick(){
    getUrlForUploadedFile(recordedVideoFile,'audio')
}

  return (
    <>
        <section className='w-full h-[76dvh] bg-[#dadada] shadow-lg rounded-md flex items-center justify-center overflow-hidden'>
        {loading&&<Image src={posterUrl} width={150} height={150} alt="poster"/>}
        {!loading&&showWaitingModal&&<WaitingModal handleGoBack={handleGoBack} targetSrc={'audio'}/>}
        {!loading&&showErrorModal&&<ErrorModal handleGoBack={handleGoBack} targetSrc={'audio'}/>}

        {!loading&&!showErrorModal&&!showWaitingModal&&!recordedVideoFile&&<div className='w-full h-full relative'>
        {!startRecording&&<div className='w-max flex gap-3 absolute top-1 left-1/2 -translate-x-1/2 z-10'>
        <MicOptions listOfAudioOptions={listOfAudioOptions} selectedAudioId={selectedAudioId} handleResetRecorderWithNewId={handleResetRecorderWithNewAudioId}/>
        </div>}

       {microphoneStream&&<AudioVisualizer microphoneStream={microphoneStream}/>}

        {startRecording&&<p id='rich_media_timer_dropdown' className={`w-max bg-black bg-opacity-60 p-2 text-white rounded-md absolute top-1 left-1/2 -translate-x-1/2 text-lg font-semibold`}>{getDuration(timer.current)}</p>}
       
        <PlayPaueAndStopModal startRecording={checkStartOfMediaRecorderAndHandle} handleCloseCameraAndGoBack={handleCloseCameraAndGoBack} showMoreOptions={showMoreOptions} pauseRecording={pauseRecording} stopRecording={stopRecording} isRecording={mediaRecorder?.current?.state}/>

        {showCountDown&&<p className={`${styles.countdownTimer}`}>0</p>}
        </div>
        }

        {!loading&&!showErrorModal&&!showWaitingModal&&recordedVideoFile&&<><RecordedVideoPreviewer recordedVideoFile={recordedVideoFile} handleNoClick={handleNoClick} handleYesClick={handleYesClick} src={'audio'}/></>

        }
        </section>
    </>
  )
}

export default AudioRecorder