import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-12 text-center">
          <h2 className="mb-4 text-balance text-4xl font-bold text-foreground md:text-5xl">
            Ready to transform your steel procurement?
          </h2>
          <p className="mb-8 text-balance text-lg text-muted-foreground">
            Join thousands of contractors and fabricators who save time and money with Steel Match Pro
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
