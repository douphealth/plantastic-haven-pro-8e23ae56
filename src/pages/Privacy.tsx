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
        <h2 className="font-heading text-xl font-semibold text-foreground">Pro workspace</h2>
        <p>
          There are no accounts or passwords. Garden plants, photos you save, journal notes, and lesson progress are stored only in this browser. They are not uploaded. Clearing site data removes them, so use Settings → Back up to keep a copy or move to another device.
        </p>
        <h2 className="font-heading text-xl font-semibold text-foreground">Payments</h2>
        <p>
          Checkout is handled by Stripe. Card numbers are never seen or stored by this app. The email you enter at checkout is kept by Stripe and used to unlock Pro on your devices: a restore link is emailed to that address through our email provider, Brevo. This browser keeps a signed Pro license, which is re-checked with Stripe about twice a day. A full refund or an open or lost dispute removes Pro.
        </p>
        <h2 className="font-heading text-xl font-semibold text-foreground">Plant identifier</h2>
        <p>
          If you use the Pro identifier, the description and optional photo you submit are sent to Cloudflare Workers AI to produce an answer. They are not stored by this app. Photos are saved into your garden, in this browser only, when you save a plant yourself.
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
