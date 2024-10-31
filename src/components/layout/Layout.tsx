import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import LiveNotifications from '../notifications/LiveNotifications'


interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#111111] text-white">
       <LiveNotifications />
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout