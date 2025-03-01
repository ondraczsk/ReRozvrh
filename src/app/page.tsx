import dynamic from "next/dynamic";

const KosTimetableComponent = dynamic(
  () => import("@/app/pages/main"),
  { ssr: false }
);

export default function KosTimetablePage() {
  return <KosTimetableComponent />;
}
