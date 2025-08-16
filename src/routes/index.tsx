import { createFileRoute } from '@tanstack/react-router'
import { 
    useState, 
    useMemo
} from 'react'
import { useEvmAddress } from '@coinbase/cdp-hooks'
import { type RegisterFormData, registerSchema } from '@/types'
import { Meteors } from "@/components/magicui/meteors";
import { StepOne } from '@/components/register/StepOne'
import { StepTwo } from '@/components/register/StepTwo'

export const Route = createFileRoute('/')({
  component: Send,
})

function Send() {
  const { evmAddress: address } = useEvmAddress()
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