import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata = {
  title: {
    default: "GlobeTrotter — Personalized Travel Planning",
    template: "%s · GlobeTrotter",
  },
  description:
    "Dream, design, and organize multi-city trips with ease. Build itineraries, estimate budgets, discover cities and activities, and share your journeys.",
  keywords: ["travel", "itinerary", "trip planner", "budget", "GlobeTrotter"],
};

export const viewport = {
  themeColor: "#14a89f",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
