import Image from 'next/image'
import React, { useRef } from 'react'
import Link from 'next/link'
import { IoCallSharp } from "react-icons/io5";
import { useGlobalStoreContext } from '../context/GlobalStoreContext';

const Navbar = () => {

const {customHeader,getUrlLinkToBeRedirectedTo,campaignName} = useGlobalStoreContext()

 
  return (
    
    <nav className='w-full h-[65px] px-5 py-1 flex items-center justify-between bg-white shadow-md'>
    <Link href={getUrlLinkToBeRedirectedTo(customHeader?.custom_logo_redirect_url,campaignName,'?')||""}>
    <Image src={customHeader?.custom_logo_img_url||"https://personaliz-uploads.s3.ap-south-1.amazonaws.com/Personaliz_white_logo.png"} loading="lazy" alt="logo" width={150} height={150}/>
    </Link>
    {
      customHeader?.custom_button_type==='call'?<a style={{background:customHeader?.custom_button_color}} className='flex items-center px-[10px] py-[9px] text-white rounded-md' href={`tel:${customHeader?.custom_button_redirect_url}`}>
      <p className="flex items-center gap-2">
      <IoCallSharp/>
      {customHeader?.custom_button_text}
      </p>
      </a>
      :
      <Link style={{background:customHeader?.custom_button_color}} className={`flex items-center px-[10px] py-[9px] text-white rounded-md`} href={getUrlLinkToBeRedirectedTo(customHeader?.custom_button_redirect_url,campaignName,'?')||''}>{customHeader?.custom_button_text}</Link>
    }
    
    </nav>
  )
}

export default Navbar