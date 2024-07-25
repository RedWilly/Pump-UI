import React, { useState } from 'react'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'


const CustomConnectButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button onClick={openConnectModal} className="btn btn-primary neon-border text-xs px-2 py-1">
                    Connect
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} className="btn btn-secondary neon-border text-xs px-2 py-1">
                    Wrong network
                  </button>
                )
              }

              return (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={openChainModal}
                    className="btn btn-secondary neon-border text-xs px-2 py-1"
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    <span className="text-[10px] sm:text-xs">{chain.name}</span>
                  </button>

                  <button onClick={openAccountModal} className="btn btn-primary neon-border text-[10px] sm:text-xs px-2 py-1">
                    <span>{account.displayName.slice(0, 4)}...{account.displayName.slice(-4)}</span>
                    {account.displayBalance
                      ? <span className="hidden sm:inline ml-1">({account.displayBalance})</span>
                      : ''}
                  </button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-gray-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-400 neon-text">
              Pump Fun
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/create" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm">
              Create Token
            </Link>
            <Link href="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm">
              Dashboard
            </Link>
            <CustomConnectButton />
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/create" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              Create Token
            </Link>
            <Link href="/dashboard" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              Dashboard
            </Link>
            <div className="mt-4 px-3">
              <CustomConnectButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar