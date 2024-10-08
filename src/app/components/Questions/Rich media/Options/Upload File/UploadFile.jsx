import { useGlobalStoreContext } from "@/app/context/GlobalStoreContext";
import { addOpacity, getContrastColor } from "@/app/utils/Functions";
import React, { Fragment, useRef, useState } from "react";
import { IoCloudUpload } from "react-icons/io5";
import CloseIcon from "./CloseIcon";
import FileSelectedModal from "./FileSelectedModal";

const UploadFile = ({ optionData, handleGoBack }) => {
  const { fontThemeObj, optionThemeObj, getUrlForFIlesUploadedInUploadedType } =
    useGlobalStoreContext();
  const [filesArray, setFilesArray] = useState([]);
  const [showErrorMessage, setShowErrorMessage] = useState("");
  const chooseFileRef = useRef(null);

  const chooseFile = () => {
    if (chooseFileRef.current) {
      chooseFileRef.current.click();
    }
  };

  const handleFileSelected = (e) => {
    if (e.target.files.length > 0) {
      const filesList = Array.from(e.target.files);

      let newTempFileList = [];
      for (const k of filesList) {
        newTempFileList.push({
          data: k,
          id:
            new Date().getTime().toString() +
            Math.floor(Math.random() * 1000000),
        });
      }

      const hasExcceededLimit = newTempFileList.some(
        (file) =>
          Math.round(+file.data.size / 1024) / 1000 >
          Number(optionData.length_limit)
      );

      if (hasExcceededLimit) {
        if (filesList.length > 1) {
          setShowErrorMessage(
            "One or more files has size more than " +
              optionData.length_limit +
              " MB"
          );
          chooseFileRef.current.value = "";
        } else {
          setShowErrorMessage(
            "File size should be less than " + optionData.length_limit + " MB"
          );
          chooseFileRef.current.value = "";
        }
      } else {
        setFilesArray(newTempFileList);
        chooseFileRef.current.value = "";
      }
    }
  };

  function handleRemoveFile(id) {
    setFilesArray((prev) => prev.filter((file) => file.id !== id));
  }

  function handleJump() {
    getUrlForFIlesUploadedInUploadedType(filesArray);
  }

  return (
    <>
      <input
        onChange={handleFileSelected}
        ref={chooseFileRef}
        type="file"
        accept={optionData?.allowed_types}
        multiple
        hidden
      />
      <section className="w-full h-[76dvh] rounded-md flex flex-col items-center justify-center gap-2 overflow-hidden">
        {filesArray.length === 0 && (
          <Fragment>
            <div className="flex items-center gap-2">
              <div
                onClick={chooseFile}
                style={{
                  borderColor: optionThemeObj?.option_text_color,
                  backgroundColor: addOpacity(
                    optionThemeObj?.option_text_color
                  ),
                }}
                className={`flex flex-col gap-2 items-center justify-center py-5 px-8 md:py-7 md:px-12 rounded-2xl border-2 border-dashed backdrop-blur cursor-pointer`}
              >
                <IoCloudUpload
                  style={{ color: optionThemeObj?.option_text_color }}
                  className={`text-8xl`}
                />
                <h1
                  style={{
                    fontFamily: fontThemeObj?.font_name,
                    color: optionThemeObj?.option_text_color,
                  }}
                  className="font-bold md:text-lg"
                >
                  Upload File
                </h1>
                <p
                  style={{
                    fontFamily: fontThemeObj?.font_name,
                    color: optionThemeObj?.option_text_color,
                  }}
                  className="text-sm"
                >
                  ( Max Size : {optionData?.length_limit} MB )*
                </p>
              </div>
              <CloseIcon
                bgColor={getContrastColor(optionThemeObj?.option_text_color)}
                color={optionThemeObj?.option_text_color}
                handleGoBack={handleGoBack}
              />
            </div>
            {showErrorMessage && (
              <p
                style={{
                  fontFamily: fontThemeObj?.font_name,
                  fontSize: `${+fontThemeObj?.font_size - 3}px`,
                }}
                className="bg-black bg-opacity-60 w-max px-2 py-1 rounded-md"
              >
                <span className="text-red-500 opacity-100 font-bold">
                  {showErrorMessage}
                </span>
              </p>
            )}
          </Fragment>
        )}

        {!!filesArray.length && (
          <FileSelectedModal
            filesArray={filesArray}
            handleRemoveFile={handleRemoveFile}
            handleJump={handleJump}
          />
        )}
      </section>
    </>
  );
};

export default UploadFile;
