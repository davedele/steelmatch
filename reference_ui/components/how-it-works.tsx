import { MessageSquare, Search, FileCheck, Truck } from "lucide-react"

const steps = [
  {
    icon: MessageSquare,
    title: "Describe Your Needs",
    description: "Tell our AI what steel you need in plain English - grade, quantity, location, and timeline",
  },
  {
    icon: Search,
    title: "AI Finds Matches",
    description: "Our AI instantly searches thousands of suppliers and finds the best matches for your requirements",
  },
  {
    icon: FileCheck,
    title: "Compare & Select",
    description: "Review quotes, compare pricing, check certifications, and select your preferred supplier",
  },
  {
    icon: Truck,
    title: "Track Delivery",
    description: "Monitor your order status and delivery in real-time through our integrated platform",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-balance text-4xl font-bold text-foreground md:text-5xl">How it works</h2>
          <p className="text-balance text-lg text-muted-foreground">From search to delivery in four simple steps</p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <div className="mb-2 text-md font-semibold text-primary">Step {index + 1}</div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="text-md leading-relaxed text-muted-foreground">{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="absolute right-0 top-8 hidden h-0.5 w-full bg-gradient-to-r from-primary to-transparent lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
