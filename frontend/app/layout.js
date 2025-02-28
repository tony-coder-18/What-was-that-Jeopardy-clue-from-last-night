import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react"
import Footer from "./footer.js";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "What was that Jeopardy clue?",
  description: "Web app to know what was the jeopardy clue (from last night) you're trying to refer to.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col justify-between pt-24 min-h-dvh color-gray-900`}
      >
        {children}
        <Footer />
        <Analytics/>
      </body>
    </html>
  );
}
