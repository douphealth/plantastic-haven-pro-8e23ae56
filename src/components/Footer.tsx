import { forwardRef } from "react";
import { Link } from "react-router-dom";
import logoLeaf from "@/assets/logo-leaf.png";

const Footer = forwardRef<HTMLElement>((_, ref) => {
  const links = {
    "Care Assistant": [
      { label: "Home Page", href: "/" },
      { label: "Diagnose Plant", href: "/diagnose" },
      { label: "My Care Plan", href: "/care-plan" },
      { label: "Free PDF Generator", href: "/free-pdf" },
    ],
    "Care Guides": [
      { label: "Plant Guides Hub", href: "/guides" },
      { label: "Watering Science", href: "/guides?article=survival-guide&day=0" },
      { label: "Light Engineering", href: "/guides?article=survival-guide&day=1" },
      { label: "Soil Architecture", href: "/guides?article=survival-guide&day=2" },
    ],
    "Support & Legal": [
      { label: "Terms of Service", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  };

  return (
    <footer ref={ref} className="bg-foreground text-primary-foreground/80 py-12 border-t border-border mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <img src={logoLeaf} alt="PlantasticHaven" width={28} height={28} className="w-7 h-7" />
              <span className="font-heading text-lg font-bold text-primary-foreground">
                Plantastic<span className="text-primary">Haven</span>
              </span>
            </Link>
            <p className="text-sm text-primary-foreground/50 leading-relaxed max-w-xs">
              No signups, no paywalls. Instant diagnostic care plans and premium downloadable PDF guides for indoor plant enthusiasts.
            </p>
          </div>
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-semibold text-primary-foreground text-sm mb-3">{category}</h4>
              <ul className="space-y-1.5">
                {items.map((item) => (
                  <li key={item.label}>
                    {item.href.startsWith("#") ? (
                      <a href={item.href} className="text-sm text-primary-foreground/55 hover:text-primary transition-colors duration-150">
                        {item.label}
                      </a>
                    ) : (
                      <Link to={item.href} className="text-sm text-primary-foreground/55 hover:text-primary transition-colors duration-150">
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-primary-foreground/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-foreground/40">© 2026 PlantasticHaven. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
