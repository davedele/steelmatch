import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Starter",
    price: "$99",
    period: "/month",
    description: "Perfect for small contractors and fabricators",
    features: [
      "Up to 50 searches per month",
      "Basic supplier matching",
      "Email support",
      "Standard delivery tracking",
      "Basic market insights",
    ],
  },
  {
    name: "Professional",
    price: "$299",
    period: "/month",
    description: "For growing businesses and project managers",
    features: [
      "Unlimited searches",
      "Advanced AI matching",
      "Priority support",
      "Real-time delivery tracking",
      "Advanced market analytics",
      "Team collaboration tools",
      "Custom reporting",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations with complex needs",
    features: [
      "Everything in Professional",
      "Dedicated account manager",
      "Custom integrations",
      "API access",
      "Volume discounts",
      "SLA guarantees",
      "White-label options",
    ],
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-balance text-4xl font-bold text-foreground md:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="text-balance text-lg text-muted-foreground">Choose the plan that fits your business needs</p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl border bg-card p-8 ${
                plan.popular ? "border-primary shadow-xl ring-2 ring-primary/20" : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-md font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="mb-2 text-2xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-md text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <Button
                className={`mb-6 w-full ${
                  plan.popular ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
                }`}
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
              </Button>

              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-md text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
