"use client"

import React from "react"
import Image from "next/image"
import { motion } from "framer-motion"

type LogoItem = {
  src?: string
  alt: string
}

export function LogoMarquee({
  items,
  direction = "right",
  speed = "normal",
  height = 64,
}: {
  items: LogoItem[]
  direction?: "left" | "right"
  speed?: "slow" | "normal" | "fast"
  height?: number
}) {
  const duration = speed === "fast" ? 25 : speed === "normal" ? 40 : 55
  const dir = direction === "left" ? -1 : 1

  // Deduplicate logos by src (fallback to alt)
  const uniqueItems = Array.from(
    new Map((items || []).map((i) => [(i.src && i.src.trim()) || i.alt, i])).values()
  )

  return (
    <div className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-transparent to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-transparent to-transparent z-10" />
      <motion.div
        className="flex gap-8 sm:gap-10 items-center will-change-transform py-2"
        animate={{ x: [0, dir * -1000] }}
        transition={{ repeat: Infinity, ease: "linear", duration }}
      >
        {[...uniqueItems, ...uniqueItems].map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-center min-w-[120px] sm:min-w-[140px] px-4`}
            style={{ height }}
          >
            {item.src ? (
              // Using next/image for optimization; layout set via sizes
              <Image
                src={item.src}
                alt={item.alt}
                width={height * 2}
                height={height}
                className="h-full max-h-full w-auto object-contain"
              />
            ) : (
              <span className="text-sm text-gray-600 truncate">{item.alt}</span>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
