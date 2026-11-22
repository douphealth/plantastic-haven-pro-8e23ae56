import { Link } from "react-router-dom";
import { Mail, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/shared/AppLayout";

// The shared discussion board depended on the retired hosted database. Pro data now
// lives on each device, so there is no public board. Questions go to the editors.
const Community = () => (
  <AppLayout>
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-heading text-3xl font-bold text-foreground">Ask a plant question</h1>
      <div className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-4">
        <p className="text-muted-foreground">
          There is no public discussion board. Send your question, ideally with a photo, and the
          PlantasticHaven editors will reply by email.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="hero" className="rounded-xl">
            <a href="mailto:info@plantastichaven.com?subject=Plant%20question">
              <Mail className="w-4 h-4 mr-2" /> Email a question
            </a>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/guides">
              <BookOpen className="w-4 h-4 mr-2" /> Browse care guides
            </Link>
          </Button>
        </div>
      </div>
    </div>
  </AppLayout>
);

export default Community;
