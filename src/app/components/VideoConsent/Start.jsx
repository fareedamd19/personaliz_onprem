import React from "react";
import { IoVideocamOutline } from "react-icons/io5";
import { Button } from "../ui/button";

const Start = ({ setIsStarted }) => {
  return (
    <div className="flex-center flex-col gap-4">
      <p className="p-2 px-5 bg-gray-200 rounded-lg text-center">
        Press <strong>Start</strong> and read the message
      </p>
      <Button onClick={() => setIsStarted(true)}>
        <IoVideocamOutline className=" text-xl mr-2" />
        Start
      </Button>
    </div>
  );
};

export default Start;
