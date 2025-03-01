// pages/nastaveni/page.tsx (nebo kdekoliv, odkud importujete SettingsPage)
import dynamic from "next/dynamic";

const SettingsPageComponent = dynamic(
  () => import("@/app/pages/settings"),
  { ssr: false }
);

export default function SettingsPage() {
  return <SettingsPageComponent />;
}
