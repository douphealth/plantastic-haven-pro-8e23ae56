import { useState } from "react";
import { Button } from "@/components/ui/button";
import logoLeaf from "@/assets/logo-leaf.png";
import { Menu, X, Leaf } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Diagnose", href: "/diagnose" },
    { label: "Care Plan", href: "/care-plan" },
    { label: "Free PDF", href: "/free-pdf" },
    { label: "Plant Guides", href: "/guides" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass shadow-card">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoLeaf} alt="PlantasticHaven" width={32} height={32} className="w-8 h-8 animate-float" />
          <span className="font-heading text-xl font-bold text-foreground">
            Plantastic<span className="text-primary">Haven</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`text-sm font-semibold transition-colors duration-200 relative py-1 ${
                isActive(link.href)
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button 
            variant="hero" 
            size="sm"
            asChild
            className="cursor-pointer shadow-sm rounded-xl font-bold bg-primary text-white hover:bg-primary/95 hover:scale-[1.02] transition-all"
          >
            <Link to="/diagnose">
              Diagnose My Plant <Leaf className="w-4 h-4 ml-1.5 inline" />
            </Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground p-1 hover:bg-accent rounded-lg"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Links */}
      {isOpen && (
        <div className="md:hidden glass border-t border-border px-4 py-4 space-y-3 shadow-elevated">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`block py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${
                isActive(link.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border">
            <Button 
              variant="hero" 
              size="sm" 
              asChild
              className="w-full cursor-pointer font-bold justify-center rounded-xl"
              onClick={() => setIsOpen(false)}
            >
              <Link to="/diagnose">
                Diagnose My Plant <Leaf className="w-4 h-4 ml-1.5 inline" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
