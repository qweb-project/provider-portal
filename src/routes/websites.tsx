import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useReadContract } from 'wagmi'
import { websiteRegistryAbi, websiteRegistryAddress } from '@/lib/contracts'
import { useThemeContext } from '@/context/ThemeContext'
import { WebsiteCard } from '@/components/WebsiteCard'
import { Meteors } from '@/components/magicui/meteors'

export const Route = createFileRoute('/websites')({
  component: Websites,
})

function Websites() {
  useThemeContext()

  const { data: allWebsites, isLoading } = useReadContract({
    abi: websiteRegistryAbi,
    address: websiteRegistryAddress,
    functionName: 'getAllWebsites',
  })

  const websiteList: any[] = useMemo(() => {
    return Array.isArray(allWebsites) ? (allWebsites as any[]) : []
  }, [allWebsites])

  const content = (
    <div className="min-h-[75vh] p-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">All Registered Websites</h1>
          <div className="text-sm text-muted-foreground">Total: {websiteList.length}</div>
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading websites...</div>
        ) : websiteList.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">No websites registered yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {websiteList.map((website: any, index: number) => {
              const url: string = website?.url ?? website?.[0]
              const owner: string | undefined = website?.owner ?? website?.[1]
              const paywallRaw: bigint | number = (website?.paywall ?? website?.[2] ?? 0) as any
              const paywallUSDC = Number(paywallRaw) / 1_000_000

              return (
                <WebsiteCard
                  key={`${url}-${index}`}
                  url={url}
                  owner={owner}
                  paywallUSDC={paywallUSDC}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      <div className="hidden md:block">
        <Meteors number={30} />
        {content}
      </div>

      <div className="md:hidden">{content}</div>
    </>
  )
}


