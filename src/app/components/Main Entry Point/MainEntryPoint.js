'use client'

import React from 'react'
import { GlobalStoreProvider } from '@/app/context/GlobalStoreContext'
import Dashboard from '../Dashboard/Dashboard'

const MainEntryPoint = () => {
   
   

  return (
   <>
  <GlobalStoreProvider> 
<Dashboard/>
</GlobalStoreProvider>
   </>
  )
}

export default MainEntryPoint