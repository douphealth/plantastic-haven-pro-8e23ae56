import { useState } from "react";
import { Droplets, Sun, Thermometer, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import plantMonstera from "@/assets/plant-monstera.jpg";
import plantFiddle from "@/assets/plant-fiddle.jpg";
import plantSnake from "@/assets/plant-snake.jpg";
import plantPothos from "@/assets/plant-pothos.jpg";

const plants = [
  { id: 1, name: "Monstera Deliciosa", nickname: "Monty", image: plantMonstera, health: 92, waterIn: "2 days", light: "Bright indirect", temp: "18-27°C", lastWatered: "3 days ago" },
  { id: 2, name: "Fiddle Leaf Fig", nickname: "Figgy", image: plantFiddle, health: 78, waterIn: "Tomorrow", light: "Bright indirect", temp: "16-24°C", lastWatered: "5 days ago" },
  { id: 3, name: "Snake Plant", nickname: "Snakey", image: plantSnake, health: 98, waterIn: "6 days", light: "Low to bright", temp: "15-30°C", lastWatered: "1 week ago" },
  { id: 4, name: "Golden Pothos", nickname: "Goldie", image: plantPothos, health: 85, waterIn: "3 days", light: "Low to medium", temp: "18-30°C", lastWatered: "4 days ago" },
];

const healthColor = (health: number) => {
  if (health >= 90) return "text-primary";
  if (health >= 70) return "text-secondary";
  return "text-bloom";
};

const PlantShelf = () => {
  const [selectedPlant, setSelectedPlant] = useState(plants[0]);

  return (
    <section id="plants" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Interactive Demo
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Your <span className="text-primary">Plant Shelf</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Track every plant with smart care schedules, health scores, and growth insights.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4">
            {plants.map((plant) => (
              <button
                key={plant.id}
                onClick={() => setSelectedPlant(plant)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 text-left ${
                  selectedPlant.id === plant.id
                    ? "bg-card shadow-elevated border-2 border-primary"
                    : "bg-card/50 shadow-card border-2 border-transparent hover:border-border"
                }`}
              >
                <img src={plant.image} alt={plant.name} width={56} height={56} loading="lazy" className="w-14 h-14 rounded-lg object-cover" />
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-card-foreground truncate">{plant.nickname}</div>
                  <div className="text-xs text-muted-foreground truncate">{plant.name}</div>
                  <div className={`text-xs font-bold ${healthColor(plant.health)}`}>{plant.health}% healthy</div>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2 bg-card rounded-2xl shadow-elevated p-8 border border-border">
            <div className="flex flex-col sm:flex-row gap-6">
              <img src={selectedPlant.image} alt={selectedPlant.name} width={200} height={200} loading="lazy" className="w-48 h-48 rounded-2xl object-cover shadow-card" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-heading text-2xl font-bold text-card-foreground">{selectedPlant.nickname}</h3>
                  <Heart className="w-5 h-5 text-bloom" />
                </div>
                <p className="text-muted-foreground text-sm italic mb-4">{selectedPlant.name}</p>

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Health Score</span>
                    <span className={`font-bold ${healthColor(selectedPlant.health)}`}>{selectedPlant.health}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${selectedPlant.health}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: Droplets, label: "Water in", value: selectedPlant.waterIn, color: "text-sky" },
                    { icon: Sun, label: "Light", value: selectedPlant.light, color: "text-secondary" },
                    { icon: Thermometer, label: "Temp", value: selectedPlant.temp, color: "text-bloom" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-3 rounded-xl bg-muted/50">
                      <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                      <div className="text-sm font-semibold text-card-foreground">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button asChild variant="hero" className="flex-1 rounded-xl">
                <Link to="/register">Start Tracking Plants</Link>
              </Button>
              <Button asChild variant="heroOutline" className="flex-1 rounded-xl">
                <Link to="/register">Try AI Scanner</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlantShelf;
