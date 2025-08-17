import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple hostname sanitizer: removes protocol, leading www., ports, paths, and trims whitespace
export function sanitizeHostname(input: string): string {
  if (!input) return ''
  let value = String(input).trim().toLowerCase()

  // Remove protocol
  value = value.replace(/^https?:\/\//i, '')

  // If input still looks like a URL, try to parse and extract hostname
  try {
    const maybeUrl = new URL(`http://${value}`)
    value = maybeUrl.hostname + (maybeUrl.port ? `:${maybeUrl.port}` : '')
  } catch {
    // Fallback: strip everything after first slash
    const slashIndex = value.indexOf('/')
    if (slashIndex !== -1) {
      value = value.slice(0, slashIndex)
    }
  }

  // Remove leading www.
  value = value.replace(/^www\./, '')

  // Remove port if present; contract/storage likely expects bare hostname
  const colonIndex = value.indexOf(':')
  if (colonIndex !== -1) {
    value = value.slice(0, colonIndex)
  }

  // Remove trailing dot
  value = value.replace(/\.$/, '')

  return value
}

// Basic domain validation: labels 1-63, no leading/trailing hyphen, at least one dot, TLD 2-63 letters
export function isValidDomain(hostname: string): boolean {
  if (!hostname) return false
  const value = hostname.trim().toLowerCase()
  const domainRegex = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/
  return domainRegex.test(value)
}
