import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useEvmAddress } from '@coinbase/cdp-hooks'
import { websiteRegistryAbi, websiteRegistryAddress } from '@/lib/contracts'
import { useThemeContext } from '@/context/ThemeContext'
import { 
  CardTitle, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card'
import { MagicCard } from '@/components/magicui/magic-card'
import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button'
import { BorderBeam } from '@/components/magicui/border-beam'
import { HyperText } from '@/components/magicui/hyper-text'
import { Button } from '@/components/Button'
import { Meteors } from "@/components/magicui/meteors"
import type { BaseError } from 'wagmi'

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const navigate = useNavigate()
  const { theme } = useThemeContext()
  const { evmAddress: address } = useEvmAddress()
  const { isConnected, address: wagmiAddress } = useAccount()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null)

  const connectedAddress = (wagmiAddress || address) as `0x${string}` | undefined

  // Fetch user's websites
  const { data: websites, isLoading: isLoadingWebsites, refetch: refetchWebsites } = useReadContract({
    abi: websiteRegistryAbi,
    address: websiteRegistryAddress,
    functionName: 'getWebsites',
    args: connectedAddress ? [connectedAddress] : undefined,
    query: {
      enabled: !!connectedAddress,
    },
  })

  // Normalize unknown contract data to a typed array for JSX usage
  const websiteList: any[] = Array.isArray(websites) ? (websites as any[]) : []

  // Delete website functionality
  const { writeContract: deleteWebsite, data: deleteHash, error: deleteWriteError, isPending: isDeleting } = useWriteContract()
  const { isLoading: isDeleteConfirming, isSuccess: isDeleteConfirmed } = useWaitForTransactionReceipt({ hash: deleteHash })

  // Handle delete success
  useEffect(() => {
    if (isDeleteConfirmed) {
      setDeleteSuccess('Website removed successfully!')
      setDeleteError(null)
      refetchWebsites()
      // Clear success message after 3 seconds
      setTimeout(() => setDeleteSuccess(null), 3000)
    }
  }, [isDeleteConfirmed, refetchWebsites])

  // Handle delete error
  useEffect(() => {
    if (deleteWriteError) {
      const message = (deleteWriteError as BaseError)?.shortMessage || (deleteWriteError as Error)?.message || 'Failed to delete website'
      setDeleteError(message)
      setDeleteSuccess(null)
    }
  }, [deleteWriteError])

  const handleDeleteWebsite = (websiteUrl: string) => {
    if (!connectedAddress) {
      setDeleteError('Please connect your wallet')
      return
    }

    setDeleteError(null)
    setDeleteSuccess(null)

    deleteWebsite({
      abi: websiteRegistryAbi,
      address: websiteRegistryAddress,
      functionName: 'removeWebsite',
      args: [websiteUrl],
    })
  }

  const handleAddWebsite = () => {
    navigate({ to: '/' })
  }

  if (!isConnected || !connectedAddress) {
    return (
      <div className="max-h-screen min-h-[75vh] min-w-md p-8 flex justify-center items-center flex-row">
        <div className="max-w-2xl min-w-md p-0 space-y-8 w-full md:w-auto h-full">
          <div className="relative p-2">
            <BorderBeam colorFrom={theme === "dark" ? "hsl(var(--primary))" : "hsl(var(--primary))"}/>
            <MagicCard
              gradientColor={theme === "dark" ? "hsl(var(--primary))" : "hsl(var(--primary))"}
              className="p-4 border-1 border-primary rounded-xl"
              gradientOpacity={0.2}
              gradientSize={50}
            >
              <CardContent className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
                <p className="text-muted-foreground mb-6">
                  Please connect your wallet to view your registered websites.
                </p>
                <InteractiveHoverButton onClick={handleAddWebsite}>
                  
                    Go Back
                  
                </InteractiveHoverButton>
              </CardContent>
            </MagicCard>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="hidden md:block">
        <Meteors number={30} />
        <div className="max-h-screen min-h-[75vh] min-w-md p-8 flex justify-center items-center flex-row">
          <div className="max-w-4xl min-w-md p-0 space-y-8 w-full md:w-auto h-full">
            <div className="relative p-2">
              <BorderBeam colorFrom={theme === "dark" ? "hsl(var(--primary))" : "hsl(var(--primary))"}/>
              <MagicCard
                gradientColor={theme === "dark" ? "hsl(var(--primary))" : "hsl(var(--primary))"}
                className="p-4 border-1 border-primary rounded-xl"
                gradientOpacity={0.2}
                gradientSize={50}
              >
                <CardTitle>
                  <div className="flex flex-row items-center justify-between gap-2">
                    <div className="flex flex-row items-center gap-2">
                    
                      <HyperText className="text-2xl font-bold">
                        Registered Websites
                      </HyperText>
                    </div>
                  </div>
                </CardTitle>
                
                <CardContent className="p-4">
                  <div className="grid gap-6">
                    {/* Websites List */}
                    <div className="grid gap-4">
                      
                      
                      {isLoadingWebsites ? (
                        <div className="text-center text-muted-foreground py-8">
                          Loading your websites...
                        </div>
                      ) : websiteList.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          <p className="mb-4">No websites registered yet.</p>
                          <InteractiveHoverButton onClick={handleAddWebsite}>
                            
                              Register Your First Website
                            
                          </InteractiveHoverButton>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {websiteList.map((website: any, index: number) => {
                            const url: string = website?.url ?? website?.[0]
                            const paywallRaw: bigint | number = (website?.paywall ?? website?.[2] ?? 0) as any
                            const paywallUSDC = Number(paywallRaw) / 1_000_000
                            return (
                              <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                                <div className="flex-1">
                                  <a 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-foreground hover:text-primary transition-colors font-medium"
                                  >
                                    {url}
                                  </a>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Paywall: {paywallUSDC} USDC
                                  </p>
                                </div>
                                <Button 
                                  onClick={() => handleDeleteWebsite(url)}
                                  disabled={isDeleting || isDeleteConfirming}
                                  className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1 text-sm"
                                >
                                 
                                    {isDeleting || isDeleteConfirming ? 'Deleting...' : 'Delete'}
                                 
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    {websiteList.length > 0 ? (
                    <div className="flex justify-start">
                      <InteractiveHoverButton onClick={handleAddWebsite} className="bg-primary/10 hover:bg-primary/20">
                        
                          + Add Website
                        
                      </InteractiveHoverButton>
                    </div>
                    ) : null}
                  </div>
                </CardContent>
              </MagicCard>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="max-h-screen min-h-[75vh] min-w-md p-8 flex justify-center items-center flex-row">
          <div className="max-w-2xl min-w-md p-0 space-y-8 w-full md:w-auto h-full">
            <div className="relative p-2">
              <BorderBeam colorFrom={theme === "dark" ? "hsl(var(--primary))" : "hsl(var(--primary))"}/>
              <MagicCard
                gradientColor={theme === "dark" ? "hsl(var(--primary))" : "hsl(var(--primary))"}
                className="p-4 border-1 border-primary rounded-xl"
                gradientOpacity={0.2}
                gradientSize={50}
              >
                <CardTitle>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row items-center gap-2">
                      <HyperText className="text-xl font-bold">
                        Dashboard
                      </HyperText>
                    </div>
                  </div>
                  <p className="ml-10 text-sm text-muted-foreground">
                    Manage your websites
                  </p>
                </CardTitle>
                
                <CardContent className="p-4">
                  <div className="grid gap-4">
                    {/* Status Messages */}
                    {Boolean(deleteError) && (
                      <div className="text-sm text-red-500 text-center bg-red-500/10 p-3 rounded-md">
                        Error: {deleteError}
                      </div>
                    )}
                    {Boolean(deleteSuccess) && (
                      <div className="text-sm text-green-500 text-center bg-green-500/10 p-3 rounded-md">
                        {deleteSuccess}
                      </div>
                    )}

                    {/* Websites List */}
                    <div className="grid gap-4">
                      {isLoadingWebsites ? (
                        <div className="text-center text-muted-foreground py-6">
                          Loading...
                        </div>
                      ) : websiteList.length === 0 ? (
                        <div className="text-center text-muted-foreground py-6">
                          <p className="mb-4">No websites yet.</p>
                          <InteractiveHoverButton onClick={handleAddWebsite}>
                           
                              Register First Website
                           
                          </InteractiveHoverButton>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {websiteList.map((website: any, index: number) => {
                            const url: string = website?.url ?? website?.[0]
                            const paywallRaw: bigint | number = (website?.paywall ?? website?.[2] ?? 0) as any
                            const paywallUSDC = Number(paywallRaw) / 1_000_000
                            return (
                              <div key={index} className="p-3 bg-muted/50 rounded-lg border">
                                <div className="mb-2">
                                  <a 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-foreground hover:text-primary transition-colors font-medium text-sm"
                                  >
                                    {url}
                                  </a>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-muted-foreground">
                                    Paywall: {paywallUSDC} USDC
                                  </span>
                                  <Button 
                                    onClick={() => handleDeleteWebsite(url)}
                                    disabled={isDeleting || isDeleteConfirming}
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-2 py-1"
                                  >
                                    {isDeleting || isDeleteConfirming ? 'Deleting...' : 'Delete'}
                                  </Button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 mt-4 justify-center border-t border-border">
                  <InteractiveHoverButton onClick={handleAddWebsite} className="w-full">
                    
                      + Add New Website
                    
                  </InteractiveHoverButton>
                </CardFooter>
              </MagicCard>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
