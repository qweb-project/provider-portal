import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useEvmAddress } from '@coinbase/cdp-hooks'
import { websiteRegistryAbi, websiteRegistryAddress } from '@/lib/contracts'
import { useThemeContext } from '@/context/ThemeContext'
import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button'
import { WebsiteCard } from '@/components/WebsiteCard'
import { Meteors } from "@/components/magicui/meteors"
import type { BaseError } from 'wagmi'

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})

type WebsiteLike = {
  url?: string
  paywall?: bigint | number
} | any

function formatPaywallToUSDC(value: bigint | number | undefined): number {
  if (typeof value === 'bigint') return Number(value) / 1_000_000
  if (typeof value === 'number') return value / 1_000_000
  return 0
}

// Removed WebsiteItemRow in favor of reusable WebsiteCard

function WebsitesList({
  websites,
  isLoading,
  onAddWebsite,
  onDeleteWebsite,
  variant,
  emptyCtaLabel,
}: {
  websites: WebsiteLike[]
  isLoading: boolean
  onAddWebsite: () => void
  onDeleteWebsite: (url: string) => void
  variant: 'desktop' | 'mobile'
  emptyCtaLabel: string
}) {
  if (isLoading) {
    return (
      <div className={variant === 'desktop' ? 'text-center text-muted-foreground py-8' : 'text-center text-muted-foreground py-6'}>
        {variant === 'desktop' ? 'Loading your websites...' : 'Loading...'}
      </div>
    )
  }

  if (!websites || websites.length === 0) {
    return (
      <div className={variant === 'desktop' ? 'text-center text-muted-foreground py-8' : 'text-center text-muted-foreground py-6'}>
        <p className="mb-4">{variant === 'desktop' ? 'No websites registered yet.' : 'No websites yet.'}</p>
        <InteractiveHoverButton onClick={onAddWebsite}>
          {emptyCtaLabel}
        </InteractiveHoverButton>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {websites.map((website: WebsiteLike, index: number) => {
        const url: string = (website?.url ?? website?.[0]) as string
        const paywallRaw: bigint | number = (website?.paywall ?? website?.[2] ?? 0) as any
        const paywallUSDC = formatPaywallToUSDC(paywallRaw)
        return (
          <WebsiteCard
            key={`${url}-${index}`}
            url={url}
            paywallUSDC={paywallUSDC}
            onDelete={onDeleteWebsite}
          />
        )
      })}
    </div>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  useThemeContext()
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
  const { writeContract: deleteWebsite, data: deleteHash, error: deleteWriteError } = useWriteContract()
  const { isLoading: _isDeleteConfirming, isSuccess: isDeleteConfirmed } = useWaitForTransactionReceipt({ hash: deleteHash })

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
      <div className="min-h-[75vh] p-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="p-8 border rounded-xl text-center">
            <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-6">Please connect your wallet to view your registered websites.</p>
            <InteractiveHoverButton onClick={handleAddWebsite}>Go Back</InteractiveHoverButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="hidden md:block">
        <Meteors number={30} />
        <div className="min-h-[75vh] p-8">
          <div className="mx-auto w-full max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Registered Websites</h1>
              {websiteList.length > 0 ? (
                <InteractiveHoverButton onClick={handleAddWebsite} className="bg-primary/10 hover:bg-primary/20">
                  + Add Website
                </InteractiveHoverButton>
              ) : null}
            </div>
            <WebsitesList
              websites={websiteList}
              isLoading={isLoadingWebsites}
              onAddWebsite={handleAddWebsite}
              onDeleteWebsite={handleDeleteWebsite}
              variant="desktop"
              emptyCtaLabel="Register Your First Website"
            />
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="min-h-[75vh] p-6">
          <div className="mx-auto w-full max-w-3xl">
            <div className="flex flex-col gap-3 mb-4">
              <h2 className="text-xl font-bold">Registered Websites</h2>
              <p className="text-sm text-muted-foreground">Manage your websites</p>
            </div>
            {Boolean(deleteError) && (
              <div className="text-sm text-red-500 text-center bg-red-500/10 p-3 rounded-md mb-3">
                Error: {deleteError}
              </div>
            )}
            {Boolean(deleteSuccess) && (
              <div className="text-sm text-green-500 text-center bg-green-500/10 p-3 rounded-md mb-3">
                {deleteSuccess}
              </div>
            )}
            <WebsitesList
              websites={websiteList}
              isLoading={isLoadingWebsites}
              onAddWebsite={handleAddWebsite}
              onDeleteWebsite={handleDeleteWebsite}
              variant="mobile"
              emptyCtaLabel="Register First Website"
            />
            <div className="mt-4">
              <InteractiveHoverButton onClick={handleAddWebsite} className="w-full">
                + Add New Website
              </InteractiveHoverButton>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
