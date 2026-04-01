'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface BrowserMockupProps {
  src: string
  alt: string
  className?: string
  rotateY?: number
  priority?: boolean
}

export function BrowserMockup({
  src,
  alt,
  className,
  rotateY = -5,
  priority = false,
}: BrowserMockupProps) {
  return (
    <div style={{ perspective: '1200px' }} className={cn('w-full', className)}>
      <motion.div
        animate={{ rotateY, rotateX: 2 }}
        whileHover={{ rotateY: 0, rotateX: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ transformStyle: 'preserve-3d' }}
        className="rounded-xl overflow-hidden bg-[#1C1C1E] border border-white/[0.06] shadow-[0_30px_80px_rgba(0,0,0,0.7),0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]"
      >
        {/* Title bar */}
        <div className="flex items-center gap-1.5 px-3.5 py-3 bg-[#2A2A2C] border-b border-white/[0.05]">
          <span className="w-3 h-3 rounded-full bg-[#FF5F57] flex-shrink-0" aria-hidden="true" />
          <span className="w-3 h-3 rounded-full bg-[#FFBD2E] flex-shrink-0" aria-hidden="true" />
          <span className="w-3 h-3 rounded-full bg-[#28C840] flex-shrink-0" aria-hidden="true" />
          <div className="flex-1 mx-2 bg-white/[0.05] rounded text-[10px] text-white/25 text-center py-[3px] px-2 truncate select-none">
            alfa-kurs.ru
          </div>
        </div>
        {/* Screen */}
        <div className="relative aspect-[4/3] bg-[#F5F5F7] overflow-hidden">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-top"
            priority={priority}
          />
        </div>
      </motion.div>
    </div>
  )
}
