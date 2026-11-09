import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <main className="flex-grow pt-24 pb-16">
      <article className="container mx-auto px-4 max-w-2xl space-y-5 text-sm leading-relaxed text-muted-foreground">
        <h1 className="font-heading text-4xl font-bold text-foreground">Privacy</h1>
        <p>
          This page describes what this application actually stores. It is not a substitute for advice about your local privacy law.
        </p>
        <h2 className="font-heading text-xl font-semibold text-foreground">Free tools</h2>
        <p>
          The diagnosis, care plan, and PDF stay in this browser under the key <code>plantastichaven_care_plan</code>. Clearing site data removes them. The free PDF flow does not collect an email address.
        </p>
        <h2 className="font-heading text-xl font-semibold text-foreground">Accounts</h2>
        <p>
          Creating an account stores your email and display name with Supabase Auth. Pro garden plants, journal notes, lesson progress, and community posts are stored in the project database. Your own profile is readable by your signed-in session. Display names shown beside community posts come from a limited lookup that hides values containing an @ sign.
        </p>
        <h2 className="font-heading text-xl font-semibold text-foreground">Payments</h2>
        <p>
          Checkout is handled by Stripe. Card numbers are not stored by this app. A completed payment can set your account to Pro. A full refund or an open dispute can set it back to free.
        </p>
        <h2 className="font-heading text-xl font-semibold text-foreground">Plant identifier</h2>
        <p>
          If you use the Pro identifier, the description and optional photo you submit are sent to the AI provider configured on the server. Photos are not written into the garden unless you save a plant yourself.
        </p>
        <p>
          <Link to="/" className="text-primary">Back home</Link>
        </p>
      </article>
    </main>
    <Footer />
  </div>
);

export default Privacy;
