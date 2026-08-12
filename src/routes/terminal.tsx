import { createFileRoute } from "@tanstack/react-router";
import { Desk } from "@/components/terminal/Desk";

export const Route = createFileRoute("/terminal")({
  head: () => ({
    meta: [
      { title: "Aurora Desk — EUR/USD ICT Terminal" },
      {
        name: "description",
        content:
          "Institutional EUR/USD tape reader using Inner Circle Trader concepts: market structure, liquidity, fair value gaps, order blocks, killzones, SMT and the 2022 model.",
      },
      { property: "og:title", content: "Aurora Desk — EUR/USD ICT Terminal" },
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
