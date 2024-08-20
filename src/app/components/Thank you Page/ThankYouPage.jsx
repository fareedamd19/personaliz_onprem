import { useGlobalStoreContext } from "@/app/context/GlobalStoreContext";
import React from "react";
import Customize from "./Customize";
import Default from "./Default";
import Navbar from "../Navbar/Navbar";

const ThankYouPage = () => {
  const { configData, customHeader } = useGlobalStoreContext();
  return (
    <>
      {customHeader?.is_custom_header && <Navbar />}
      {configData.end_screen && configData.end_screen !== "null" ? (
        <Customize />
      ) : (
        <Default />
      )}
    </>
  );
};

export default ThankYouPage;
