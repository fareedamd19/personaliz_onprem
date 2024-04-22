import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import WaitingModal from '../WaitingModal'
import ErrorModal from '../ErrorModal'
import PlayPaueAndStopModal from './Play Pause And Stop Modal/PlayPaueAndStopModal'
import CameraOptions from './CameraOptions'
import MicOptions from './MicOptions'
import styles from "./CamerRecorder.module.css"
import RecordedVideoPreviewer from './RecordedVideoPreviewer'

function CameraRecorder({optionData,handleGoBack}) {
    const {personaliz_branding,getUrlForUploadedFile}=useGlobalStoreContext()
// console.log("optionData",optionData)
const posterUrl=personaliz_branding==="none"?"https://personaliz.s3.ap-south-1.amazonaws.com/Personaliz+Logos/Personaliz+Custom+Loader+Poster.gif":"https://dyolkjkaata8s.cloudfront.net/Personaliz+Logo+ANimation+For+Video+Poster.gif"
const [showErrorModal,setShowErrorModal]=useState(false)
const [showWaitingModal,setShowWaitingModal]=useState(false)
const [loading,setLoading]=useState(false)
const isRestartedCalled=useRef(false)
const [listOfVideoCameraOptions,setListOfVideoCameraOptions]=useState([])
const [listOfAudioOptions,setListOfAudioOptions]=useState([])
const target_video_element=useRef(null)
const mediaStreamObj=useRef(null)
const mediaRecorder=useRef(null)
const [selectedVideoId,setSelectedVideoId]=useState(null)
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
    }
    setLoading(true)
    setShowWaitingModal(true)
    startRecordingCameraFunction()
    setTimeout(()=>{
    setLoading(false) 
    },2000)
return ()=>{
    isRestartedCalled.current=false;mediaStreamObj.current=null;setLoading(false);timer.current=0;setSelectedVideoId(null);setSelectedAudioId(null);setListOfVideoCameraOptions([]);setListOfAudioOptions([]);
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
    mediaRecorder.current=tempMediaRecorder
    
    tempMediaRecorder.ondataavailable = function(ev) {
        let tempArray=final_data_chunks.current
        tempArray.push(ev.data)
        final_data_chunks.current =tempArray;
    };
    tempMediaRecorder.onstop = async (ev)=>{
        createATempFileToPreview()
    }

    if(target_video_element.current){
        if ("srcObject" in target_video_element.current) {
            target_video_element.current.srcObject = mediaStreamObj.current;
        } else {
            //old version
            target_video_element.current.src = window.URL.createObjectURL(mediaStreamObj.current);
        }

        target_video_element.current.onloadedmetadata = function(ev) {
            target_video_element.current.play()
        } 
    }
}

 async function startRecordingCameraFunction(){
    let videoConstraintObj = { 
        audio: true, 
        video: true
        }
   try { 
    mediaStreamObj.current=await navigator.mediaDevices.getUserMedia(videoConstraintObj)
    setShowWaitingModal(false)
    setLoading(false)
    
    const devices=await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    setListOfVideoCameraOptions(videoDevices)
    const selectedVideoDevice = videoDevices[0];
    setSelectedVideoId(selectedVideoDevice.deviceId)
    const audioDevices = devices.filter(device => device.kind === 'audioinput');
    setListOfAudioOptions(audioDevices)
    const selectedAudioDevice = audioDevices[0];
    setSelectedAudioId(selectedAudioDevice.deviceId)
    await stopRecordingCameraFunction()

    mediaStreamObj.current=await navigator.mediaDevices.getUserMedia({audio:{ deviceId: selectedAudioDevice.deviceId },video:{ deviceId: selectedVideoDevice.deviceId }})
    handleSettingUpMediaRecorder()
    
   } catch (error) {
    console.log("error",error)
    setShowWaitingModal(false)
    setShowErrorModal(true)
    setLoading(false)
   }
 }

async function stopRecordingCameraFunction(){
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
        await stopRecordingCameraFunction()
        handleGoBack()
    }
}

async function resetCameraRecorder(){
    await stopRecordingCameraFunction()
    clearInterval(timer_id.current)
    setShowMoreOptions(false)
    setStartRecording(false)
    timer.current=((+optionData?.length_limit)/1000)
    setRecordedVideoFile(null)
    startRecordingCameraFunction()
   
}

async function handleResetRecorderWithNewVideoId(newId){
    setSelectedVideoId(newId)
    await stopRecordingCameraFunction()

    mediaStreamObj.current=await navigator.mediaDevices.getUserMedia({audio:{ deviceId: selectedAudioId },video:{ deviceId: newId}})
    handleSettingUpMediaRecorder()
}

async function handleResetRecorderWithNewAudioId(newId){
    setSelectedAudioId(newId)
    await stopRecordingCameraFunction()

    mediaStreamObj.current=await navigator.mediaDevices.getUserMedia({audio:{ deviceId: newId },video:{ deviceId: selectedVideoId}})
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
     const blob = new Blob(final_data_chunks.current, { type: 'video/mp4' });

     // Create a file from the blob and set it as the recorded video file
     const new_file = new File([blob], 'video.mp4', { type: 'video/mp4' });
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
    getUrlForUploadedFile(recordedVideoFile,'video')
}

  return (
    <>
        <section className='w-full h-[76dvh] bg-white shadow-lg rounded-md flex items-center justify-center overflow-hidden'>
        {loading&&<Image src={posterUrl} width={150} height={150} alt="poster"/>}
        {!loading&&showWaitingModal&&<WaitingModal handleGoBack={handleGoBack} targetSrc={'video'}/>}
        {!loading&&showErrorModal&&<ErrorModal handleGoBack={handleGoBack} targetSrc={'video'}/>}

        {!loading&&!showErrorModal&&!showWaitingModal&&!recordedVideoFile&&<div className='w-full h-full relative'>
        {!startRecording&&<div className='w-max flex gap-3 absolute top-1 left-1/2 -translate-x-1/2 z-10'>
        <CameraOptions listOfVideoCameraOptions={listOfVideoCameraOptions} selectedVideoId={selectedVideoId} handleResetRecorderWithNewId={handleResetRecorderWithNewVideoId}/>
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

export default CameraRecorder