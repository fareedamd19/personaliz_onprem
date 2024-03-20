import { useGlobalStoreContext } from "@/app/context/GlobalStoreContext";
import Image from "next/image";
import React from "react";

const Default = () => {
    const {getUrlLinkToBeRedirectedTo,campaignName,configData} = useGlobalStoreContext()

    return (
        <section className="w-full h-[90vh] flex items-center justify-center">
            <div className="w-full md:w-[64%] m-auto flex rounded-2xl bg-gray-100 p-4 md:p-10">
            <div
                className="h-[482px] w-full rounded-xl flex flex-col justify-center items-center text-2xl text-center gap-10 p-2 md:p-10 bg-gray-100"
                style={{
                    font: "normal normal medium 25px/69px GT Walsheim Pro",
                }}
            >
                <div className="flex flex-col justify-center items-center gap-5">
                    <Image
                        src="https://dyolkjkaata8s.cloudfront.net/thanks.png"
                        alt="thanks"
                        width={120}
                        height={120}
                    />
                    <p style={{direction:(+configData?.is_RTL)?"rtl":"",
        unicodeBidi:(+configData?.is_RTL)?"bidi-override":""}} className="font-normal mt-5">
                        Thank you, For answering all the Questions
                    </p>
                    <div className="flex items-center gap-4">
                        <Image
                            src="https://d34um3r0i45esv.cloudfront.net/lamp.svg"
                            alt="lamp"
                            className="w-[50px]"
                            width={100}
                            height={100}
                        />
                        <div>
                        <p style={{direction:(+configData?.is_RTL)?"rtl":"",
                        unicodeBidi:(+configData?.is_RTL)?"bidi-override":""}} className="font-normal text-gray-500">You just experienced</p>
                        <p style={{direction:(+configData?.is_RTL)?"rtl":"",
                        unicodeBidi:(+configData?.is_RTL)?"bidi-override":""}} className="font-bold text-[22px]">
                        Personaliz.ai
                        </p>
                        </div>
                    </div>

                    <a
                        href={getUrlLinkToBeRedirectedTo(process.env.NEXT_PUBLIC_PERSONALIZ_URL,campaignName,'?')}
                        rel="noreferrer"
                        target="_blank"
                    >
                        <button style={{direction:(+configData?.is_RTL)?"rtl":"",
                        unicodeBidi:(+configData?.is_RTL)?"bidi-override":""}} className="text-white text-sm bg-black rounded-[28px] w-[233px] h-[56px] shadow-lg shadow-black mt-10">
                            Try Personaliz.ai Free
                        </button>
                    </a>
                </div>
            </div>
        </div>
        </section>
    );
};

export default Default;
