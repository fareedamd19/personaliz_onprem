'use-client'

import React, { useEffect } from 'react'
import {  generateRandomString, replacePercent40 } from '../utils/Functions'
import { useGlobalStoreContext } from '../context/GlobalStoreContext'

const ChecksAndFirstDataOnLoad = () => {
    const {setFirstLoadData}=useGlobalStoreContext()

function checkIfParamsArePresent(){
    const actualUrl = new URL(window.location.href)
    let campaignId = actualUrl.searchParams.get("id")
    let emailOfUser = actualUrl.searchParams.get("email")
    let contact_id = actualUrl.searchParams.get("uid")
    let mode = actualUrl.searchParams.get("mode")
    return {campaignId,emailOfUser,contact_id,mode}
}


useEffect(() => {
  const {campaignId,emailOfUser,contact_id,mode}=checkIfParamsArePresent() 
  if(!campaignId){
    window.location.href=process.env.NEXT_PUBLIC_PERSONALIZ_URL
    return
  } 
  if(!emailOfUser&&!contact_id){
    window.location.href=process.env.NEXT_PUBLIC_PERSONALIZ_URL
    return
  }
  if(emailOfUser){
    getCampaignDetails(campaignId, emailOfUser)
    return
  }
  if(contact_id){
    getFirstQuestionDetails(campaignId, contact_id,mode)
  }
  
//eslint-disable-next-line
},[])


async function getCampaignDetails (campaignId, emailOfUser) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API}/video/get_contact_id`, {
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email:emailOfUser, campaign_id: campaignId }),
            method: 'POST'
        });
        const responseData = await res.json();
        if (responseData) {
            // console.log("responseData",responseData)
            if(responseData.status){
                const original_url=replacePercent40(window.location.href)
                const newParamValue = `uid=${responseData?.contact_id}`;
                const emailParamValue = `email=${emailOfUser}`;
                const regex = new RegExp(emailParamValue);
                const updatedUrl = original_url.replace(regex, newParamValue);
                window.location.replace(updatedUrl)
            }
            else{
                return 'show_error'
                // errorModalToShow('Contact not found for this personalized video','https://d34um3r0i45esv.cloudfront.net/noStripeSubscription.jpg')
            }
           
        }
    } catch (error) {
        console.log(error?.message)
    }
}

async function getFirstQuestionDetails(campaignId, contact_id,mode){
    let custom_personalized_variable_obj={}

    let parentUrl = window?.parent?.location?.href;
    if(parentUrl){
        const finalurl = new URL(parentUrl);
        const queryParamsForCustomParams = finalurl.searchParams;
        // You can now loop through the parameters and their values
        for (const [param, value] of queryParamsForCustomParams) {
            custom_personalized_variable_obj[param]=value
            // console.log(`Parameter: ${param}, Value: ${value}`);
          }
          delete custom_personalized_variable_obj.id
          delete custom_personalized_variable_obj.mode
          delete custom_personalized_variable_obj.uid
    }
    let visitorUniqueId= `run_${generateRandomString(32)}`
    let geoIpLocationKeyObject = {city: null,state: null,country: null}
    const deviceWidth = window.innerWidth;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/video`, {
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "ip_address": null,
            "external_source_url": `${document.referrer ? document.referrer : null}`,
            "internal_source_url": `${window.location.href ? window.location.href : null}`,
            "device_print": visitorUniqueId,
            // "location": `${interactlyIpData?.city ? interactlyIpData?.city : null}, ${interactlyIpData?.country_name ? interactlyIpData?.country_name : null}`,
            "location": JSON.stringify(geoIpLocationKeyObject),
            "channel": 'landing_page',
            "ivideo_id": campaignId,
            "mode": mode ?? null,
            "contact_id": contact_id,
            "device_type": deviceWidth < 768 ? 'mobile'
            : (deviceWidth >= 768 && deviceWidth < 1024) ? 'tablet'
            : 'desktop',
            'personaliz_params_obj':JSON.stringify(custom_personalized_variable_obj)!=="{}"?JSON.stringify(custom_personalized_variable_obj):null
        }), method: 'POST'
    });
    const interactlyResponseData = await res.json();
    if(interactlyResponseData.status){
        setFirstLoadData(interactlyResponseData?.data)
    }
}


  return (
  <></>
  )
}

export default ChecksAndFirstDataOnLoad