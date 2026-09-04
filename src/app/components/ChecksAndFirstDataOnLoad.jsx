"use-client";

import React, { useEffect } from "react";
import {
  generateRandomString,
  replacePercent40,
  checkIfParamsArePresent,
} from "../utils/Functions";
import { useGlobalStoreContext } from "../context/GlobalStoreContext";
import { useAlert } from "../context/AlertContext";
import { loadFirstLoad } from "../edc/edcData";

const ChecksAndFirstDataOnLoad = () => {
  const {
    firstLoadData,
    setFirstLoadData,
    setIsLoading,
    setShowErrorModal,
    setShowThankYouPage,
    setConfigData,
    currentQuestionData,
  } = useGlobalStoreContext();
  const { showAlert } = useAlert();

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
            "/edc/chrome/noStripeSubscription.jpg",
          ]);
        }
      }
    } catch (error) {
      console.log(error?.message);
    }
  }

  useEffect(() => {
    if (!firstLoadData) return;

    const question = firstLoadData?.questions;
    const showRestartPopup = firstLoadData.show_restart_popup;
    const isSessionComplete = !question || question.type === "video";
    const isStatusDeleted = question?.status === "deleted";
    const hasVideoConsent = !!firstLoadData?.video_consent;

    const { campaignId, contact_id, mode } = checkIfParamsArePresent();
    if (showRestartPopup) {
      if (hasVideoConsent) {
        if (isSessionComplete || isStatusDeleted) {
          showAlert({
            title: isSessionComplete
              ? "Interview Completed"
              : "Interview Updated",
            description: `Your interview process has been ${
              isSessionComplete ? "Completed" : "Updated"
            }`,
            actionButtonText: "Ok",
          });
        } else {
          showAlert({
            title: "Interview in Progress",
            description: "Click Resume to continue the interview process",
            actionButtonText: "Resume",
          });
        }
      } else {
        if (isSessionComplete || isStatusDeleted) {
          showAlert({
            title: isSessionComplete ? "Session Ended" : "Session Deleted",
            description: "Click start over to start a new session",
            actionButtonText: "Start over",
            onConfirm: async () => {
              await getFirstQuestionDetails(campaignId, contact_id, mode, true);
            },
          });
        } else {
          showAlert({
            title: "Session in Progress",
            description:
              "Start over to delete the existing session or resume the session",
            cancelButtonText: "Resume",
            hideCancelButton: false,
            actionButtonText: "Start over",
            onConfirm: async () => {
              await getFirstQuestionDetails(campaignId, contact_id, mode, true);
            },
          });
        }
      }
    }

    // eslint-disable-next-line
  }, [firstLoadData]);

  async function getFirstQuestionDetails(
    campaignId,
    contact_id,
    mode,
    singleSessionRestart
  ) {
    // On-premise: nothing is asked of Personaliz here.
    //
    // The stock player posts the campaign, the contact, a device fingerprint
    // and a referrer to our API, and gets the video, the overlay, the
    // recipient's values and a session back. None of that is available to a
    // deployment that may not reach us - and the fingerprint and referrer are
    // not things a government host should be sending anywhere regardless.
    //
    // Both halves now come from the host's own domain instead. See
    // edc/edcData.js: one file for the campaign, one for the recipient, and a
    // single function to swap for their own service.
    const interactlyResponseData = await loadFirstLoad(campaignId, contact_id);
    if (interactlyResponseData.status) {
      let data = interactlyResponseData.data;
      const showRestartPopup = data.show_restart_popup;

      if (showRestartPopup || data.resume_question_data?.questions) {
        data.questions = data.resume_question_data?.questions;
        data.session_id = data.resume_question_data?.session_id;
      }

      if (firstLoadData) {
        const updatedData = firstLoadData;
        updatedData.questions = data.questions;
        updatedData.session_id = data.session_id;
        updatedData.dynamic_text_display = data.dynamic_text_display;
        updatedData.website_scroll_config = data.website_scroll_config;
        updatedData.show_restart_popup = data.show_restart_popup;

        data = { ...updatedData };
      }

      if (!data.questions) setShowThankYouPage(true);
      setConfigData(data.videoConfig);

      currentQuestionData.current = data?.questions;
      currentQuestionData.current.isFirstQuestion = true;

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
        "/edc/chrome/noStripeSubscription.jpg",
      ]);
    } else if (
      interactlyResponseData.status === false &&
      interactlyResponseData?.no_contact_id
    ) {
      setIsLoading(false);
      setShowErrorModal([
        "uid is requred!",
        "Please add uid in url and try again",
        "/edc/chrome/noStripeSubscription.jpg",
      ]);
    } else if (
      interactlyResponseData.status === false &&
      interactlyResponseData?.no_first_question_found
    ) {
      setIsLoading(false);
      setShowErrorModal([
        "No question available to display for this Personalized video!",
        null,
        "/edc/chrome/no_first_question_available_imageFinal.jpg",
      ]);
    } else if (
      interactlyResponseData.status === false &&
      interactlyResponseData?.data?.no_active_subscription === true
    ) {
      setIsLoading(false);
      setShowErrorModal([
        "Content is temporarily unavailable!",
        "Please try after some time",
        "/edc/chrome/noStripeSubscription.jpg",
      ]);
    }
  }

  /**
   * Deliberately empty on-premise.
   *
   * The stock player looks the viewer's IP up against a third-party geo
   * service and posts their city, country and device back to us as session
   * data. Both halves are out of the question here: the first sends a
   * citizen's address to a third party, the second is the call home this
   * deployment exists to remove.
   *
   * Kept as a no-op rather than deleted, so the call site upstream still
   * reads the same and this file stays easy to diff against the stock player.
   */
  const makingGeoIpCallAndUpdatingSession = async () => {};

  return <></>;
};

export default ChecksAndFirstDataOnLoad;
