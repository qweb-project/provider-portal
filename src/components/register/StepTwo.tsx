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
import { ConnectedProfile } from '@/components/connect-wallet'
import { type RegisterFormData } from '@/types'

type Props = {
  currentStep: 1 | 2
  address?: `0x${string}` | undefined
  formData: RegisterFormData
  onBack: () => void
  onConfirm: () => void
  isSubmitting: boolean
  submitError: string | null
  submitSuccess: string | null
}

export function StepTwo({ currentStep, address, formData, onBack, onConfirm, isSubmitting, submitError, submitSuccess }: Props) {
  const { theme } = useThemeContext()

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
            <CardTitle>
              <div className="flex flex-row items-center justify-left gap-2">
                <h1 className="px-3 py-1 text-2xl font-bold bg-primary/30 text-center items-center justify-center rounded-md">2</h1>
                <HyperText key={`step2-title-${currentStep}`} className="text-2xl font-bold">
                  Review Configuration
                </HyperText>
              </div>
              <p className="ml-10 text-sm text-muted-foreground">
                Please review your configuration before proceeding
              </p>
            </CardTitle>
            <CardContent className="p-4">
              <div className="grid gap-6">
                <div className="grid gap-10">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-muted-foreground">Chain</label>
                    <div className="p-3 items-center justify-left flex flex-row">
                      <img src="/base.png" alt="Base Sepolia" className="w-24 h-full" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-muted-foreground">Connected Wallet</label>
                    <ConnectedProfile className="w-[20vw] justify-left items-center" hoverable={false} trimAddress={true} trimAddressLength={18} address={address} dropdownOpen={false} setDropdownOpen={() => {}} showChevron={false} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-muted-foreground">Website URL</label>
                    <span className="text-foreground font-medium">{formData.mcpServerUrl}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-muted-foreground">Paywall (USDC)</label>
                    <span className="text-foreground font-medium">{formData.amount}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 mt-10 justify-center border-t border-border [.border-t]:pt-4">
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex justify-between w-full">
                  <InteractiveHoverButton className="flex-1" onClick={onBack}>
                    <HyperText className="text-foreground text-md font-bold">
                      Back
                    </HyperText>
                  </InteractiveHoverButton>
                  <InteractiveHoverButton className="flex-1" disabled={isSubmitting} onClick={onConfirm}>
                    <HyperText className="text-foreground text-md font-bold">
                      {isSubmitting ? 'Processing...' : 'Confirm'}
                    </HyperText>
                  </InteractiveHoverButton>
                </div>
                {submitError && (
                  <div className="text-sm text-red-500 text-center">Error: {submitError}</div>
                )}
                {submitSuccess && (
                  <div className="text-sm text-green-500 text-center">{submitSuccess}</div>
                )}
              </div>
            </CardFooter>
          </MagicCard>
        </div>
      </div>
    </div>
  )
}


