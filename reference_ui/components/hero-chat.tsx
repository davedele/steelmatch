"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, Send, MapPin, Calendar, DollarSign } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"

const messages = [
  {
    role: "user",
    content: "I need 500 tons of A36 structural steel beams for a bridge project in Texas",
  },
  {
    role: "assistant",
    content:
      "I found 3 suppliers with A36 structural steel beams available in Texas. The best match is Southwest Steel with 600 tons in stock, delivery in 5-7 days, and competitive pricing at $850/ton.",
  },
]

export function HeroChat() {
  const [visibleMessages, setVisibleMessages] = useState<number>(0)
  const [timeFrame, setTimeFrame] = useState([180]) // days
  const [amount, setAmount] = useState([50000]) // dollars

  useEffect(() => {
    const timer = setTimeout(() => {
      if (visibleMessages < messages.length) {
        setVisibleMessages(visibleMessages + 1)
      }
    }, [visibleMessages])
    return () => clearTimeout(timer)
  }, [visibleMessages])

  const formatTimeFrame = (days: number) => {
    if (days < 30) return `${days} days`
    if (days < 365) return `${Math.round(days / 30)} months`
    return `${Math.round(days / 365)} year${days >= 730 ? "s" : ""}`
  }

  return (
    <section className="relative overflow-hidden pt-32 pb-20">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-balance text-5xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Find the perfect steel match in seconds
          </h1>

          <p className="mb-12 text-balance text-lg text-muted-foreground md:text-xl">
            AI-powered platform that instantly connects you with the right steel suppliers, grades, and quantities for
            your project
          </p>

          {/* Chat Interface Demo */}
          <div className="mx-auto mb-6 max-w-2xl rounded-2xl border border-border bg-card shadow-2xl">
            <div className="mb-4 flex items-center gap-2 border-b border-border px-6 pt-6 pb-4">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-md font-medium text-foreground">Steel Match AI</span>
            </div>

            <div className="space-y-4 px-6 pb-4 min-h-[200px]">
              {messages.slice(0, visibleMessages).map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-left text-md leading-relaxed ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {visibleMessages < messages.length && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/60" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/60 [animation-delay:0.2s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/60 [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border p-4">
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Describe your steel requirements..."
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 text-md placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled
                  />
                </div>
                <Button size="icon" className="h-9 w-9 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mb-12">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <MapPin className="h-4 w-4" />
                  Location
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium text-md">Select Location</h4>
                  <input
                    type="text"
                    placeholder="Enter city, state, or zip code"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-md placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Calendar className="h-4 w-4" />
                  Time Frame
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-md">Delivery Time Frame</h4>
                      <span className="text-md text-muted-foreground">{formatTimeFrame(timeFrame[0])}</span>
                    </div>
                    <Slider
                      value={timeFrame}
                      onValueChange={setTimeFrame}
                      min={1}
                      max={365}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 day</span>
                      <span>1 year</span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <DollarSign className="h-4 w-4" />
                  Amount
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-md">Budget Range</h4>
                      <span className="text-md text-muted-foreground">${amount[0].toLocaleString()}</span>
                    </div>
                    <Slider
                      value={amount}
                      onValueChange={setAmount}
                      min={1000}
                      max={1000000}
                      step={1000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$1K</span>
                      <span>$1M</span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </section>
  )
}
