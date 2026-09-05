'use client'

import React from 'react'
import { GlobalStoreProvider } from '@/app/context/GlobalStoreContext'
import Dashboard from '../Dashboard/Dashboard'
import { installOnPremiseNetworkGuard } from '@/app/onprem/networkGuard'

// Installed at module scope rather than in an effect: the first-load request
// is issued while this tree is still mounting, so a guard set up in useEffect
// would arrive after the call it exists to stop.
installOnPremiseNetworkGuard()

const MainEntryPoint = ({ server_personaliz_branding }) => {



  return (
    <>
      <GlobalStoreProvider>
        <Dashboard server_personaliz_branding={server_personaliz_branding} />
      </GlobalStoreProvider>
    </>
  )
}

export default MainEntryPoint