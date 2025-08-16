import { useThemeContext } from '@/context/ThemeContext'
import { 
  CardTitle, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MagicCard } from '@/components/magicui/magic-card'
import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button'
import { BorderBeam } from '@/components/magicui/border-beam'
import { HyperText } from '@/components/magicui/hyper-text'
import { type RegisterFormData } from '@/types'

type Props = {
  currentStep: 1 | 2
  formData: RegisterFormData
  errors: Partial<Record<keyof RegisterFormData, string>>
  onInputChange: (field: keyof RegisterFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onNext: (e: React.FormEvent) => void
  isButtonDisabled: boolean
}

export function StepOne({ currentStep, formData, errors, onInputChange, onNext, isButtonDisabled }: Props) {
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
                <h1 className="px-3 py-1 text-2xl font-bold bg-primary/30 text-center items-center justify-center rounded-md">1</h1>
                <HyperText key={`step1-title-${currentStep}`} className="text-2xl font-bold">
                  Enter your website URL
                </HyperText>
              </div>
              <p className="ml-10 text-sm text-muted-foreground">
                Connect wallet and configure your website for monetization
              </p>
            </CardTitle>
            <CardContent className="p-4">
              <form onSubmit={onNext}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <div className="relative rounded-md mt-2">
                      <Input 
                        id="mcpServerUrl" 
                        type="url"
                        placeholder="https://qweb.ai"
                        value={formData.mcpServerUrl}
                        onChange={onInputChange('mcpServerUrl')}
                        className={errors.mcpServerUrl ? 'border-red-500 mt-2' : 'mt-2'}
                      />
                    </div>
                    {errors.mcpServerUrl && (
                      <span className="text-sm text-red-500">{errors.mcpServerUrl}</span>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <div className="relative rounded-md mt-2">
                      <label className="text-sm font-medium text-muted-foreground">Paywall (USDC)</label>
                      <Input 
                        id="amount" 
                        type="number"
                        placeholder="0.0001"
                        value={formData.amount}
                        onChange={onInputChange('amount')}
                        className={errors.amount ? 'border-red-500 mt-2' : 'mt-2'}
                      />
                    </div>
                    {errors.amount && (
                      <span className="text-sm text-red-500">{errors.amount}</span>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="p-4 justify-center border-t border-border [.border-t]:pt-4">
              <div className="flex flex-col items-center gap-4 w-full">
                <InteractiveHoverButton 
                  className="min-w-[25vw]" 
                  disabled={isButtonDisabled}
                  onClick={onNext}
                  type="submit"
                >
                  <HyperText className="text-foreground text-md font-bold">
                    Next
                  </HyperText>
                </InteractiveHoverButton>
                {errors.mcpServerUrl && (
                  <div className="text-sm text-red-500 text-center">
                    Error: {errors.mcpServerUrl}
                  </div>
                )}
              </div>
            </CardFooter>
          </MagicCard>
        </div>
      </div>
    </div>
  )
}


