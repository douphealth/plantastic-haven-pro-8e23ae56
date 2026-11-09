import { Quote } from "lucide-react";

const notes = [
  {
    title: "Free quiz",
    text: "Seven questions produce a checklist from your answers. It stays in this browser.",
  },
  {
    title: "No invented reviews",
    text: "This product does not show star ratings or customer quotes unless they come from a real source.",
  },
  {
    title: "Optional Pro",
    text: "A one-time payment unlocks a saved garden, calendar, and plant identifier.",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            How the tools differ
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            What you can <span className="text-primary">actually use</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {notes.map((note) => (
            <div key={note.title} className="bg-card rounded-2xl p-6 shadow-card border border-border">
              <Quote className="w-8 h-8 text-primary/20 mb-4" />
              <h3 className="font-semibold text-sm text-card-foreground mb-2">{note.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{note.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
