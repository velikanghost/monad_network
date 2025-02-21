'use client'

import { WagmiProvider } from 'wagmi'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { monadTestnet } from 'viem/chains'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

export default function WagmiProviderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [config, setConfig] = useState<any>(null)

  useEffect(() => {
    setConfig(
      getDefaultConfig({
        appName: process.env.NEXT_PUBLIC_REOWN_APP_NAME!,
        projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!,
        chains: [monadTestnet],
      }),
    )
  }, [])

  if (!config) return null

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
