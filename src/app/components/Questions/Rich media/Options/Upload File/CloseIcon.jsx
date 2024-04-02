import React from 'react'

const CloseIcon = ({bgColor="black",color="white",handleGoBack}) => {
  return (
    <svg onClick={handleGoBack} className='cursor-pointer' xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42" fill="none">
    <g filter="url(#filter0_b_2166_1265)">
      <circle cx="21" cy="21" r="21" fill={color} fillOpacity="0.6"/>
    </g>
    <circle cx="21" cy="21" r="17" fill={bgColor} stroke={color} strokeWidth="2" strokeDasharray="3 3"/>
    <path d="M22.0567 20.9987L26.7783 16.2846C26.9194 16.1435 26.9987 15.9521 26.9987 15.7525C26.9987 15.5529 26.9194 15.3615 26.7783 15.2204C26.6372 15.0793 26.4458 15 26.2462 15C26.0466 15 25.8552 15.0793 25.7141 15.2204L21 19.942L16.2859 15.2204C16.1448 15.0793 15.9534 15 15.7538 15C15.5542 15 15.3628 15.0793 15.2217 15.2204C15.0806 15.3615 15.0013 15.5529 15.0013 15.7525C15.0013 15.9521 15.0806 16.1435 15.2217 16.2846L19.9433 20.9987L15.2217 25.7128C15.1514 25.7825 15.0957 25.8654 15.0576 25.9567C15.0196 26.048 15 26.146 15 26.2449C15 26.3439 15.0196 26.4418 15.0576 26.5331C15.0957 26.6245 15.1514 26.7074 15.2217 26.777C15.2914 26.8473 15.3743 26.903 15.4656 26.9411C15.5569 26.9791 15.6549 26.9987 15.7538 26.9987C15.8527 26.9987 15.9507 26.9791 16.042 26.9411C16.1334 26.903 16.2162 26.8473 16.2859 26.777L21 22.0555L25.7141 26.777C25.7838 26.8473 25.8666 26.903 25.958 26.9411C26.0493 26.9791 26.1473 26.9987 26.2462 26.9987C26.3451 26.9987 26.4431 26.9791 26.5344 26.9411C26.6257 26.903 26.7086 26.8473 26.7783 26.777C26.8486 26.7074 26.9043 26.6245 26.9424 26.5331C26.9804 26.4418 27 26.3439 27 26.2449C27 26.146 26.9804 26.048 26.9424 25.9567C26.9043 25.8654 26.8486 25.7825 26.7783 25.7128L22.0567 20.9987Z" fill={color} stroke={color}/>
    <defs>
      <filter id="filter0_b_2166_1265" x="-20" y="-20" width="82" height="82" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feGaussianBlur in="BackgroundImageFix" stdDeviation="10"/>
        <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_2166_1265"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_2166_1265" result="shape"/>
      </filter>
    </defs>
  </svg>
  )
}

export default CloseIcon