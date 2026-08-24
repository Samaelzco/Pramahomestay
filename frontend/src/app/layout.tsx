import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Prama Homestay",
    template: "%s · Prama Homestay",
  },
  description: "Manajemen operasional Prama Homestay.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" data-locale="id" data-theme="light" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <head>
        <meta name="theme-color" content="#f9f9f9" />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var r=document.documentElement,k="prama-theme",s=localStorage.getItem(k),t=s==="light"||s==="dark"?s:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light",l=localStorage.getItem("prama-locale")==="en"?"en":"id";r.setAttribute("data-theme",t);r.setAttribute("data-locale",l);r.lang=l;r.style.colorScheme=t;document.cookie="prama-locale="+l+"; path=/; max-age=31536000; samesite=lax";var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=t==="dark"?"#111313":"#f9f9f9"}catch(e){}})()` }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
