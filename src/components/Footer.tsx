import logoLeaf from "@/assets/logo-leaf.png";

const Footer = () => {
  const links = {
    Product: ["Features", "Pricing", "Pro", "Download"],
    Learn: ["Care Guides", "Courses", "Blog", "Plant of the Week"],
    Community: ["Forums", "Events", "Plant Swaps", "Expert Network"],
    Company: ["About", "Careers", "Press", "Contact"],
  };

  return (
    <footer className="bg-foreground text-primary-foreground/80 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src={logoLeaf} alt="PlantasticHaven" width={28} height={28} className="w-7 h-7" />
              <span className="font-heading text-lg font-bold text-primary-foreground">
                PlantasticHaven
              </span>
            </div>
            <p className="text-sm text-primary-foreground/50 leading-relaxed">
              Your AI-powered plant intelligence platform. Identify, diagnose, design, and grow.
            </p>
          </div>
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-semibold text-primary-foreground text-sm mb-4">{category}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/40">© 2026 PlantasticHaven. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-primary-foreground/40">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
