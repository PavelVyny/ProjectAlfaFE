import { Navigation } from "@/components/Navigation";
import { MainSection } from "@/components/MainSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-900">
      <Navigation />
      <MainSection />
    </div>
  );
}
