"use client";

import { useGlobalStoreContext } from "@/app/context/GlobalStoreContext";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import RecordVideo from "./RecordVideo";
import { useEffect, useState } from "react";
import Start from "./Start";

const VideoConsent = () => {
  const { firstLoadData } = useGlobalStoreContext();
  const [showVideoConsent, setShowVideoConsent] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    setShowVideoConsent(
      !!firstLoadData?.video_consent && !firstLoadData.is_consent_video_url
    );
  }, [firstLoadData]);

  return (
    <AlertDialog
      open={showVideoConsent}
      onOpenChange={() => {
        setShowVideoConsent(false);
      }}
    >
      <AlertDialogContent className="w-11/12 sm:max-w-md rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">
            Video Consent
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Before we start, please complete the mandatory video consent
            verification.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {isStarted ? (
          <RecordVideo setShowVideoConsent={setShowVideoConsent} />
        ) : (
          <Start setIsStarted={setIsStarted} />
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default VideoConsent;
