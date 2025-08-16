import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useReadContract } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { websiteRegistryAbi, websiteRegistryAddress } from '@/lib/contracts'
import { useThemeContext } from '@/context/ThemeContext'
import { WebsiteCard } from '@/components/WebsiteCard'
import { Meteors } from '@/components/magicui/meteors'
import { Globe } from "@/components/magicui/globe";
import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Websites,
})

function Websites() {
  useThemeContext()
  const navigate = useNavigate()
  const { data: allWebsites, isLoading } = useReadContract({
    abi: websiteRegistryAbi,
    address: websiteRegistryAddress,
    functionName: 'getAllWebsites',
    chainId: baseSepolia.id,
  })

  const websiteList: any[] = useMemo(() => {
    return Array.isArray(allWebsites) ? (allWebsites as any[]) : []
  }, [allWebsites])

  const content = (
    <div className="min-h-[75vh] p-8">
      <div className="mx-auto w-full max-w-6xl">
  <div className="justify-center items-center mb-6">
      {/* hero */}
     <div className="relative flex size-full w-full min-w-lg items-center justify-center overflow-hidden rounded-lg border bg-background px-40 pb-40 pt-8 md:pb-60">
      <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-6xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10">
        Monetize your website in <br></br><span className="text-primary">1 click</span>
      </span>
      <Globe className="top-28" />
      <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.2),rgba(255,255,255,0))]" />
    <InteractiveHoverButton className="absolute bottom-2 right-2" onClick={() => navigate({ to: '/register' })}>Register Website</InteractiveHoverButton>
    </div>
    </div>
    <div className="p-2 bg-card rounded-lg p-10 min-h-[35vh]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Registered Websites</h1>
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


