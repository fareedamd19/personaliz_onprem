"use-client";

import React, { useEffect } from "react";
import {
  generateRandomString,
  replacePercent40,
  checkIfParamsArePresent,
} from "../utils/Functions";
import { useGlobalStoreContext } from "../context/GlobalStoreContext";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

const ChecksAndFirstDataOnLoad = () => {
  const {
    firstLoadData,
    setFirstLoadData,
    setIsLoading,
    setShowErrorModal,
    setShowSessionResume,
    isStartOver,
    setIsStartOver,
  } = useGlobalStoreContext();

  useEffect(() => {
    const { campaignId, emailOfUser, contact_id, mode } =
      checkIfParamsArePresent();

    if (!campaignId) {
      window.location.href = process.env.NEXT_PUBLIC_PERSONALIZ_URL;
      return;
    }
    if (!emailOfUser && !contact_id) {
      window.location.href = process.env.NEXT_PUBLIC_PERSONALIZ_URL;
      return;
    }
    if (emailOfUser) {
      getCampaignDetails(campaignId, emailOfUser);
      return;
    }
    if (contact_id) {
      getFirstQuestionDetails(campaignId, contact_id, mode);
    }

    return () => {};

    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    const { campaignId, contact_id, mode } = checkIfParamsArePresent();

    if (isStartOver)
      getFirstQuestionDetails(campaignId, contact_id, mode, true);

    // eslint-disable-next-line
  }, [isStartOver]);

  async function getCampaignDetails(campaignId, emailOfUser) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/video/get_contact_id`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: emailOfUser, campaign_id: campaignId }),
          method: "POST",
        }
      );
      const responseData = await res.json();
      if (responseData) {
        if (responseData.status) {
          const original_url = replacePercent40(window.location.href);
          const newParamValue = `uid=${responseData?.contact_id}`;
          const emailParamValue = `email=${emailOfUser}`;
          const regex = new RegExp(emailParamValue);
          const updatedUrl = original_url.replace(regex, newParamValue);
          window.location.replace(updatedUrl);
        } else {
          setIsLoading(false);
          setShowErrorModal([
            "Contact not found for this personalized video",
            null,
            "https://d34um3r0i45esv.cloudfront.net/noStripeSubscription.jpg",
          ]);
        }
      }
    } catch (error) {
      console.log(error?.message);
    }
  }

  async function getFirstQuestionDetails(
    campaignId,
    contact_id,
    mode,
    singleSessionRestart
  ) {
    let custom_personalized_variable_obj = {};

    let parentUrl = window?.parent?.location?.href;
    if (parentUrl) {
      const finalurl = new URL(parentUrl);
      const queryParamsForCustomParams = finalurl.searchParams;
      // You can now loop through the parameters and their values
      for (const [param, value] of queryParamsForCustomParams) {
        custom_personalized_variable_obj[param] = value;
      }
      delete custom_personalized_variable_obj.id;
      delete custom_personalized_variable_obj.mode;
      delete custom_personalized_variable_obj.uid;
    }
    let visitorUniqueId;
    const fp = await FingerprintJS.load();
    const { visitorId } = await fp.get();
    if (visitorId) {
      visitorUniqueId = visitorId;
    } else {
      visitorUniqueId = `run_${generateRandomString(32)}`;
    }
    let geoIpLocationKeyObject = { city: null, state: null, country: null };
    const deviceWidth = window.innerWidth;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/video`, {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        single_session_restart: singleSessionRestart,
        ip_address: null,
        external_source_url: `${document.referrer ? document.referrer : null}`,
        internal_source_url: `${
          window.location.href ? window.location.href : null
        }`,
        device_print: visitorUniqueId,
        // "location": `${interactlyIpData?.city ? interactlyIpData?.city : null}, ${interactlyIpData?.country_name ? interactlyIpData?.country_name : null}`,
        location: JSON.stringify(geoIpLocationKeyObject),
        channel: "landing_page",
        ivideo_id: campaignId,
        mode: mode || "live",
        contact_id: contact_id,
        device_type:
          deviceWidth < 768
            ? "mobile"
            : deviceWidth >= 768 && deviceWidth < 1024
            ? "tablet"
            : "desktop",
        personaliz_params_obj:
          JSON.stringify(custom_personalized_variable_obj) !== "{}"
            ? JSON.stringify(custom_personalized_variable_obj)
            : null,
      }),
      method: "POST",
    });
    const interactlyResponseData = await res.json();
    if (interactlyResponseData.status) {
      let data = interactlyResponseData.data;
      const showRestartPopup = data.show_restart_popup;

      if (showRestartPopup) {
        setShowSessionResume(showRestartPopup);
        data.questions = data.resume_question_data?.questions;
        data.session_id = data.resume_question_data?.session_id;
      }

      if (isStartOver) {
        const updatedData = firstLoadData;
        updatedData.questions = data.questions;
        updatedData.session_id = data.session_id;
        updatedData.dynamic_text_display = data.dynamic_text_display;

        data = { ...updatedData };
      }

      setFirstLoadData(data);
      makingGeoIpCallAndUpdatingSession(data);
      setIsLoading(false);
    } else if (
      interactlyResponseData.status === false &&
      interactlyResponseData?.no_contact_found
    ) {
      setIsLoading(false);
      setShowErrorModal([
        "Contact not found for this personalized video",
        null,
        "https://d34um3r0i45esv.cloudfront.net/noStripeSubscription.jpg",
      ]);
    } else if (
      interactlyResponseData.status === false &&
      interactlyResponseData?.no_contact_id
    ) {
      setIsLoading(false);
      setShowErrorModal([
        "uid is requred!",
        "Please add uid in url and try again",
        "https://d34um3r0i45esv.cloudfront.net/noStripeSubscription.jpg",
      ]);
    } else if (
      interactlyResponseData.status === false &&
      interactlyResponseData?.no_first_question_found
    ) {
      setIsLoading(false);
      setShowErrorModal([
        "No question available to display for this Personalized video!",
        null,
        "https://d34um3r0i45esv.cloudfront.net/no_first_question_available_imageFinal.jpg",
      ]);
    } else if (
      interactlyResponseData.status === false &&
      interactlyResponseData?.data?.no_active_subscription === true
    ) {
      setIsLoading(false);
      setShowErrorModal([
        "Content is temporarily unavailable!",
        "Please try after some time",
        "https://d34um3r0i45esv.cloudfront.net/noStripeSubscription.jpg",
      ]);
    }

    setIsStartOver(false);
  }

  const makingGeoIpCallAndUpdatingSession = async (interactlyResponseData) => {
    let interactlyIpData;
    let interactlyDefaultAPIFORSESSIONUPDATE = `${process.env.NEXT_PUBLIC_API}/video/update_session_data`;
    try {
      const interactlyIpDataResponse = await fetch(
        "https://interactly.video:3000/v1/geoIp"
      );
      if (interactlyIpDataResponse) {
        interactlyIpData = await interactlyIpDataResponse.json();
      } else {
        interactlyIpData = { city: false, country_name: false, IPv4: false };
      }
    } catch (error) {
      console.log("IP response error", error.message);
    }

    interactlyIpData = interactlyIpData._ip;

    let geoIpLocationKeyObject = {
      city: interactlyIpData?.city ? interactlyIpData?.city : null,
      state: interactlyIpData?.state ? interactlyIpData?.state : null,
      country: interactlyIpData?.country_name
        ? interactlyIpData?.country_name
        : null,
    };

    const deviceWidth = window.innerWidth;

    const res = await fetch(`${interactlyDefaultAPIFORSESSIONUPDATE}`, {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ip_address: interactlyIpData?._myip,
        location: JSON.stringify(geoIpLocationKeyObject),
        session_id: interactlyResponseData.session_id,
        device_type:
          deviceWidth < 768
            ? "mobile"
            : deviceWidth >= 768 && deviceWidth < 1024
            ? "tablet"
            : "desktop",
      }),
      method: "POST",
    });

    //eslint-disable-next-line no-unused-vars
    const response = await res.json();
  };

  return <></>;
};

export default ChecksAndFirstDataOnLoad;
