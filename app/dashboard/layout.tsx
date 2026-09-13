import ThemeRegistry from "./ThemeRegistry";

export const metadata = {
  title: "Dashboard — Websity",
};

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeRegistry>{children}</ThemeRegistry>;
}
