import { useCallback, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react'
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
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

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

  const boxBaseClass = `relative flex h-13 w-10 shrink-0 items-center justify-center rounded-xl border text-center font-mono text-xl font-medium tabular-nums outline-none transition-[border-color,box-shadow,background-color] duration-200 sm:h-14 sm:w-12 sm:text-2xl`

  const getBoxClass = (index: number) => {
    const isFocused = focusedIndex === index
    const hasValue = digits[index] !== ''

    if (isDark) {
      return `${boxBaseClass} ${
        isFocused
          ? 'border-brand-400 bg-brand-400/[0.08] ring-4 ring-brand-400/20 text-white'
          : hasValue
            ? 'border-white/20 bg-white/[0.06] text-white'
            : 'border-white/10 bg-white/[0.02] text-slate-400'
      }`
    }

    return `${boxBaseClass} ${
      isFocused
        ? 'border-brand-500 bg-white ring-4 ring-brand-500/15 text-slate-950'
        : hasValue
          ? 'border-slate-300 bg-white text-slate-950 shadow-soft'
          : 'border-slate-200 bg-slate-50 text-slate-400'
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
                scale: digits[i] ? 1.03 : 1,
                y: digits[i] ? -1 : 0
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
                onFocus={() => {
                  setFocusedIndex(i)
                  handleFocus(i)
                }}
                onBlur={() => setFocusedIndex((cur) => (cur === i ? null : cur))}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={getBoxClass(i)}
                aria-label={`Chiffre ${i + 1}`}
              />
              {value.length === i && !disabled && (
                <motion.div
                  layoutId="otp-cursor"
                  className="absolute bottom-2.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-brand-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
          ))}
        </div>

        <div aria-hidden className={`h-px w-3 ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />

        <div className="flex gap-2 sm:gap-3">
          {[3, 4, 5].map((i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{
                scale: digits[i] ? 1.03 : 1,
                y: digits[i] ? -1 : 0
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
                onFocus={() => {
                  setFocusedIndex(i)
                  handleFocus(i)
                }}
                onBlur={() => setFocusedIndex((cur) => (cur === i ? null : cur))}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={getBoxClass(i)}
                aria-label={`Chiffre ${i + 1}`}
              />
              {value.length === i && !disabled && (
                <motion.div
                  layoutId="otp-cursor"
                  className="absolute bottom-2.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-brand-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
      <p className={`mt-5 text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        Vous pouvez coller le code directement.
      </p>
    </div>
  )
}
