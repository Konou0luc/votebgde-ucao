import { useCallback, useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { useSiteTheme } from './site-theme'

const LEN = 6

type OtpInputProps = {
  value: string
  onChange: (value: string) => void
  isDark?: boolean // Optionnel car on utilise useSiteTheme maintenant
  id?: string
  disabled?: boolean
  'aria-label'?: string
}

/**
 * Entrée OTP à 6 chiffres ultra-fluide avec animations Framer Motion.
 */
export function OtpInput({ value, onChange, isDark: isDarkProp, id, disabled, 'aria-label': ariaLabel }: OtpInputProps) {
  const { theme } = useSiteTheme()
  const isDark = isDarkProp ?? theme === 'dark'
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  const digits = Array.from({ length: LEN }, (_, i) => value[i] ?? '')

  const setFromString = useCallback(
    (raw: string) => {
      const only = raw.replace(/\D/g, '').slice(0, LEN)
      onChange(only)
      const nextFocus = Math.min(Math.max(only.length - 1, 0), LEN - 1)
      requestAnimationFrame(() => inputsRef.current[nextFocus]?.focus())
    },
    [onChange],
  )

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    const text = event.clipboardData.getData('text/plain')
    setFromString(text)
  }

  function handleFocus(index: number) {
    if (index > value.length) {
      requestAnimationFrame(() => inputsRef.current[value.length]?.focus())
    }
  }

  function handleChange(index: number, inputValue: string) {
    const digitsOnly = inputValue.replace(/\D/g, '')

    if (digitsOnly.length > 1) {
      setFromString(digitsOnly)
      return
    }

    if (digitsOnly.length === 0) {
      const next = value.slice(0, index) + value.slice(index + 1)
      onChange(next)
      return
    }

    let next: string
    if (index < value.length) {
      next = (value.slice(0, index) + digitsOnly + value.slice(index + 1)).slice(0, LEN)
    } else if (index === value.length) {
      next = (value + digitsOnly).slice(0, LEN)
    } else {
      return
    }

    onChange(next)
    if (digitsOnly && index < LEN - 1) {
      requestAnimationFrame(() => inputsRef.current[index + 1]?.focus())
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        event.preventDefault()
        const next = value.slice(0, index - 1) + value.slice(index)
        onChange(next)
        inputsRef.current[index - 1]?.focus()
      }
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      inputsRef.current[index - 1]?.focus()
    }
    if (event.key === 'ArrowRight' && index < LEN - 1) {
      event.preventDefault()
      inputsRef.current[index + 1]?.focus()
    }
  }

  const boxBaseClass = `relative flex h-14 w-11 shrink-0 items-center justify-center rounded-2xl border-2 text-center text-2xl font-bold tabular-nums outline-none transition-all duration-200 sm:h-16 sm:w-12 sm:text-3xl`

  const getBoxClass = (index: number) => {
    const isFocused = typeof document !== 'undefined' && document.activeElement === inputsRef.current[index]
    const hasValue = digits[index] !== ''

    if (isDark) {
      return `${boxBaseClass} ${
        isFocused
          ? 'border-blue-500 bg-blue-500/10 ring-4 ring-blue-500/20 text-white'
          : hasValue
            ? 'border-slate-700 bg-slate-800 text-white'
            : 'border-slate-800 bg-slate-900/50 text-slate-400'
      }`
    }

    return `${boxBaseClass} ${
      isFocused
        ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-600/10 text-slate-950'
        : hasValue
          ? 'border-slate-200 bg-white text-slate-950 shadow-sm'
          : 'border-slate-100 bg-slate-50/50 text-slate-400'
    }`
  }

  return (
    <div className="w-full">
      <div
        id={id}
        className="flex items-center justify-center gap-2 sm:gap-3"
        onPaste={handlePaste}
        role="group"
        aria-label={ariaLabel ?? 'Code à six chiffres'}
      >
        <div className="flex gap-2 sm:gap-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{
                scale: digits[i] ? 1.05 : 1,
                y: digits[i] ? -2 : 0
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative"
            >
              <input
                ref={(el) => {
                  inputsRef.current[i] = el
                }}
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                maxLength={i === 0 ? 6 : 1}
                disabled={disabled}
                value={digits[i]}
                onFocus={() => handleFocus(i)}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={getBoxClass(i)}
                aria-label={`Chiffre ${i + 1}`}
              />
              {value.length === i && !disabled && (
                <motion.div
                  layoutId="otp-cursor"
                  className="absolute bottom-3 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-blue-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
          ))}
        </div>

        <div className={`h-1 w-2 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

        <div className="flex gap-2 sm:gap-3">
          {[3, 4, 5].map((i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{
                scale: digits[i] ? 1.05 : 1,
                y: digits[i] ? -2 : 0
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative"
            >
              <input
                ref={(el) => {
                  inputsRef.current[i] = el
                }}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={1}
                disabled={disabled}
                value={digits[i]}
                onFocus={() => handleFocus(i)}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={getBoxClass(i)}
                aria-label={`Chiffre ${i + 1}`}
              />
              {value.length === i && !disabled && (
                <motion.div
                  layoutId="otp-cursor"
                  className="absolute bottom-3 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-blue-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
      <p className={`mt-6 text-center text-xs font-medium tracking-wide uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        Sécurisé par VoteBGDE Cloud
      </p>
    </div>
  )
}
