"use client"

import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"

interface TopUpButtonsProps {
  denominations: number[]
}

export function TopUpButtons({ denominations }: TopUpButtonsProps) {
  const handleClick = () => {
    alert("（Stripe連携は次フェーズで実装します）")
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {denominations.map((amount) => (
        <Button
          key={amount}
          variant="outline"
          size="lg"
          onClick={handleClick}
          type="button"
        >
          {formatPrice(amount)}
        </Button>
      ))}
    </div>
  )
}
