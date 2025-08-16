import { useThemeContext } from '@/context/ThemeContext'
import { MagicCard } from '@/components/magicui/magic-card'
import { BorderBeam } from '@/components/magicui/border-beam'
import { Button } from '@/components/Button'
import { DotPattern } from './magicui/dot-pattern'
import { cn } from '@/lib/utils'
type WebsiteCardProps = {
  url: string
  owner?: string
  paywallUSDC?: number
  onDelete?: (url: string) => void
  isDeleting?: boolean
}

function getHostname(inputUrl: string): string {
  try {
    const parsed = new URL(inputUrl)
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return inputUrl
  }
}

function shortenAddress(address?: string): string | undefined {
  if (!address) return undefined
  if (address.length <= 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function WebsiteCard({ url, owner, paywallUSDC, onDelete, isDeleting = false }: WebsiteCardProps) {
  const { theme } = useThemeContext()
  const hostname = getHostname(url)
  const ownerShort = shortenAddress(owner)

  return (
    <div className="relative">
      <BorderBeam colorFrom={theme === 'dark' ? 'hsl(var(--primary))' : 'hsl(var(--primary))'} />
      <MagicCard
        gradientColor={theme === 'dark' ? 'hsl(var(--primary))' : 'hsl(var(--primary))'}
        className="p-4 rounded-xl min-h-[20vh] border-1 border-primary/40 hover:border-primary transition-colors h-full"
        gradientOpacity={0.15}
        gradientSize={50}
      >
        <DotPattern
        className={cn(
          "[mask-image:radial-gradient(150px_circle_at_right,white,transparent)] min-h-[15vh]",
        )}
      />
        <div className="flex flex-col gap-3 h-full">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
            title={url}
          >
            {hostname}
          </a>

          <div className="text-sm text-muted-foreground">
            {ownerShort ? `Owner: ${ownerShort}` : 'Owner: Unknown'}
          </div>

          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="text-sm text-muted-foreground">
              Paywall: {typeof paywallUSDC === 'number' ? paywallUSDC : 0} USDC
            </span>
          </div>
            <div className="flex items-center gap-2 mt-5 justify-end z-40">
              {onDelete ? (
                <Button className="z-50" size="sm" variant="destructive" onClick={() => onDelete(url)}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              ) : null}
            </div>
        </div>
      </MagicCard>
    </div>
  )
}

