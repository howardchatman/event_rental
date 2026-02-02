const steps = [
  {
    number: "01",
    title: "Browse & Select",
    description:
      "Explore our curated collection online. Filter by category, check real-time availability for your event dates, and add items to your wishlist.",
  },
  {
    number: "02",
    title: "Reserve & Pay",
    description:
      "Secure your selections with a deposit. We hold your items for your dates — no double bookings, no surprises. Pay securely online.",
  },
  {
    number: "03",
    title: "We Deliver & Style",
    description:
      "Our team delivers, sets up, and styles every piece at your venue. After the celebration, we handle the pickup. You just enjoy the day.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-charcoal py-20 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-2 font-body text-sm uppercase tracking-[0.2em] text-champagne-light">
            Simple Process
          </p>
          <h2 className="text-4xl font-light sm:text-5xl">How It Works</h2>
        </div>

        <div className="grid gap-12 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <span className="mb-4 inline-block font-body text-5xl font-extralight text-champagne/40">
                {step.number}
              </span>
              <h3 className="mb-3 text-2xl font-light">{step.title}</h3>
              <p className="font-body text-sm leading-relaxed text-white/60">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="mx-auto h-px w-16 bg-champagne/40" />
          <p className="mt-6 font-body text-sm text-white/50">
            Questions? We&apos;re here to help plan every detail.
          </p>
        </div>
      </div>
    </section>
  );
}
