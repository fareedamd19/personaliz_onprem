import { useGlobalStoreContext } from "@/app/context/GlobalStoreContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ReloadIcon } from "@radix-ui/react-icons";

const SessionResume = () => {
  const {
    firstLoadData,
    isStartOver,
    setIsStartOver,
    showSessionResume,
    setShowSessionResume,
  } = useGlobalStoreContext();

  const isSessionComplete = !firstLoadData?.questions;
  const isStatusDeleted = firstLoadData?.questions?.status === "deleted";

  return (
    <AlertDialog
      open={showSessionResume || isStartOver}
      onOpenChange={() => {
        setShowSessionResume(false);
      }}
    >
      <AlertDialogContent className="w-11/12 sm:max-w-md rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isSessionComplete
              ? "Session Ended"
              : isStatusDeleted
              ? "Session Deleted"
              : "Session in Progress"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isSessionComplete || isStatusDeleted
              ? "Click start over to start a new session"
              : "Start over to delete the existing session data or resume the existing session"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {!(isSessionComplete || isStatusDeleted) && (
            <AlertDialogCancel>Resume</AlertDialogCancel>
          )}
          <AlertDialogAction
            onClick={() => {
              setIsStartOver(true);
            }}
          >
            {isStartOver && (
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            )}
            Start over
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SessionResume;
