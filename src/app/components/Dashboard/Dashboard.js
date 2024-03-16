import React from 'react'
import ChecksAndFirstDataOnLoad from '../ChecksAndFirstDataOnLoad'
import Loader from '../Loader/Loader'
import Navbar from '../Navbar'
import LayoutContainer from '../Layout Container/LayoutContainer'
import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext'

const Dashboard = () => {

    const {firstLoadData}=useGlobalStoreContext()

  return (
  <>
<ChecksAndFirstDataOnLoad/>
{!firstLoadData&&<Loader/>}
{firstLoadData&&<section className="w-full h-screen overflow-hidden">
<Navbar/>
<LayoutContainer/>
</section>}
  </>
  )
}

export default Dashboard