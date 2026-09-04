import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import WaitingModal from '../WaitingModal'
import ErrorModal from '../ErrorModal'
import PlayPaueAndStopModal from '../Camera Recorder/Play Pause And Stop Modal/PlayPaueAndStopModal'
import MicOptions from '../Camera Recorder/MicOptions'
import styles from "./ScreenRecorder.module.css"
import RecordedVideoPreviewer from '../Camera Recorder/RecordedVideoPreviewer'

function ScreenRecorder({optionData,handleGoBack}) {
    const {personaliz_branding,getUrlForUploadedFile}=useGlobalStoreContext()

const posterUrl=personaliz_branding==="none"?"/edc/chrome/Personaliz_custom_loader.gif":"/edc/chrome/Personaliz_Logo_ANimation_For_Video_Poster.gif"
const [showErrorModal,setShowErrorModal]=useState(false)
const [showWaitingModal,setShowWaitingModal]=useState(false)
const [loading,setLoading]=useState(false)
const isRestartedCalled=useRef(false)
const [listOfAudioOptions,setListOfAudioOptions]=useState([])
const target_video_element=useRef(null)
const screenStreamObj=useRef(null)
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


useEffect(()=>{
    if(optionData){
        timer.current=((+optionData?.length_limit)/1000)
    
    setLoading(true)
    setShowWaitingModal(true)
    startRecordingCameraFunction()
    setTimeout(()=>{
    setLoading(false) 
    },2000)
  }
return ()=>{
    isRestartedCalled.current=false;mediaStreamObj.current=null;screenStreamObj.current=null;setLoading(false);timer.current=0;setSelectedAudioId(null);setListOfAudioOptions([]);
}

//eslint-disable-next-line
},[optionData])


//GET DURATION
function getDuration(time){
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;
    return`${minutes}:${seconds<10?0:""}${seconds}`
 } 

 function checkWhereTheScreenRecordingIsStopped(ev){  
  stopRecording()
 }

function handleSettingUpMediaRecorder(){
  if(screenStreamObj.current&&mediaStreamObj.current){
    screenStreamObj.current.oninactive=(e)=>{checkWhereTheScreenRecordingIsStopped(e)}
    let mixedStream = new MediaStream([...screenStreamObj.current.getTracks(), ...mediaStreamObj.current.getTracks()]);
    let tempMediaRecorder=new MediaRecorder(mixedStream);
    mediaRecorder.current=tempMediaRecorder;
    tempMediaRecorder.ondataavailable = function(ev) {
      let tempArray=final_data_chunks.current
      tempArray.push(ev.data)
      final_data_chunks.current =tempArray;
  };
  tempMediaRecorder.onstop = async (ev)=>{
    createATempFileToPreview()
}
  }
  else {
    console.warn('No stream available.');
    }

    if(screenStreamObj.current){
    if(target_video_element.current){
        if ("srcObject" in target_video_element.current) {
            target_video_element.current.srcObject = screenStreamObj.current;
        } else {
            //old version
            target_video_element.current.src = window.URL.createObjectURL(screenStreamObj.current);
        }

        target_video_element.current.onloadedmetadata = function(ev) {
            target_video_element.current.play()
        } 
    }
  }
}

 async function startRecordingCameraFunction(){
   try { 
    mediaStreamObj.current=await navigator.mediaDevices.getUserMedia({audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
      }})
    screenStreamObj.current=await navigator.mediaDevices.getDisplayMedia({video: true});
    setShowWaitingModal(false)
    setLoading(false)
    
    const devices=await navigator.mediaDevices.enumerateDevices()
    const audioDevices = devices.filter(device => device.kind === 'audioinput');
    setListOfAudioOptions(audioDevices)
    const selectedAudioDevice = audioDevices[0];
    setSelectedAudioId(selectedAudioDevice.deviceId)
    await stopRecordingOnlyAudioFunction()

    mediaStreamObj.current=await navigator.mediaDevices.getUserMedia({audio:{ deviceId: selectedAudioDevice.deviceId }})
    handleSettingUpMediaRecorder()
    
   } catch (error) {
    console.log("error",error)
    setShowWaitingModal(false)
    setShowErrorModal(true)
    setLoading(false)
   }
 }

