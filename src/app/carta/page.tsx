import type { Metadata } from "next";
import MenuView from "@/components/menu/MenuView";

export const metadata: Metadata = {
  title: "Carta",
  description:
    "La carta de Super Bowling Medellín: cortes a la parrilla, sushi rolls, okonomiyaki, pizzas de masa madre, coctelería de autor y más. Cocina salvaje, premium.",
};

export default function CartaPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          Cocina & bar
        </p>
        <h1 className="font-display mt-3 text-5xl font-black text-cream sm:text-7xl">
          La <span className="text-shine">carta</span>
        </h1>
        <p className="mt-4 text-muted">
          Cocina de Asia y parrilla, ahumados de leña, sushi de autor y coctelería ritual.
        </p>
      </header>

      <MenuView />
    </div>
  );
}
