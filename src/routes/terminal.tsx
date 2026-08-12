import { createFileRoute } from "@tanstack/react-router";
import { Desk } from "@/components/terminal/Desk";

export const Route = createFileRoute("/terminal")({
  head: () => ({
    meta: [
      { title: "ICT Desk — EUR/USD" },
      {
        name: "description",
        content:
          "EUR/USD tape reader using Inner Circle Trader concepts: market structure, liquidity, fair value gaps, order blocks, killzones, SMT and the 2022 model.",
      },
      { property: "og:title", content: "ICT Desk — EUR/USD" },
      {
        property: "og:description",
        content:
          "Live multi-timeframe ICT read of EUR/USD with confluence-scored delivery paths.",
      },
    ],
  }),
  component: TerminalPage,
});

function TerminalPage() {
  return <Desk />;
}
