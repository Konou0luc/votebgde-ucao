import { useCallback, useRef, type ClipboardEvent, type KeyboardEvent } from 'react'

const LEN = 6

type OtpInputProps = {
  value: string
  onChange: (value: string) => void
  isDark: boolean
  id?: string
  disabled?: boolean
  'aria-label'?: string
}

/**
 * 6 chiffres en 3 + tiret + 3, navigation clavier, collage complet (SMS / e-mail).
 */
export function OtpInput({ value, onChange, isDark, id, disabled, 'aria-label': ariaLabel }: OtpInputProps) {
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

  const boxClass = `flex h-12 w-9 shrink-0 items-center justify-center rounded-xl border text-center text-lg font-semibold tabular-nums outline-none transition sm:h-14 sm:w-10 sm:text-xl ${
    isDark
      ? 'border-slate-600 bg-slate-950 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25'
      : 'border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
  }`

  const dashClass = `select-none px-0.5 text-xl font-light sm:text-2xl ${isDark ? 'text-slate-500' : 'text-slate-400'}`

  return (
    <div className="w-full">
      <div
        id={id}
        className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5"
        onPaste={handlePaste}
        role="group"
        aria-label={ariaLabel ?? 'Code a six chiffres'}
      >
        {[0, 1, 2].map((i) => (
          <input
            key={i}
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
            onPaste={handlePaste}
            className={boxClass}
            aria-label={`Chiffre ${i + 1}`}
          />
        ))}
        <span className={dashClass} aria-hidden>
          –
        </span>
        {[3, 4, 5].map((i) => (
          <input
            key={i}
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
            onPaste={handlePaste}
            className={boxClass}
            aria-label={`Chiffre ${i + 1}`}
          />
        ))}
      </div>
      <p className={`mt-2 text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
        Collez les 6 chiffres en une fois ou saisissez-les de gauche a droite.
      </p>
    </div>
  )
}
