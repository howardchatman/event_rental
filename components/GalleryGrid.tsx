const images = [
  {
    src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
    alt: "Elegant outdoor wedding reception",
    span: "col-span-2 row-span-2",
  },
  {
    src: "/couple_image.png",
    alt: "Happy couple at wedding event",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    alt: "Linen-draped table setting",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80",
    alt: "Floral arch at sunset ceremony",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
    alt: "Intimate garden dinner setup",
    span: "",
  },
  {
    src: "/bride_image.png",
    alt: "Bride at elegant event",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&q=80",
    alt: "Wedding venue with draping",
    span: "col-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&q=80",
    alt: "Rustic reception table",
    span: "",
  },
];

export default function GalleryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 text-center">
        <p className="mb-2 font-body text-sm uppercase tracking-[0.2em] text-champagne">
          Real Events
        </p>
        <h2 className="text-4xl font-light text-charcoal sm:text-5xl">
          From Our Gallery
        </h2>
      </div>

      <div className="grid auto-rows-[200px] grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <div
            key={i}
            className={`group relative overflow-hidden ${img.span}`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url('${img.src}')` }}
            />
            <div className="absolute inset-0 bg-charcoal/0 transition-colors duration-300 group-hover:bg-charcoal/20" />
          </div>
        ))}
      </div>
    </section>
  );
}
