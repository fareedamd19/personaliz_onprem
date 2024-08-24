import React from "react";
import ChecksAndFirstDataOnLoad from "../ChecksAndFirstDataOnLoad";
import Loader from "../Loader/Loader";
import Navbar from "../Navbar/Navbar";
import LayoutContainer from "../Layout Container/LayoutContainer";
import { useGlobalStoreContext } from "@/app/context/GlobalStoreContext";
import ErrorModal from "../Error Modal/ErrorModal";
import ThankYouPage from "../Thank you Page/ThankYouPage";
import SessionResume from "@/components/dialogs/SessionResume";

const Dashboard = ({ server_personaliz_branding }) => {
  const {
    firstLoadData,
    customHeader,
    isLoading,
    showErrorModal,
    showThankYouPage,
  } = useGlobalStoreContext();

  return (
    <>
      <ChecksAndFirstDataOnLoad />
      {isLoading && (
        <Loader server_personaliz_branding={server_personaliz_branding} />
      )}
      {firstLoadData && !isLoading && !showThankYouPage && !showErrorModal && (
        <section className="w-full h-screen flex flex-col overflow-hidden">
          {customHeader?.is_custom_header && <Navbar />}
          <LayoutContainer />
        </section>
      )}
      {!isLoading && showErrorModal && <ErrorModal />}
      {!isLoading && showThankYouPage && <ThankYouPage />}

      <SessionResume />
    </>
  );
};

export default Dashboard;
