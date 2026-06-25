import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import { cookies } from "next/headers";
import { Providers } from "@/components/shared/Providers";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RxPro - Prescription Management System",
  description: "Modern prescription management platform for healthcare providers",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieRecords = cookieStore.getAll();

  return (
    <html
      lang="en"
      className={`${rubik.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers cookies={cookieRecords}>{children}</Providers>
      </body>
    </html>
  );
}
