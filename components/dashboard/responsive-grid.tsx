"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface ResponsiveGridProps {
  children: React.ReactNode
  minColumnWidth?: number
  maxColumns?: number
  gap?: number
  className?: string
}

export function ResponsiveGrid({
  children,
  minColumnWidth = 300,
  maxColumns = 6,
  gap = 24,
  className = "",
}: ResponsiveGridProps) {
  const [columns, setColumns] = useState(1)

  useEffect(() => {
    const calculateColumns = () => {
      const containerWidth = window.innerWidth - 64 // Account for padding
      const availableWidth = containerWidth - gap * (maxColumns - 1)
      const possibleColumns = Math.floor(availableWidth / minColumnWidth)
      const optimalColumns = Math.min(possibleColumns, maxColumns)
      setColumns(Math.max(1, optimalColumns))
    }

    calculateColumns()
    window.addEventListener("resize", calculateColumns)
    return () => window.removeEventListener("resize", calculateColumns)
  }, [minColumnWidth, maxColumns, gap])

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap}px`,
  }

  return (
    <div style={gridStyle} className={className}>
      {children}
    </div>
  )
}
