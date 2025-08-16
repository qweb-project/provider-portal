import { useState } from 'react'
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton'
import { useEvmAddress } from '@coinbase/cdp-hooks'
import { ConnectedProfile } from './ConnectedProfile'

export function ConnectWallet() {
  const { evmAddress: address } = useEvmAddress()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  if (address) {
    return (
      <ConnectedProfile 
        address={address ?? undefined} 
        dropdownOpen={dropdownOpen} 
        setDropdownOpen={setDropdownOpen} 
      />
    )
  }
  
  return <AuthButton />
} 