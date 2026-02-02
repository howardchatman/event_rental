const testimonials = [
  {
    quote:
      "Lolita made our wedding day absolutely magical. Every chair, every linen was exactly what we envisioned. The setup was flawless.",
    name: "Ashley & Marcus",
    event: "Garden Wedding, June 2025",
  },
  {
    quote:
      "Working with Lolita Harris Rentals was the best decision we made. The gold chiavari chairs and arch transformed our venue. Guests couldn't stop complimenting the decor.",
    name: "Brianna & James",
    event: "Ballroom Reception, September 2025",
  },
  {
    quote:
      "From browsing online to the final pickup, the whole experience was seamless. The quality of the rentals is unmatched — everything looked brand new.",
    name: "Nicole & David",
    event: "Estate Wedding, October 2025",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-ivory-dark py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-2 font-body text-sm uppercase tracking-[0.2em] text-champagne">
            Kind Words
          </p>
          <h2 className="text-4xl font-light text-charcoal sm:text-5xl">
            From Our Couples
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-md"
            >
              <div className="mb-4 text-3xl text-champagne/40">&ldquo;</div>
              <blockquote className="mb-6 font-body text-sm leading-relaxed text-charcoal-light">
                {t.quote}
              </blockquote>
              <div className="border-t border-ivory-dark pt-4">
                <p className="font-body text-sm font-semibold text-charcoal">
                  {t.name}
                </p>
                <p className="font-body text-xs text-warm-gray">{t.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
