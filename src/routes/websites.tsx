import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useReadContract } from 'wagmi'
import { websiteRegistryAbi, websiteRegistryAddress } from '@/lib/contracts'
import { useThemeContext } from '@/context/ThemeContext'
import { 
  CardTitle, 
  CardContent 
} from '@/components/ui/card'
import { MagicCard } from '@/components/magicui/magic-card'
import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button'
import { BorderBeam } from '@/components/magicui/border-beam'
import { HyperText } from '@/components/magicui/hyper-text'
import { Meteors } from '@/components/magicui/meteors'

export const Route = createFileRoute('/websites')({
  component: Websites,
})

function Websites() {
  const { theme } = useThemeContext()

  const { data: allWebsites, isLoading } = useReadContract({
    abi: websiteRegistryAbi,
    address: websiteRegistryAddress,
    functionName: 'getAllWebsites',
  })

  const websiteList: any[] = useMemo(() => {
    return Array.isArray(allWebsites) ? (allWebsites as any[]) : []
  }, [allWebsites])

  const content = (
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
                    All Registered Websites
                  </HyperText>
                </div>
                <div className="text-sm text-muted-foreground">
                  Total: {websiteList.length}
                </div>
              </div>
            </CardTitle>

            <CardContent className="p-4">
              <div className="grid gap-4">
                {isLoading ? (
                  <div className="text-center text-muted-foreground py-8">
                    Loading websites...
                  </div>
                ) : websiteList.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <p>No websites registered yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {websiteList.map((website: any, index: number) => {
                      const url: string = website?.url ?? website?.[0]
                      const owner: string = website?.owner ?? website?.[1]
                      const paywallRaw: bigint | number = (website?.paywall ?? website?.[2] ?? 0) as any
                      const paywallUSDC = Number(paywallRaw) / 1_000_000
                      const ownerShort = owner ? `${owner.slice(0, 6)}...${owner.slice(-4)}` : 'Unknown'

                      return (
                        <div key={`${url}-${index}`} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
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
                              Owner: {ownerShort} · Paywall: {paywallUSDC} USDC
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </MagicCard>
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

      <div className="md:hidden">
        {content}
      </div>
    </>
  )
}


