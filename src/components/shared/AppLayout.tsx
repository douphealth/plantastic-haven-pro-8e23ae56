import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logoLeaf from "@/assets/logo-leaf.png";
import {
  LayoutDashboard, Leaf, Calendar, Scan, MessageCircle, Settings, LogOut, Menu, X, Mail
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/my-garden", label: "My Garden", icon: Leaf },
  { to: "/care-calendar", label: "Care Calendar", icon: Calendar },
  { to: "/plant-identifier", label: "AI Scanner", icon: Scan },
  { to: "/email-sequences", label: "Care Sequences", icon: Mail },
  { to: "/community", label: "Community", icon: MessageCircle },
  { to: "/settings", label: "Settings", icon: Settings },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full bg-card border-r border-border ${mobile ? "w-64" : "w-64 hidden lg:flex"}`}>
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoLeaf} alt="PlantasticHaven" className="w-8 h-8" />
          <span className="font-heading text-lg font-bold text-foreground">
            Plantastic<span className="text-primary">Haven</span>
          </span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border">
        <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full transition-colors">
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 h-full">
            <Sidebar mobile />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between h-14 px-4 border-b border-border bg-card">
          <button onClick={() => setSidebarOpen(true)} className="text-foreground">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-heading text-lg font-bold text-foreground">
            Plantastic<span className="text-primary">Haven</span>
          </span>
          <div className="w-6" />
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
