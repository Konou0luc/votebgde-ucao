import { useEffect, useRef } from 'react'

type Particle = { x: number; y: number; vx: number; vy: number; r: number; tw: number; red: boolean }

type ParticleFieldProps = {
  className?: string
  /** Nombre de px² par particule — plus grand = moins de particules */
  density?: number
  maxParticles?: number
  /** Distance maximale (px CSS) pour relier deux particules */
  linkDistance?: number
  /** Interaction avec le curseur */
  interactive?: boolean
  /** Force une teinte claire (ex. sur une photo sombre) */
  forceDark?: boolean
}

// Couleurs UCAO : bleu #2E3A8C et rouge bordeaux #841F27 (variantes claires en thème sombre)
const PALETTE = {
  light: { blue: '45, 58, 141', red: '130, 33, 39' },
  dark: { blue: '146, 157, 214', red: '169, 51, 61' },
}

function isDarkTheme() {
  return document.documentElement.classList.contains('dark')
}

/**
 * Champ de particules lumineuses reliées par des lignes fines.
 * - Canvas 2D, DPR plafonné à 2, densité adaptée à la surface.
 * - Mis en pause hors écran et quand l'onglet est masqué.
 * - Respecte prefers-reduced-motion (une seule frame statique).
 */
export function ParticleField({
  className = '',
  density = 14000,
  maxParticles = 90,
  linkDistance = 130,
  interactive = true,
  forceDark = false,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0
    let particles: Particle[] = []
    let raf = 0
    let running = false
    let visible = true
    let dark = forceDark || isDarkTheme()
    const pointer = { x: -9999, y: -9999, active: false }

    function seed() {
      const target = Math.min(maxParticles, Math.round((width * height) / density))
      particles = Array.from({ length: target }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.6,
        tw: Math.random() * Math.PI * 2,
        red: Math.random() < 0.28,
      }))
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas!.width = Math.round(width * dpr)
      canvas!.height = Math.round(height * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
      if (!running) draw(0)
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, width, height)
      const pal = dark ? PALETTE.dark : PALETTE.light
      const lineRGB = pal.blue
      const baseAlpha = dark ? 0.75 : 0.5
      const maxD2 = linkDistance * linkDistance

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        if (!reduceMotion) {
          p.x += p.vx
          p.y += p.vy
          if (p.x < -10) p.x = width + 10
          else if (p.x > width + 10) p.x = -10
          if (p.y < -10) p.y = height + 10
          else if (p.y > height + 10) p.y = -10

          if (pointer.active) {
            const dx = p.x - pointer.x
            const dy = p.y - pointer.y
            const d2 = dx * dx + dy * dy
            if (d2 < 14400 && d2 > 0.01) {
              const f = (1 - d2 / 14400) * 0.6
              const d = Math.sqrt(d2)
              p.x += (dx / d) * f
              p.y += (dy / d) * f
            }
          }
        }

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]
          const dx = p.x - q.x
          const dy = p.y - q.y
          const d2 = dx * dx + dy * dy
          if (d2 < maxD2) {
            const a = (1 - d2 / maxD2) * (dark ? 0.2 : 0.14)
            ctx!.strokeStyle = `rgba(${lineRGB}, ${a})`
            ctx!.lineWidth = 0.6
            ctx!.beginPath()
            ctx!.moveTo(p.x, p.y)
            ctx!.lineTo(q.x, q.y)
            ctx!.stroke()
          }
        }

        if (pointer.active) {
          const dx = p.x - pointer.x
          const dy = p.y - pointer.y
          const d2 = dx * dx + dy * dy
          const r2 = maxD2 * 1.4
          if (d2 < r2) {
            ctx!.strokeStyle = `rgba(${pal.red}, ${(1 - d2 / r2) * 0.35})`
            ctx!.lineWidth = 0.7
            ctx!.beginPath()
            ctx!.moveTo(p.x, p.y)
            ctx!.lineTo(pointer.x, pointer.y)
            ctx!.stroke()
          }
        }
      }

      for (const p of particles) {
        const twinkle = reduceMotion ? 1 : 0.65 + Math.sin(t * 0.0015 + p.tw) * 0.35
        const a = baseAlpha * twinkle
        const dotRGB = p.red ? pal.red : pal.blue
        // halo
        ctx!.fillStyle = `rgba(${dotRGB}, ${a * 0.18})`
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r * 3.2, 0, Math.PI * 2)
        ctx!.fill()
        // cœur
        ctx!.fillStyle = `rgba(${dotRGB}, ${a})`
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fill()
      }
    }

    function loop(t: number) {
      draw(t)
      raf = requestAnimationFrame(loop)
    }

    function start() {
      if (running || reduceMotion || !visible || document.hidden) return
      running = true
      raf = requestAnimationFrame(loop)
    }

    function stop() {
      running = false
      cancelAnimationFrame(raf)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
      else stop()
    })
    io.observe(canvas)

    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVisibility)

    const themeObserver = new MutationObserver(() => {
      dark = forceDark || isDarkTheme()
      if (!running) draw(0)
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      pointer.active = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height
      pointer.x = x
      pointer.y = y
    }
    const onPointerLeave = () => {
      pointer.active = false
    }
    if (interactive && !reduceMotion) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      document.addEventListener('pointerleave', onPointerLeave)
    }

    start()

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      themeObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [density, maxParticles, linkDistance, interactive, forceDark])

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none block h-full w-full ${className}`} />
}
