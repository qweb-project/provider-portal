import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { 
    useState, 
    useMemo,
    useEffect
} from 'react'
import { useEvmAddress } from '@coinbase/cdp-hooks'
import { type RegisterFormData, registerSchema } from '@/types'
import { Meteors } from "@/components/magicui/meteors";
import { StepOne } from '@/components/register/StepOne'
import { StepTwo } from '@/components/register/StepTwo'
import { websiteRegistryAbi, websiteRegistryAddress } from '@/lib/contracts'
import { 
    type BaseError,
    useAccount, 
    useWriteContract,
    useWaitForTransactionReceipt,
    useChainId, 
    useSwitchChain 
} from 'wagmi'
import { baseSepolia } from 'wagmi/chains'

export const Route = createFileRoute('/register')({
  component: Send,
})

function Send() {
  const navigate = useNavigate()
  const { evmAddress: address } = useEvmAddress()
  const { isConnected, address: wagmiAddress } = useAccount()
  const chainId = useChainId()
  const { switchChainAsync } = useSwitchChain()
  const { writeContract, data: hash, error: writeError, isPending: isWritePending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: receiptError } = useWaitForTransactionReceipt({ hash })
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
    const raw = e.target.value
    const nextValue = field === 'amount' ? (raw === '' ? 0 : Number(raw)) : raw
    setFormData(prev => ({ ...prev, [field]: nextValue } as RegisterFormData))
    
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
    if (!isConnected) {
      setSubmitError('Please connect your wallet to continue')
      return
    }

    const connectedAddress = (wagmiAddress || address) as `0x${string}` | undefined
    if (!connectedAddress) {
      setSubmitError('Wallet address not available')
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError(null)
      setSubmitSuccess(null)
      console.log('chainId', chainId)
      if (chainId !== baseSepolia.id) {
        await switchChainAsync({ chainId: baseSepolia.id })
      }

      // Convert USDC amount (6 decimals) to integer units
      const paywallUnits = BigInt(Math.round(formData.amount * 1_000_000))

      console.log('Writing contract with:', {
        mcpServerUrl: formData.mcpServerUrl,
        connectedAddress,
        contractAddress: websiteRegistryAddress,
        paywallUnits: paywallUnits.toString()
      })

      writeContract({
        abi: websiteRegistryAbi,
        address: websiteRegistryAddress,
        functionName: 'registerWebsite',
        args: [formData.mcpServerUrl, connectedAddress, paywallUnits],
      })
    } catch (err) {
      console.error('Error in handleFinalSubmit:', err)
      const message = (err as BaseError)?.shortMessage || (err instanceof Error ? err.message : 'Unknown error')
      setSubmitError(message)
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    setCurrentStep(1)
    setSubmitError(null)
    setSubmitSuccess(null)
  }

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      console.log('Transaction confirmed!')
      localStorage.setItem('mcpServerUrl', formData.mcpServerUrl)
      localStorage.setItem('amount', formData.amount.toString())
      setSubmitSuccess('Website URL registered!')
      setIsSubmitting(false)
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate({ to: '/dashboard' })
      }, 2000)
    }
  }, [isConfirmed, formData.mcpServerUrl, formData.amount, navigate])

  // Handle errors
  useEffect(() => {
    if (writeError || receiptError) {
      console.log('Transaction error:', { writeError, receiptError })
      const message = (writeError as BaseError)?.shortMessage 
        || (receiptError as BaseError)?.shortMessage 
        || (writeError as Error)?.message 
        || (receiptError as Error)?.message 
        || 'Transaction failed'
      setSubmitError(message)
      setIsSubmitting(false)
    }
  }, [writeError, receiptError])

  // Debug logging
  useEffect(() => {
    if (hash) {
      console.log('Transaction hash:', hash)
    }
  }, [hash])

  useEffect(() => {
    if (isConfirming) {
      console.log('Transaction confirming...')
    }
  }, [isConfirming])

  const isButtonDisabled = isSubmitting || isWritePending || isConfirming || !validation.isValid || !formData.mcpServerUrl.trim()

  const formContent = currentStep === 1 ? (
    <StepOne
      currentStep={currentStep}
      formData={formData}
      errors={errors}
      onInputChange={handleInputChange}
      onNext={handleSubmit}
      isButtonDisabled={isButtonDisabled}
    />
  ) : (
    <StepTwo
      currentStep={currentStep}
      address={address ?? undefined}
      formData={formData}
      onBack={handleBack}
      onConfirm={handleFinalSubmit}
      isSubmitting={isSubmitting}
      submitError={submitError}
      submitSuccess={submitSuccess}
    />
  )
  
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