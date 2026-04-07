import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    role: "Urban Gardener",
    text: "PlantasticHaven saved my fiddle leaf fig! The AI diagnosed root rot before it was too late. Worth every penny.",
    rating: 5,
  },
  {
    name: "James K.",
    role: "Landscape Designer",
    text: "I use the care calendar daily for my 40+ client gardens. The analytics dashboard alone saves me hours each week.",
    rating: 5,
  },
  {
    name: "Priya R.",
    role: "Plant Hobbyist",
    text: "Started with the free tier and upgraded within a week. The AI plant identifier is incredibly accurate — it even identified my rare calathea variety!",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Loved by Plant Parents
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Real Stories, Real <span className="text-primary">Growth</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-elevated transition-all">
              <Quote className="w-8 h-8 text-primary/20 mb-4" />
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed italic">"{t.text}"</p>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
              </div>
              <div className="font-semibold text-sm text-card-foreground">{t.name}</div>
              <div className="text-xs text-muted-foreground">{t.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
