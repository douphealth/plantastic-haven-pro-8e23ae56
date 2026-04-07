import { useState } from "react";
import { Button } from "@/components/ui/button";
import logoLeaf from "@/assets/logo-leaf.png";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "My Plants", href: "#plants" },
    { label: "Pricing", href: "#pricing" },
    { label: "Community", href: "#community" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass shadow-card">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <a href="#" className="flex items-center gap-2">
          <img src={logoLeaf} alt="PlantasticHaven" width={32} height={32} className="w-8 h-8" />
          <span className="font-heading text-xl font-bold text-foreground">
            Plantastic<span className="text-primary">Haven</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a href="/login"><Button variant="ghost" size="sm">Sign In</Button></a>
          <a href="/register"><Button variant="hero" size="sm">Start Free</Button></a>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden glass border-t border-border px-4 pb-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block py-3 text-sm font-medium text-muted-foreground hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-3 pt-3">
            <a href="/login" className="flex-1"><Button variant="ghost" size="sm" className="w-full">Sign In</Button></a>
            <a href="/register" className="flex-1"><Button variant="hero" size="sm" className="w-full">Start Free</Button></a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
