import type { Metadata } from 'next';
import '@fontsource/noto-sans-bengali/400.css';
import '@fontsource/noto-sans-bengali/500.css';
import '@fontsource/noto-sans-bengali/600.css';
import '@fontsource/noto-sans-bengali/700.css';
import '../styles/app.css';

export const metadata: Metadata = {
  title: 'উদ্যোগ (UDYOG) — আবেদন ফরম ও PDF জেনারেটর | বাংলাদেশ ব্যাংক',
  description:
    'বাংলাদেশ ব্যাংকের উদ্যোগ (UDYOG): উপজেলাভিত্তিক তরুণ উদ্যোক্তা অনুসন্ধান, চিহ্নিতকরণ ও অর্থায়ন কর্মসূচির ৭ পৃষ্ঠার অফিসিয়াল আবেদন ফরম পূরণ ও PDF ডাউনলোড অ্যাপ।',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
