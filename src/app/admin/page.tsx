import type { Metadata } from 'next';
import { AdminDashboard } from '../../components/AdminDashboard';
import '../../styles/admin.css';

export const metadata: Metadata = {
  title: 'উদ্যোগ (UDYOG) অ্যাডমিন ড্যাশবোর্ড | আবেদনকারী তালিকা ও মনিটরিং',
  description:
    'বাংলাদেশ ব্যাংক উদ্যোগ (UDYOG) কর্মসূচির আওতায় আবেদনকারীদের ফরম পূরণ ও PDF জেনারেটের তালিকা, পরিসংখ্যান ও বিস্তারিত মনিটরিং প্যানেল।',
};

export default function AdminPage() {
  return <AdminDashboard />;
}
