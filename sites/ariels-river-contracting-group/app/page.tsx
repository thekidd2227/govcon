import { NavBar } from "./components/NavBar";
import { Footer } from "./components/Footer";
import { Hero } from "./sections/Hero";
import { Overview } from "./sections/Overview";
import { Capabilities } from "./sections/Capabilities";
import { Differentiators } from "./sections/Differentiators";
import { Certifications } from "./sections/Certifications";
import { VendorInfo } from "./sections/VendorInfo";
import { Naics } from "./sections/Naics";
import { PastPerformance } from "./sections/PastPerformance";
import { FinalCta } from "./sections/FinalCta";

export default function HomePage() {
  return (
    <>
      <NavBar />
      <main className="flex-1">
        <Hero />
        <Overview />
        <Capabilities />
        <Differentiators />
        <Certifications />
        <VendorInfo />
        <Naics />
        <PastPerformance />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
