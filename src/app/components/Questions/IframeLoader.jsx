import React from "react";

const IframeLoader = () => {
  return (
    <>
      <div className="shadow-lg w-full h-[65vh] rounded-md flex items-center justify-center bg-white">
        <div className="w-[117px] h-[117px]">
          <video
            className={`w-full h-full object-cover object-center`}
            src={
              "/onprem/chrome/PersonalizBlackLogoAnimatedForLoading.mp4"
            }
            playsInline
            muted
            autoPlay
            loop
          ></video>
        </div>
      </div>
    </>
  );
};

export default IframeLoader;
