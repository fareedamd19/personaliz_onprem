import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import { IoCallSharp } from "react-icons/io5";
import { useGlobalStoreContext } from "../../context/GlobalStoreContext";
import { checkIfParamsArePresent } from "../../utils/Functions";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const {
    customHeader,
    getUrlLinkToBeRedirectedTo,
    campaignName,
    is_RTL,
    handleTrackEvent,
  } = useGlobalStoreContext();
  const { mode } = checkIfParamsArePresent();
  const [showWarningText, setShowWarningText] = useState(mode === "test");

  return (
    <nav className="w-full h-[65px] px-5 py-1 flex items-center justify-between bg-white shadow-md relative">
      <Link
        className="overflow-hidden"
        target="_blank"
        href={
          getUrlLinkToBeRedirectedTo(
            customHeader?.custom_logo_redirect_url,
            campaignName,
            "?"
          ) || ""
        }
        onClick={() => handleTrackEvent({ is_header_logo_clicked: "1" })}
      >
        <Image
          src={
            customHeader?.custom_logo_img_url ||
            "https://personaliz-uploads.s3.ap-south-1.amazonaws.com/Personaliz_white_logo.png"
          }
          loading="lazy"
          alt="logo"
          width={150}
          height={50}
          className="w-[120px] md:w-auto max-h-[50px]"
        />
      </Link>

      <div onClick={() => handleTrackEvent({ is_header_cta_clicked: "1" })}>
        {customHeader?.custom_button_type === "call" ? (
          <a
            style={{ background: customHeader?.custom_button_color }}
            className="flex items-center px-[10px] py-[9px] text-white rounded-md"
            href={`tel:${customHeader?.custom_button_redirect_url}`}
          >
            <p className="flex items-center gap-2">
              <IoCallSharp />
              {customHeader?.custom_button_text}
            </p>
          </a>
        ) : (
          <Link
            style={{
              background: customHeader?.custom_button_color,
              direction: is_RTL ? "rtl" : "",
              unicodeBidi: is_RTL ? "bidi-override" : "",
            }}
            className={`flex items-center px-[10px] py-[9px] text-white rounded-md`}
            target="_blank"
            href={
              getUrlLinkToBeRedirectedTo(
                customHeader?.custom_button_redirect_url,
                campaignName,
                "?"
              ) || ""
            }
          >
            {customHeader?.custom_button_text}
          </Link>
        )}
      </div>

      {showWarningText && (
        <p
          style={{
            direction: is_RTL ? "rtl" : "",
            unicodeBidi: is_RTL ? "bidi-override" : "",
          }}
          className={`${styles.warningCont} w-max md:w-max p-2 bg-black bg-opacity-50 text-white text-base md:text-lg rounded-md font-serif absolute left-1/2 -translate-x-[50%] -bottom-4 z-[10]`}
        >
          Viewing in test mode, responses will not be stored{" "}
          <span
            onClick={() => setShowWarningText(false)}
            className="cursor-pointer border border-white px-1 rounded ml-2"
          >
            X
          </span>
        </p>
      )}
    </nav>
  );
};

export default Navbar;
