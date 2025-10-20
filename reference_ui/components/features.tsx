import { Search, Zap, Shield, TrendingUp, Users, Clock } from "lucide-react"

const features = [
  {
    icon: Search,
    title: "AI-Powered Search",
    description: "Natural language search that understands your steel requirements and finds exact matches instantly",
  },
  {
    icon: Zap,
    title: "Instant Quotes",
    description: "Get real-time pricing from multiple suppliers and compare options in seconds",
  },
  {
    icon: Shield,
    title: "Verified Suppliers",
    description: "All suppliers are pre-vetted and certified to ensure quality and reliability",
  },
  {
    icon: TrendingUp,
    title: "Market Insights",
    description: "Access real-time market data and pricing trends to make informed decisions",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share quotes, track orders, and collaborate with your team in one platform",
  },
  {
    icon: Clock,
    title: "Fast Delivery",
    description: "Track delivery times and optimize logistics with our integrated supply chain",
  },
]

export function Features() {
  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-balance text-4xl font-bold text-foreground md:text-5xl">
            Everything you need to procure steel
          </h2>
          <p className="text-balance text-lg text-muted-foreground">
            Powerful features that streamline your steel procurement process from search to delivery
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">{feature.title}</h3>
              <p className="leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
