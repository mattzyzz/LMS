'use client'

import { useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'

// Each layer's parallax depth coefficient — higher = moves more
const LAYERS = [
  { src: '/parallax-main.png',   depth: 0,    zIndex: 1 },
  { src: '/parallax-1.png',      depth: 0.018, zIndex: 2 },
  { src: '/parallax-2.png',      depth: 0.030, zIndex: 3 },
  { src: '/parallax-3.png',      depth: 0.042, zIndex: 4 },
  { src: '/parallax-4.png',      depth: 0.055, zIndex: 5 },
  { src: '/parallax-5.png',      depth: 0.065, zIndex: 6 },
  { src: '/parallax-6.png',      depth: 0.075, zIndex: 7 },
  { src: '/parallax-cursor.png', depth: 0.090, zIndex: 8 },
]

export function ParallaxIllustration() {
  const containerRef = useRef<HTMLDivElement>(null)
  const layerRefs   = useRef<(HTMLDivElement | null)[]>([])
  const rafRef      = useRef<number | null>(null)
  const target      = useRef({ x: 0, y: 0 })
  const current     = useRef({ x: 0, y: 0 })
  const isActive    = useRef(false)

  // rAF loop — smooth spring-like lerp toward target
  const loop = useCallback(() => {
    const dx = target.current.x - current.current.x
    const dy = target.current.y - current.current.y

    current.current.x += dx * 0.08
    current.current.y += dy * 0.08

    LAYERS.forEach(({ depth }, i) => {
      const el = layerRefs.current[i]
      if (!el || depth === 0) return
      const tx = current.current.x * depth
      const ty = current.current.y * depth
      el.style.transform = `translate(${tx}px, ${ty}px)`
    })

    // Keep looping if we haven't settled
    if (isActive.current || Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
      rafRef.current = requestAnimationFrame(loop)
    } else {
      rafRef.current = null
    }
  }, [])

  const startLoop = useCallback(() => {
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(loop)
    }
  }, [loop])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    target.current.x = (e.clientX - rect.left - rect.width  / 2)
    target.current.y = (e.clientY - rect.top  - rect.height / 2)
    startLoop()
  }, [startLoop])

  const handleMouseEnter = useCallback(() => {
    isActive.current = true
  }, [])

  const handleMouseLeave = useCallback(() => {
    isActive.current = false
    target.current   = { x: 0, y: 0 }
    startLoop()
  }, [startLoop])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none"
      style={{ aspectRatio: '783 / 818' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-hidden="true"
    >
      {LAYERS.map(({ src, depth, zIndex }, i) => (
        <div
          key={src}
          ref={el => { layerRefs.current[i] = el }}
          className="absolute inset-0"
          style={{
            zIndex,
            willChange: depth > 0 ? 'transform' : undefined,
          }}
        >
          <Image
            src={src}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
            priority={i === 0}
            draggable={false}
          />
        </div>
      ))}
    </div>
  )
}
