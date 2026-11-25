import type { Metadata } from 'next';
import '@fontsource/noto-sans-bengali/400.css';
import '@fontsource/noto-sans-bengali/500.css';
import '@fontsource/noto-sans-bengali/600.css';
import '@fontsource/noto-sans-bengali/700.css';
import '../styles/app.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://udyog-form-fillup.vercel.app'),
  title: 'উদ্যোগ (UDYOG) আবেদন ফরম | বাংলাদেশ ব্যাংক ২০ লাখ টাকা লোন ও অনুদান ফর্ম PDF',
  description:
    'বাংলাদেশ ব্যাংকের উদ্যোগ (UDYOG: Upazila-Driven Youth Opportunity for Growth) কর্মসূচির ৭ পৃষ্ঠার অফিসিয়াল আবেদন ফরম পূরণ ও PDF ডাউনলোড করুন। ২০ লক্ষ টাকা পর্যন্ত ৫০% ঋণ ও ৫০% অনুদান সুবিধা।',
  keywords: [
    'udyog form',
    'udyog full form',
    'upazila driven youth opportunity for growth',
    'bangladesh bank udyog form',
    'বাংলাদেশ ব্যাংক উদ্যোগ আবেদন ফরম',
    'উদ্যোগ প্রকল্প আবেদন ফরম pdf',
    'উদ্যোগ ফরম ২০২৬',
    'udyog loan application bangladesh bank',
    'তরুণ উদ্যোক্তা ২০ লাখ টাকা ঋণ ফরম',
  ],
  authors: [{ name: 'বাংলাদেশ ব্যাংক উদ্যোগ সহায়তা সেল' }],
  creator: 'উদ্যোগ (UDYOG)',
  publisher: 'বাংলাদেশ ব্যাংক',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'উদ্যোগ (UDYOG) আবেদন ফরম — বাংলাদেশ ব্যাংক',
    description:
      'উদ্যোগ (UDYOG: Upazila-Driven Youth Opportunity for Growth) ৭ পৃষ্ঠার অফিসিয়াল A4 আবেদন ফরম পূরণ ও সরাসরি PDF ডাউনলোড করুন।',
    url: 'https://udyog-form-fillup.vercel.app',
    siteName: 'উদ্যোগ (UDYOG) বাংলাদেশ ব্যাংক',
    locale: 'bn_BD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'উদ্যোগ (UDYOG) আবেদন ফরম — বাংলাদেশ ব্যাংক',
    description:
      'উদ্যোগ (Upazila-Driven Youth Opportunity for Growth) ৭ পৃষ্ঠার অফিসিয়াল আবেদন ফরম পূরণ ও ভেক্টর PDF জেনারেটর।',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'GovernmentService',
  name: 'উদ্যোগ (UDYOG) আবেদন ফরম ও কর্মসূচি',
  alternateName: 'Upazila-Driven Youth Opportunity for Growth (UDYOG)',
  serviceType: 'তরুণ উদ্যোক্তা অনুসন্ধান, চিহ্নিতকরণ ও মিশ্র অর্থায়ন কর্মসূচি',
  url: 'https://udyog-form-fillup.vercel.app',
  provider: {
    '@type': 'GovernmentOrganization',
    name: 'বাংলাদেশ ব্যাংক (Bangladesh Bank)',
    url: 'https://www.bb.org.bd',
  },
  description:
    'উদ্যোগ (UDYOG)-এর পূর্ণরূপ হলো "Upazila-Driven Youth Opportunity for Growth"। এটি বাংলাদেশ ব্যাংকের বিশেষ কর্মসূচি যার মাধ্যমে দেশের প্রতিটি উপজেলার ১৮-৩৫ বছর বয়সী যুব উদ্যোক্তাদের ২০ লক্ষ টাকা পর্যন্ত ৫০% অনুদান ও ৫০% ঋণ সুবিধা দেওয়া হচ্ছে।',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
