import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Articly - Convert Google Docs to HTML",
  description: "Convert Google Docs articles into clean HTML and downloadable images in one click. Built with Next.js. Developed by Mark(Muhammad Ahmed Raza).",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <div>
          <Toaster position="top-right" reverseOrder={false} />
        </div>
      </body>
    </html>
  );
}
