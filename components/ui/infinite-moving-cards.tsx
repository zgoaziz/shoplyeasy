"use client"

import React from "react"
import { motion } from "framer-motion"

type Item = {
  quote: string
  name: string
  title?: string
}

export function InfiniteMovingCards({
  items,
  direction = "right",
  speed = "slow",
}: {
  items: Item[]
  direction?: "left" | "right"
  speed?: "slow" | "normal" | "fast"
}) {
  const duration = speed === "fast" ? 20 : speed === "normal" ? 35 : 50
  const dir = direction === "left" ? -1 : 1

  return (
    <div className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent z-10" />
      <motion.div
        className="flex gap-6 sm:gap-8 will-change-transform"
        animate={{ x: [0, dir * -1000] }}
        transition={{ repeat: Infinity, ease: "linear", duration }}
      >
        {[...items, ...items].map((item, idx) => (
          <div
            key={idx}
            className="min-w-[280px] sm:min-w-[340px] max-w-[360px] bg-white rounded-xl border border-gold/20 shadow-sm p-5 sm:p-6"
          >
            <div className="text-sm sm:text-base text-gray-700 mb-3">{item.quote}</div>
            <div className="text-navy font-semibold">{item.name}</div>
            {item.title ? (
              <div className="text-xs text-gray-500">{item.title}</div>
            ) : null}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
