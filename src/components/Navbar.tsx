import { Link, useLocation } from "react-router-dom";
import { Network, Activity } from "lucide-react";
import { Button } from "./ui/button";

const Navbar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/how-it-works", label: "How It Works" },
    { path: "/research", label: "Research" },
    { path: "/architecture", label: "Architecture" },
    { path: "/topology", label: "Network Topology" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/anomaly", label: "ML Detection" },
    { path: "/fuzzy", label: "Fuzzy Logic" },
    { path: "/expert", label: "Expert System" },
    { path: "/predictive", label: "Predictions" },
    { path: "/security", label: "Security" },
    { path: "/remediation", label: "Remediation" },
    { path: "/reports", label: "Reports" },
    { path: "/analytics", label: "Analytics" },
    { path: "/demo", label: "Demo Control" },
  ];

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Network className="h-8 w-8 text-primary transition-smooth group-hover:scale-110" />
              <Activity className="h-4 w-4 text-secondary absolute -bottom-1 -right-1 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground">NetOptimAI</span>
              <span className="text-xs text-muted-foreground">Adrian Kenya Limited</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? "default" : "ghost"}
                asChild
                className="transition-smooth"
              >
                <Link to={item.path}>{item.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
