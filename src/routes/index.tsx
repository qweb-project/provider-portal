import { createFileRoute } from '@tanstack/react-router'
import { 
    useState, 
    useMemo
} from 'react'
import { useAccount } from 'wagmi'
import { useThemeContext } from '@/context/ThemeContext'
import { 
    CardHeader, 
    CardTitle, 
    CardContent, 
    CardFooter 
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MagicCard } from '@/components/magicui/magic-card'
import { HyperText } from '@/components/magicui/hyper-text'
import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button'

import { BorderBeam } from '@/components/magicui/border-beam'
import { type RegisterFormData, registerSchema } from '@/types'
import { Meteors } from "@/components/magicui/meteors";
import { ConnectedProfile } from '@/components/connect-wallet'

export const Route = createFileRoute('/')({
  component: Send,
})

function Send() {
  const { theme } = useThemeContext()
  const { address, isConnected } = useAccount()
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [formData, setFormData] = useState<RegisterFormData>({
    mcpServerUrl: '',
    amount: 0.0001
  })
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  
  const validation = useMemo(() => {
    const result = registerSchema.safeParse(formData)
    return {
      isValid: result.success,
      errors: result.success ? {} : result.error
    }
  }, [formData])

  const handleInputChange = (field: keyof RegisterFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    
    // Clear success/error messages when user starts typing again
    if (submitSuccess) {
      setSubmitSuccess(null)
    }
    if (submitError) {
      setSubmitError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setSubmitError(null)
    setSubmitSuccess(null)

    const result = registerSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors = result.error
      setErrors(fieldErrors as Partial<Record<keyof RegisterFormData, string>>)
      return
    }
    
    // Move to step 2 for review
    setCurrentStep(2)
  }

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true)
      localStorage.setItem('mcpServerUrl', formData.mcpServerUrl)
      localStorage.setItem('amount', formData.amount.toString())
      setSubmitSuccess('Website URL registered!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    setCurrentStep(1)
    setSubmitError(null)
    setSubmitSuccess(null)
  }

  const isButtonDisabled = isSubmitting || !validation.isValid || !formData.mcpServerUrl.trim()

  const renderStep1 = () => (
    <div className="max-h-screen min-h-[75vh] min-w-md p-8 flex justify-center items-center flex-row">
      <div className="max-w-2xl min-w-md p-0 space-y-8 w-full md:w-auto h-full">
        {/* Send Signal Card */}
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
                  <HyperText className="text-2xl font-bold" style={{ color: "#ffffff" }}>
                  Enter your website URL
                  </HyperText>
                </div>
                  <p className="ml-10 text-sm text-muted-foreground">
                  Connect wallet and configure your website for monetization
                  </p>
              </CardTitle>
      
            <CardContent className="p-4">
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <div className="relative rounded-md mt-2">
                      <Input 
                        id="mcpServerUrl" 
                        type="url"
                        placeholder="https://qweb.ai"
                        value={formData.mcpServerUrl}
                        onChange={handleInputChange('mcpServerUrl')}
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
                        onChange={handleInputChange('amount')}
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
                  onClick={handleSubmit}
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

  const renderStep2 = () => (
    <div className="max-h-screen min-h-[75vh] min-w-md p-8 flex justify-center items-center flex-row">
      <div className="max-w-2xl min-w-md p-0 space-y-8 w-full md:w-auto h-full">
        {/* Review Card */}
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
                  <HyperText className="text-2xl font-bold" style={{ color: "#ffffff" }}>
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
                      {/* <span className="text-foreground font-medium">Base Sepolia</span> */}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-muted-foreground">Connected Wallet</label>
                    <ConnectedProfile className="w-[20vw] justify-left items-center" hoverable={false} trimAddress={false} trimAddressLength={3} address={address} dropdownOpen={false} setDropdownOpen={() => {}} showChevron={false} />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-muted-foreground">Website URL</label>
                    {/* <div className="p-3 bg-secondary/50 rounded-md"> */}
                      <span className="text-foreground font-medium">{formData.mcpServerUrl}</span>
                    {/* </div> */}
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
                  <InteractiveHoverButton 
                    className="flex-1" 
                    onClick={handleBack}
                    // variant="outline"
                  >
                    <HyperText className="text-foreground text-md font-bold">
                      Back
                    </HyperText>
                  </InteractiveHoverButton>
                  
                  <InteractiveHoverButton 
                    className="flex-1" 
                    disabled={isSubmitting}
                    onClick={handleFinalSubmit}
                  >
                    <HyperText className="text-foreground text-md font-bold">
                      {isSubmitting ? 'Processing...' : 'Confirm'}
                    </HyperText>
                  </InteractiveHoverButton>
                </div>
                
                {submitError && (
                  <div className="text-sm text-red-500 text-center">
                    Error: {submitError}
                  </div>
                )}
                
                {submitSuccess && (
                  <div className="text-sm text-green-500 text-center">
                    {submitSuccess}
                  </div>
                )}
              </div>
            </CardFooter>
          </MagicCard>
          </div>
      </div>
    </div>
  )

  const formContent = currentStep === 1 ? renderStep1() : renderStep2()
  
  return (
    <>
      <div className="hidden md:block">
      <Meteors number={30} />
          {formContent}

      </div>

      <div className="md:hidden">
        {formContent}
      </div>
      
    </>
  )
} 