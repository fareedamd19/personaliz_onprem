"use client";

import { createContext, useContext, useState, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { cn } from "../lib/utils";
import { ReloadIcon } from "@radix-ui/react-icons";

const AlertContext = createContext();

export const useAlert = () => {
  return useContext(AlertContext);
};

export const AlertProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [onConfirm, setOnConfirm] = useState(() => () => {});
  const [onCancel, setOnCancel] = useState(() => () => {});
  const [cancelButtonText, setCancelButtonText] = useState("Cancel");
  const [actionButtonText, setActionButtonText] = useState("Continue");
  const [hideCancelButton, setHideCancelButton] = useState(true);
  const [titleClass, setTitleClass] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const showAlert = useCallback((config) => {
    setTitle(config.title);
    setDescription(config.description || "");
    setOnConfirm(() => config.onConfirm || (() => {}));
    setOnCancel(() => config.onCancel || (() => {}));
    setCancelButtonText(config.cancelButtonText || "Cancel");
    setActionButtonText(config.actionButtonText || "Continue");
    setHideCancelButton(config.hideCancelButton || true);
    setTitleClass(config.titleClass || "");
    setIsOpen(true);
  }, []);

  const hideAlert = useCallback(() => {
    setIsOpen(false);
    setTitle("");
    setDescription("");
    setOnConfirm(() => () => {});
    setOnCancel(() => () => {});
    setCancelButtonText("Cancel");
    setActionButtonText("Continue");
    setHideCancelButton(true);
    setTitleClass("");
    setIsLoading(false);
  }, []);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const result = onConfirm();

      // eslint-disable-next-line
      if (result instanceof Promise) {
        await result;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      hideAlert();
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {isOpen && (
        <AlertDialog open={isOpen} onOpenChange={hideAlert}>
          <AlertDialogContent className="flex flex-col items-center">
            <AlertDialogHeader>
              <AlertDialogTitle className={cn("text-center", titleClass)}>
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription>{description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              {!hideCancelButton && (
                <AlertDialogCancel onClick={onCancel}>
                  {cancelButtonText}
                </AlertDialogCancel>
              )}
              <AlertDialogAction onClick={handleConfirm}>
                {isLoading && (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                {actionButtonText}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </AlertContext.Provider>
  );
};
