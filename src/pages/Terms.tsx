import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <main className="flex-grow pt-24 pb-16">
      <article className="container mx-auto px-4 max-w-2xl space-y-5 text-sm leading-relaxed text-muted-foreground">
        <h1 className="font-heading text-4xl font-bold text-foreground">Terms</h1>
        <p>
          PlantasticHaven Pro is a plant-care workspace. The free quiz and guides are rule-based checklists. They are not a lab test, veterinary diagnosis, or medical advice.
        </p>
        <p>
          Pro is a one-time payment of $7.99 through Stripe for access to the current saved-garden, calendar, identifier, and lesson-progress features while this service is operating. It is not a promise that every future feature will be included, and it is not a subscription.
        </p>
        <p>
          A full refund or a lost dispute removes Pro access. Access can also be removed if a payment is reversed. The plant identifier is capped at about 25 requests per purchase per UTC day, and its answers can be wrong.
        </p>
        <p>
          Garden data is stored in your browser, so keep a backup from Settings. You are responsible for checking a plant yourself before you prune, spray, or repot it.
        </p>
        <p>
          <Link to="/" className="text-primary">Back home</Link>
        </p>
      </article>
    </main>
    <Footer />
  </div>
);

export default Terms;
