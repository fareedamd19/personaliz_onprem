"use-client";

import React, { useEffect, useRef } from "react";
import styles from "./Loader.module.css";
import Image from "next/image";
import MoonLoader from "react-spinners/MoonLoader";

const Loader = ({ server_personaliz_branding }) => {
  const loaderInnerRef = useRef(null);

  useEffect(() => {
    if (loaderInnerRef.current) {
      const filler = loaderInnerRef.current;
      let progress = 0;

      const updateProgressBar = () => {
        if (progress < 50) {
          progress += 0.5;
        } else if (progress < 70) {
          progress += 0.2;
        } else if (progress < 80) {
          progress += 0.1;
        } else if (progress >= 80 && progress < 100) {
          // Slow down after reaching 90%
          progress += 0.02;
        } else {
          clearInterval(progress_bar_interval);
        }
        filler.style.width = progress + "%";
      };

      let progress_bar_interval = setInterval(updateProgressBar, 10);
    }
  }, []);

  return (
    <section className="w-full h-screen flex flex-col items-center justify-center bg-white absolute top-0 left-0 z-[10000]">
      {process.env.NEXT_PUBLIC_SERVER_ORIGIN === "middle-east" ? (
        <MoonLoader />
      ) : (
        <div className="w-[117px] h-[117px]">
          {server_personaliz_branding === "none" ? (
            <Image
              src={
                "/onprem/chrome/Personaliz_custom_loader.gif"
              }
              height={117}
              width={117}
              alt="personaliz logo"
            />
          ) : (
            <video
              className={styles.videoElm}
              src={
                "/onprem/chrome/PersonalizBlackLogoAnimatedForLoading.mp4"
              }
              playsInline
              muted
              autoPlay
              loop
            ></video>
          )}
        </div>
      )}

      <div className={styles.interactly_loader_outer_cont}>
        <div
          ref={loaderInnerRef}
          className={styles.interactly_loader_inner_loader}
        ></div>
      </div>
    </section>
  );
};

export default Loader;
