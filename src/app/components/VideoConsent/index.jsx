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
import { useState } from "react";
import Start from "./Start";

const VideoConsent = () => {
  const { showVideoConsent, setShowVideoConsent } = useGlobalStoreContext();
  const [isStarted, setIsStarted] = useState(false);

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
        {isStarted ? <RecordVideo /> : <Start setIsStarted={setIsStarted} />}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default VideoConsent;