async function stopRecordingEntireMediaFunction(){
  if(mediaStreamObj.current&&mediaStreamObj.current.getTracks().length>0){
    mediaStreamObj.current.getTracks().forEach((track) => track.stop());
        }
if(screenStreamObj.current&&screenStreamObj.current.getTracks().length>0){
    screenStreamObj.current.getTracks().forEach((track) => track.stop());
}
mediaStreamObj.current=null
screenStreamObj.current=null
mediaRecorder.current=null
}

async function stopRecordingOnlyAudioFunction(){
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
        await stopRecordingEntireMediaFunction()
        handleGoBack()
    }
}

async function resetCameraRecorder(){
    await stopRecordingEntireMediaFunction()
    clearInterval(timer_id.current)
    setShowMoreOptions(false)
    setStartRecording(false)
    timer.current=((+optionData?.length_limit)/1000)
    setRecordedVideoFile(null)
    startRecordingCameraFunction()
   
}


async function handleResetRecorderWithNewAudioId(newId){
    setSelectedAudioId(newId)
    await stopRecordingOnlyAudioFunction()

    mediaStreamObj.current=await navigator.mediaDevices.getUserMedia({audio:{ deviceId: newId }})
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
    if(screenStreamObj.current.active===false){resetCameraRecorder();return}

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
    if(mediaRecorder.current){
      mediaRecorder.current.stop();
    }
   
    setShowMoreOptions(false)
    timer.current=((+optionData?.length_limit)/1000)
}

async function createATempFileToPreview(){
    
    if(mediaStreamObj.current&&screenStreamObj.current){
        mediaStreamObj.current.getTracks().forEach((track) => track.stop());
        screenStreamObj.current.getTracks().forEach((track) => track.stop());
   
 
     // Concatenate all data chunks into a single blob
     const blob = new Blob(final_data_chunks.current, { type: 'video/mp4' });

     // Create a file from the blob and set it as the recorded video file
     const new_file = new File([blob], 'ScreenRecording.mp4', { type: 'video/mp4' });
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
    startRecordingCameraFunction()
}

function handleYesClick(){
    getUrlForUploadedFile(recordedVideoFile,'screen')
}

  return (
    <>
        <section className='w-full h-[76dvh] bg-white shadow-lg rounded-md flex items-center justify-center overflow-hidden'>
        {loading&&<Image src={posterUrl} width={150} height={150} alt="poster"/>}
        {!loading&&showWaitingModal&&<WaitingModal handleGoBack={handleGoBack} targetSrc={'screen'}/>}
        {!loading&&showErrorModal&&<ErrorModal handleGoBack={handleGoBack} targetSrc={'screen'}/>}

        {!loading&&!showErrorModal&&!showWaitingModal&&!recordedVideoFile&&<div className='w-full h-full relative'>
        {!startRecording&&<div className='w-max flex gap-3 absolute top-1 left-1/2 -translate-x-1/2 z-10'>
        <MicOptions listOfAudioOptions={listOfAudioOptions} selectedAudioId={selectedAudioId} handleResetRecorderWithNewId={handleResetRecorderWithNewAudioId}/>
        </div>}

        {startRecording&&<p id='rich_media_timer_dropdown' className={`w-max bg-black bg-opacity-60 p-2 text-white rounded-md absolute top-1 left-1/2 -translate-x-1/2 text-lg font-semibold`}>{getDuration(timer.current)}</p>}
        <video ref={target_video_element} className='w-full h-full object-cover' autoPlay playsInline muted></video>
        <PlayPaueAndStopModal startRecording={checkStartOfMediaRecorderAndHandle} handleCloseCameraAndGoBack={handleCloseCameraAndGoBack} showMoreOptions={showMoreOptions} pauseRecording={pauseRecording} stopRecording={stopRecording} isRecording={mediaRecorder?.current?.state}/>

        {showCountDown&&<p className={`${styles.countdownTimer}`}>0</p>}
        </div>
        }

        {!loading&&!showErrorModal&&!showWaitingModal&&recordedVideoFile&&<><RecordedVideoPreviewer recordedVideoFile={recordedVideoFile} handleNoClick={handleNoClick} handleYesClick={handleYesClick}/></>

        }
        </section>
    </>
  )
}

export default ScreenRecorder