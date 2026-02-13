import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'onboarding_completed'

export function useOnboarding() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done) {
      const timer = setTimeout(() => setIsOpen(true), 500)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [])

  const next = useCallback(() => {
    setStep((s) => s + 1)
  }, [])

  const prev = useCallback(() => {
    setStep((s) => Math.max(0, s - 1))
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setStep(0)
    localStorage.setItem(STORAGE_KEY, '1')
  }, [])

  const reopen = useCallback(() => {
    setStep(0)
    setIsOpen(true)
  }, [])

  return { isOpen, step, next, prev, close, reopen }
}
