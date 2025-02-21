'use client'

import { useState } from 'react'
import { Twitter, Gift, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import { CustomConnectButton } from '@/components/CustomConnectButton'
import toast from 'react-hot-toast'

export default function Home() {
  const { address: connectedAddress, isConnected } = useAccount()
  //const { signMessageAsync } = useSignMessage()
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [twitterFollowed, setTwitterFollowed] = useState(false)
  const [loadingTwitter, setLoadingTwitter] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)

  // const handleSignMessage = async () => {
  //   if (!isConnected || !connectedAddress) {
  //     alert('Please connect your wallet first!')
  //     return
  //   }

  //   const message = `Hello ${connectedAddress}, sign this message to prove ownership!`

  //   await signMessageAsync(
  //     { message },
  //     {
  //       onSuccess: () => {
  //         setCurrentStep(2) // Proceed to Twitter follow step
  //       },
  //       onError: (error) => {
  //         console.error('Signing failed', error)
  //       },
  //     },
  //   )
  // }

  const handleFollowTwitter = () => {
    setLoadingTwitter(true)
    setTimeout(() => {
      setLoadingTwitter(false)
      setTwitterFollowed(true)
      setCurrentStep(2)
    }, 10000)
  }

  const COOLDOWN_PERIOD = 36 * 60 * 60 * 1000
  const handleClaim = async () => {
    try {
      if (!connectedAddress) {
        toast.error('No connected wallet!')
        return
      }

      setIsClaiming(true)

      const lastClaimTimestamp = localStorage.getItem('lastClaimTimestamp')
      const currentTime = Date.now()

      // Check if the user is within the cooldown period
      if (
        lastClaimTimestamp &&
        currentTime - parseInt(lastClaimTimestamp, 10) < COOLDOWN_PERIOD
      ) {
        const remainingTime =
          COOLDOWN_PERIOD - (currentTime - parseInt(lastClaimTimestamp, 10))
        const minutes = Math.floor(remainingTime / 1000 / 60)
        const seconds = Math.floor((remainingTime / 1000) % 60)

        toast.error(
          `Please wait ${minutes}m ${seconds}s before claiming again!`,
        )
        setIsClaiming(false)
        return
      }

      // Get disburse data from backend
      const response = await fetch('/api/disburse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectedAddress: connectedAddress,
        }),
      })

      if (!response.ok) {
        const errorMsg = await response.json()
        toast.error(errorMsg?.error)
        setIsClaiming(false)
        return
      }

      //can also destructure txHash from this
      const { success } = await response.json()

      if (success) {
        localStorage.setItem('lastClaimTimestamp', currentTime.toString())
        toast.success('Reward claimed successfully')
      }
      setIsClaiming(false)
    } catch (error) {
      console.error('Error claiming reward:', error)
      setIsClaiming(false)
    }
  }

  return (
    <div className="h-screen flex justify-center items-center">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center mb-4">Velkan MON Faucet</CardTitle>
          <CardDescription className="text-center">
            This faucet dispenses 0.5 MON every 36 hours, Connect your wallet to
            proceed.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {/* STEP 1: CONNECT WALLET */}
          {!isConnected && <CustomConnectButton />}

          {/* STEP 2: SIGN MESSAGE */}
          {/* {isConnected && currentStep === 1 && (
            <div className="text-center mt-4">
              <Button onClick={handleSignMessage} className="w-full">
                <Wallet className="mr-2 h-4 w-4" /> Sign Message
              </Button>
            </div>
          )} */}

          {/* STEP 3: FOLLOW TWITTER */}
          {isConnected && currentStep === 1 && (
            <div className="text-center mt-4">
              <Link
                href="https://twitter.com/velkan_gst"
                target="_blank"
                className="w-full flex items-center justify-center gap-2 bg-neutral-900 text-neutral-50 hover:bg-neutral-900/90 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50/90 h-10 px-4 py-2 rounded-md"
                onClick={handleFollowTwitter}
              >
                <Twitter className="h-4 w-4" />
                Follow @velkan_gst on Twitter
              </Link>

              {loadingTwitter && (
                <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Verifying Twitter follow...
                </div>
              )}
            </div>
          )}

          {/* STEP 4: CLAIM MON */}
          {isConnected && currentStep === 2 && twitterFollowed && (
            <Button onClick={handleClaim} className="w-full">
              {isClaiming ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4 mr-2" /> Claiming
                  MON...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Gift className="mr-2 h-4 w-4" /> Claim MON
                </span>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
