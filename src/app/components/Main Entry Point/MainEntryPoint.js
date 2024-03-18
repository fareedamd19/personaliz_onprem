'use client'

import React from 'react'
import { GlobalStoreProvider } from '@/app/context/GlobalStoreContext'
import Dashboard from '../Dashboard/Dashboard'

const MainEntryPoint = ({server_personaliz_branding}) => {
   
   

  return (
   <>
  <GlobalStoreProvider> 
<Dashboard server_personaliz_branding={server_personaliz_branding}/>
</GlobalStoreProvider>
   </>
  )
}

export default MainEntryPoint