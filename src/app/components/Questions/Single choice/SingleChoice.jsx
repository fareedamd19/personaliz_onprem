import { useGlobalStoreContext } from "@/app/context/GlobalStoreContext";
import React, { Fragment, useEffect, useState } from "react";
import BranchOption from "./Options/BranchOption";
import UrlOption from "./Options/UrlOption";
import QuestionTitle from "../../Question Container/QuestionTitle";

const SingleChoice = () => {
  const {
    isQuestionOnTopOfVideo,
    currentQuestionData,
    fontThemeObj,
    is_RTL,
    getBackgroundColorForTitle,
  } = useGlobalStoreContext();

  const [options, setOptions] = useState([]);

  useEffect(() => {
    const optionsObj = JSON.parse(currentQuestionData.current.options);
    for (let key in optionsObj) {
      setOptions((prev) => [...prev, optionsObj[key]]);
    }
    return () => {
      setOptions([]);
    };

    // eslint-disable-next-line
  }, [currentQuestionData.current.options]);

  return (
    <>
      <section className={`w-[90%] mx-auto mt-4`}>
        {currentQuestionData.current.text && <QuestionTitle />}

        <div
          className={`w-full h-full flex ${
            !isQuestionOnTopOfVideo ? "flex-col gap-7" : "gap-2 md:gap-4"
          } flex-wrap mt-3`}
        >
          {options.length > 0 &&
            options.map((option, index) => {
              return (
                <Fragment key={index}>
                  {option.type === "branch" ? (
                    <BranchOption option={option} index={index} />
                  ) : (
                    <UrlOption option={option} index={index} />
                  )}
                </Fragment>
              );
            })}
        </div>
      </section>
    </>
  );
};

export default SingleChoice;
