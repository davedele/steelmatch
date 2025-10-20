import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Steel Match Pro" width={40} height={40} className="rounded-lg" />
          <span className="text-xl font-semibold text-foreground">Steel Match Pro</span>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-md text-muted-foreground transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#how-it-works" className="text-md text-muted-foreground transition-colors hover:text-foreground">
            How It Works
          </a>
          <a href="#pricing" className="text-md text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            Log in
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  )
}
