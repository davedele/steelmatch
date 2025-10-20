const stats = [
  { value: "10,000+", label: "Steel Products" },
  { value: "500+", label: "Verified Suppliers" },
  { value: "98%", label: "Match Accuracy" },
  { value: "24/7", label: "AI Support" },
]

export function Stats() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-2 text-5xl font-bold text-primary">{stat.value}</div>
              <div className="text-md text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
