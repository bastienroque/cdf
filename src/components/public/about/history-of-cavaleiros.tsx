import {
  HistorySection,
  type HistoryChapter,
} from "@/components/public/about/history-section";

const CHAPTERS: HistoryChapter[] = [
  { key: "legend", paragraphs: ["intro"] },
  {
    key: "order",
    paragraphs: ["confrerie", "notTitles", "whoTheyAre"],
    pullquote: "notTitles",
  },
  { key: "quest", paragraphs: ["theirJourney", "theirTasting"] },
  { key: "soul", paragraphs: ["francesinhaSoul"] },
  { key: "mission", paragraphs: ["theirMission"] },
];

export default function HistoryOfCavaleiros() {
  return (
    <HistorySection
      namespace="public.about.cavaleiros"
      title="Cavaleiros"
      dropCapSrc="/assets/letter-c.svg"
      chapters={CHAPTERS}
      priority
    />
  );
}
