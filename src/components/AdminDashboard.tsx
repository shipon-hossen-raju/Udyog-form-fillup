'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Loader2,
  MapPin,
  Phone,
  Printer,
  RefreshCw,
  Search,
  Trash2,
  User,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { MongoApplicationItem, checkDbHealth, deleteMongoApplication, fetchMongoApplications } from '../utils/api';
import { formatIsoDateBn, formatTakaBn, parseNumericAmount, toBengaliDigits } from '../data/defaults';
import { UdyogLogo } from './UdyogLogo';

export function AdminDashboard() {
  const [applications, setApplications] = useState<MongoApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [dbMessage, setDbMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pdf_generated' | 'printed' | 'draft'>('all');
  const [selectedApp, setSelectedApp] = useState<MongoApplicationItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const health = await checkDbHealth();
      setDbConnected(health.connected);
      setDbMessage(health.message);

      if (health.connected) {
        const res = await fetchMongoApplications();
        if (res.success) {
          setApplications(res.data);
        }
      }
    } catch {
      setDbConnected(false);
      setDbMessage('সার্ভারে যোগাযোগ করা যায়নি');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const announce = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(''), 4000);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = applications.length;
    const pdfCount = applications.filter((a) => a.status === 'pdf_generated').length;
    const printCount = applications.filter((a) => a.status === 'printed').length;
    const sumAmount = applications.reduce((sum, a) => {
      const amt = parseNumericAmount(a.requestedAmount || a.formData?.part4?.requestedFinancing || '0');
      return sum + amt;
    }, 0);

    const districts = new Set<string>();
    applications.forEach((a) => {
      const d =
        a.formData?.part1?.presentAddress?.district ||
        a.formData?.office?.district ||
        '';
      if (d && d.trim()) districts.add(d.trim());
    });

    return {
      total,
      pdfCount,
      printCount,
      sumAmount,
      uniqueDistricts: districts.size,
    };
  }, [applications]);

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      // 1. Status Filter
      if (statusFilter !== 'all' && app.status !== statusFilter) {
        return false;
      }

      // 2. Search Query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const applicantName = (app.applicantName || app.formData?.part1?.nameBn || '').toLowerCase();
      const applicantNameEn = (app.formData?.part1?.nameEn || '').toLowerCase();
      const mobile = (app.formData?.part1?.phone || '').toLowerCase();
      const nid = (app.formData?.part1?.nid || '').toLowerCase();
      const district = (app.formData?.part1?.presentAddress?.district || '').toLowerCase();
      const upazila = (app.formData?.part1?.presentAddress?.upazila || '').toLowerCase();
      const business = (app.businessName || app.formData?.part3?.businessName || '').toLowerCase();

      return (
        applicantName.includes(q) ||
        applicantNameEn.includes(q) ||
        mobile.includes(q) ||
        nid.includes(q) ||
        district.includes(q) ||
        upazila.includes(q) ||
        business.includes(q)
      );
    });
  }, [applications, statusFilter, searchQuery]);

  // Handle Delete
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${name}"-এর আবেদনটি ডাটাবেজ থেকে মুছে ফেলতে চান?`)) {
      return;
    }
    setIsDeleting(id);
    try {
      const res = await deleteMongoApplication(id);
      if (res.success) {
        announce('আবেদনটি ডাটাবেজ থেকে সফলভাবে মুছে ফেলা হয়েছে।');
        setApplications((prev) => prev.filter((a) => a.id !== id));
        if (selectedApp?.id === id) {
          setSelectedApp(null);
        }
      } else {
        announce(`মুছে ফেলা যায়নি: ${res.message}`);
      }
    } finally {
      setIsDeleting(null);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (filteredApps.length === 0) {
      announce('এক্সপোর্ট করার মতো কোনো ডাটা নেই।');
      return;
    }

    const headers = [
      'ক্রমিক',
      'আবেদনকারীর নাম (বাংলা)',
      'আবেদনকারীর নাম (ইংরেজি)',
      'মোবাইল নম্বর',
      'এনআইডি (NID)',
      'জন্ম তারিখ',
      'জেলা',
      'উপজেলা',
      'উদ্যোগের নাম / প্রস্তাবনা',
      'উদ্যোগের খাত',
      'প্রস্তাবিত অর্থায়ন (টাকা)',
      'নিজস্ব বিনিয়োগ (টাকা)',
      'ব্যাংক ও শাখা',
      'স্ট্যাটাস',
      'আবেদনের তারিখ ও সময়',
    ];

    const escapeCsv = (val: string | number | undefined) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredApps.map((app, idx) => {
      const p1 = app.formData?.part1;
      const p2 = app.formData?.part2;
      const p3 = app.formData?.part3;
      const p4 = app.formData?.part4;
      const off = app.formData?.office;

      return [
        toBengaliDigits(idx + 1),
        escapeCsv(p1?.nameBn || app.applicantName),
        escapeCsv(p1?.nameEn),
        escapeCsv(p1?.phone),
        escapeCsv(p1?.nid),
        escapeCsv(p1?.dob),
        escapeCsv(p1?.presentAddress?.district || off?.district),
        escapeCsv(p1?.presentAddress?.upazila || off?.upazila),
        escapeCsv(p3?.businessName || p2?.businessTypeDetails || app.businessName),
        escapeCsv(p2?.businessType || p3?.businessType || '—'),
        escapeCsv(p4?.requestedFinancing || app.requestedAmount),
        escapeCsv(p4?.ownInvestment),
        escapeCsv(off?.bankAndBranch),
        escapeCsv(
          app.status === 'pdf_generated'
            ? 'PDF ডাউনলোড সম্পন্ন'
            : app.status === 'printed'
            ? 'প্রিন্টকৃত'
            : 'ড্রাফট'
        ),
        escapeCsv(app.createdAt ? new Date(app.createdAt).toLocaleString('bn-BD') : ''),
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `udyog-applicants-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    announce('সকল আবেদনকারীর এক্সেল CSV ফাইল ডাউনলোড হয়েছে।');
  };

  return (
    <div className="admin-layout">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="status-toast-host" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
          <div className="status-toast" style={{ background: '#0e4b28' }}>
            {toastMessage}
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <header className="admin-navbar">
        <div className="admin-brand">
          <UdyogLogo size={36} />
          <div className="admin-title-group">
            <h1>
              উদ্যোগ (UDYOG) আবেদন ব্যবস্থাপনা
              <span className="admin-badge-tag">অ্যাডমিন প্যানেল</span>
            </h1>
            <p>কারা কারা ফর্ম পূরণ করে PDF জেনারেট করেছে তাদের তালিকা ও সার্বিক বিবরণ</p>
          </div>
        </div>

        <div className="admin-nav-actions">
          {/* Database Health Badge */}
          <div
            className={`db-status-pill ${dbConnected === true ? 'is-online' : 'is-offline'}`}
            title={dbMessage}
          >
            <span className="status-dot" />
            <span>{dbConnected === true ? 'MongoDB কানেক্টেড' : 'MongoDB সংযোগ নেই'}</span>
          </div>

          <button
            type="button"
            className="btn-admin-action"
            onClick={loadData}
            disabled={isLoading}
            title="ডাটা রিফ্রেশ করুন"
          >
            <RefreshCw size={14} className={isLoading ? 'spin-icon' : ''} />
            <span>রিফ্রেশ</span>
          </button>

          <Link href="/" className="btn-admin-action btn-admin-primary">
            <ArrowLeft size={15} />
            <span>মূল আবেদন ফরম</span>
          </Link>
        </div>
      </header>

      {/* Container */}
      <main className="admin-container">
        {/* Metric Summary Cards */}
        <section className="admin-stats-grid" aria-label="পরিসংখ্যান সারাংশ">
          <div className="admin-stat-card">
            <div className="stat-info">
              <p>মোট আবেদনকারী</p>
              <h2 className="stat-value">{toBengaliDigits(stats.total)} জন</h2>
            </div>
            <div className="stat-icon-wrap stat-icon-blue">
              <Users size={22} />
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-info">
              <p>PDF জেনারেট করেছেন</p>
              <h2 className="stat-value">{toBengaliDigits(stats.pdfCount)} জন</h2>
            </div>
            <div className="stat-icon-wrap stat-icon-green">
              <CheckCircle2 size={22} />
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-info">
              <p>মোট প্রস্তাবিত অর্থায়ন</p>
              <h2 className="stat-value">৳ {toBengaliDigits(formatTakaBn(stats.sumAmount))}</h2>
            </div>
            <div className="stat-icon-wrap stat-icon-amber">
              <Wallet size={22} />
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-info">
              <p>আবেদনকৃত জেলা</p>
              <h2 className="stat-value">{toBengaliDigits(stats.uniqueDistricts)}টি</h2>
            </div>
            <div className="stat-icon-wrap stat-icon-purple">
              <MapPin size={22} />
            </div>
          </div>
        </section>

        {/* Filter and Search Bar */}
        <div className="admin-filter-bar">
          <div className="search-input-box">
            <Search size={16} className="text-muted" />
            <input
              type="text"
              placeholder="আবেদনকারীর নাম, মোবাইল নম্বর, NID, জেলা বা উদ্যোগের নাম দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0 }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="filter-controls-group">
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">সব স্ট্যাটাস ({toBengaliDigits(applications.length)})</option>
              <option value="pdf_generated">
                PDF ডাউনলোড সম্পন্ন ({toBengaliDigits(stats.pdfCount)})
              </option>
              <option value="printed">প্রিন্টকৃত ({toBengaliDigits(stats.printCount)})</option>
              <option value="draft">ড্রাফট</option>
            </select>

            <button
              type="button"
              className="btn-admin-action"
              onClick={handleExportCsv}
              title="বর্তমান ফিল্টার করা তালিকা CSV ফরম্যাটে ডাউনলোড করুন"
            >
              <FileSpreadsheet size={15} />
              <span>এক্সেল / CSV এক্সপোর্ট</span>
            </button>
          </div>
        </div>

        {/* Applications Table */}
        <div className="admin-table-card">
          {isLoading ? (
            <div className="admin-empty-state">
              <Loader2 size={32} className="spin-icon text-bb-green" style={{ margin: '0 auto' }} />
              <p>MongoDB থেকে আবেদনকারীদের তালিকা লোড করা হচ্ছে...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="admin-empty-state">
              <FileText size={38} style={{ opacity: 0.3, margin: '0 auto' }} />
              <p>
                {searchQuery || statusFilter !== 'all'
                  ? 'ফিল্টারের সাথে কোনো আবেদনকারীর মিল পাওয়া যায়নি।'
                  : 'এখনও পর্যন্ত কোনো আবেদনকারী ফরম পূরণ বা PDF জেনারেট করেননি।'}
              </p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>আবেদনকারী</th>
                    <th>যোগাযোগ</th>
                    <th>এনআইডি ও ঠিকানা</th>
                    <th>উদ্যোগের নাম ও খাত</th>
                    <th>ঋণের চাহিদা</th>
                    <th>স্ট্যাটাস</th>
                    <th>তারিখ ও সময়</th>
                    <th style={{ textAlign: 'center' }}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.map((app, idx) => {
                    const p1 = app.formData?.part1;
                    const p2 = app.formData?.part2;
                    const p3 = app.formData?.part3;
                    const p4 = app.formData?.part4;
                    const off = app.formData?.office;

                    const applicantName = p1?.nameBn || app.applicantName || 'নামহীন আবেদনকারী';
                    const businessTitle = p3?.businessName || p2?.businessTypeDetails || app.businessName || '—';
                    const sector = p2?.businessType || p3?.businessType || '—';
                    const amount = p4?.requestedFinancing || app.requestedAmount || '০';
                    const district = p1?.presentAddress?.district || off?.district || '—';
                    const upazila = p1?.presentAddress?.upazila || off?.upazila || '';
                    const mobile = p1?.phone || '—';
                    const nid = p1?.nid || '—';

                    return (
                      <tr key={app.id}>
                        <td>
                          <span style={{ fontWeight: 600, color: '#64748b' }}>
                            {toBengaliDigits(idx + 1)}
                          </span>
                        </td>
                        <td>
                          <div className="applicant-cell">
                            {off?.photoDataUrl ? (
                              <img
                                src={off.photoDataUrl}
                                alt={applicantName}
                                className="applicant-avatar"
                              />
                            ) : (
                              <div className="applicant-avatar-placeholder">
                                <User size={18} />
                              </div>
                            )}
                            <div>
                              <p className="applicant-name-text">{applicantName}</p>
                              {p1?.nameEn && <p className="applicant-sub-text">{p1.nameEn}</p>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.82rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Phone size={12} className="text-muted" />
                              <strong style={{ color: '#0f172a' }}>{mobile}</strong>
                            </div>
                            {p1?.email && (
                              <span style={{ color: '#64748b', fontSize: '0.74rem' }}>
                                {p1.email}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.82rem' }}>
                            <div>NID: <strong>{nid}</strong></div>
                            <div style={{ color: '#64748b', fontSize: '0.76rem' }}>
                              {upazila ? `${upazila}, ${district}` : district}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ maxWidth: 220 }}>
                            <p style={{ margin: 0, fontWeight: 600, color: '#0e4b28', fontSize: '0.85rem' }}>
                              {businessTitle}
                            </p>
                            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>খাত: {sector}</span>
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: '#0e4b28', fontSize: '0.92rem' }}>
                            ৳ {toBengaliDigits(formatTakaBn(parseNumericAmount(amount)))}
                          </strong>
                        </td>
                        <td>
                          {app.status === 'pdf_generated' ? (
                            <span className="status-badge status-badge-pdf">
                              <CheckCircle2 size={12} />
                              PDF ডাউনলোড সম্পন্ন
                            </span>
                          ) : app.status === 'printed' ? (
                            <span className="status-badge status-badge-printed">
                              <Printer size={12} />
                              প্রিন্টকৃত
                            </span>
                          ) : (
                            <span className="status-badge status-badge-draft">
                              ড্রাফট
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {app.createdAt
                            ? new Date(app.createdAt).toLocaleString('bn-BD', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })
                            : '—'}
                        </td>
                        <td>
                          <div className="table-actions-cell">
                            <button
                              type="button"
                              className="btn-table-action btn-table-view"
                              onClick={() => setSelectedApp(app)}
                              title="আবেদনের সম্পূর্ণ বিস্তারিত তথ্য দেখুন"
                            >
                              <Eye size={13} />
                              <span>বিস্তারিত</span>
                            </button>

                            <Link
                              href={`/?loadMongoId=${app.id}`}
                              target="_blank"
                              className="btn-table-action btn-table-print"
                              title="আবেদনকারীর ফর্মটি ওপেন করে ৭ পৃষ্ঠার অফিসিয়াল PDF দেখুন বা প্রিন্ট করুন"
                            >
                              <Printer size={13} />
                              <span>PDF ভিউ</span>
                            </Link>

                            <button
                              type="button"
                              className="btn-table-action btn-table-danger"
                              onClick={() => handleDelete(app.id, applicantName)}
                              disabled={isDeleting === app.id}
                              title="ডাটাবেজ থেকে মুছে ফেলুন"
                            >
                              {isDeleting === app.id ? (
                                <Loader2 size={13} className="spin-icon" />
                              ) : (
                                <Trash2 size={13} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ==================== DETAIL MODAL ==================== */}
      {selectedApp && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedApp(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText size={20} className="text-bb-green" />
                <h2>
                  {selectedApp.formData?.part1?.nameBn || selectedApp.applicantName} — আবেদনের বিস্তারিত বিবরণ
                </h2>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setSelectedApp(null)}
                style={{ background: 'none', border: 0, cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Top Summary Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 14,
                  background: '#f0fdf4',
                  borderRadius: 10,
                  border: '1px solid #bbf7d0',
                }}
              >
                {selectedApp.formData?.office?.photoDataUrl ? (
                  <img
                    src={selectedApp.formData.office.photoDataUrl}
                    alt="Applicant"
                    style={{ width: 64, height: 74, objectFit: 'cover', borderRadius: 6, border: '1px solid #86efac' }}
                  />
                ) : (
                  <div
                    style={{
                      width: 64,
                      height: 74,
                      background: '#e2e8f0',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <User size={28} style={{ color: '#64748b' }} />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0e4b28' }}>
                    {selectedApp.formData?.part1?.nameBn || selectedApp.applicantName}
                  </h3>
                  <p style={{ margin: '2px 0 0', color: '#475569', fontSize: '0.85rem' }}>
                    {selectedApp.formData?.part1?.nameEn} | মোবাইল: <strong>{selectedApp.formData?.part1?.phone || '—'}</strong> | NID: <strong>{selectedApp.formData?.part1?.nid || '—'}</strong>
                  </p>
                  <p style={{ margin: '4px 0 0', color: '#065f46', fontSize: '0.82rem', fontWeight: 600 }}>
                    উদ্যোগ: {selectedApp.formData?.part3?.businessName || selectedApp.formData?.part2?.businessTypeDetails || selectedApp.businessName}
                  </p>
                </div>
                <div>
                  <Link
                    href={`/?loadMongoId=${selectedApp.id}`}
                    target="_blank"
                    className="btn-admin-action btn-admin-primary"
                    style={{ padding: '8px 14px' }}
                  >
                    <Printer size={16} />
                    <span>৭ পৃষ্ঠার A4 PDF প্রিন্ট করুন</span>
                  </Link>
                </div>
              </div>

              {/* 1. Personal Details */}
              <div className="detail-section-card">
                <h4 className="detail-section-title">
                  <User size={16} />
                  পার্ট-১: ব্যক্তিগত তথ্যাবলি
                </h4>
                <div className="detail-grid-3">
                  <div>
                    <span className="detail-item-label">পিতার নাম:</span>
                    <span className="detail-item-val">{selectedApp.formData?.part1?.fatherName || '—'}</span>
                  </div>
                  <div>
                    <span className="detail-item-label">মাতার নাম:</span>
                    <span className="detail-item-val">{selectedApp.formData?.part1?.motherName || '—'}</span>
                  </div>
                  <div>
                    <span className="detail-item-label">স্বামী/স্ত্রীর নাম:</span>
                    <span className="detail-item-val">{selectedApp.formData?.part1?.spouseName || '—'}</span>
                  </div>
                  <div>
                    <span className="detail-item-label">জন্ম তারিখ:</span>
                    <span className="detail-item-val">{formatIsoDateBn(selectedApp.formData?.part1?.dob) || '—'}</span>
                  </div>
                  <div>
                    <span className="detail-item-label">বৈবাহিক অবস্থা:</span>
                    <span className="detail-item-val">{selectedApp.formData?.part1?.maritalStatus || '—'}</span>
                  </div>
                  <div>
                    <span className="detail-item-label">শিক্ষাগত যোগ্যতা:</span>
                    <span className="detail-item-val">{selectedApp.formData?.part1?.education || '—'}</span>
                  </div>
                </div>

                <div style={{ marginTop: 12, borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                  <span className="detail-item-label">বর্তমান ঠিকানা:</span>
                  <span className="detail-item-val">
                    {selectedApp.formData?.part1?.presentAddress?.house
                      ? `${selectedApp.formData.part1.presentAddress.house}, রোড: ${selectedApp.formData.part1.presentAddress.roadVillage}, ডাকঘর: ${selectedApp.formData.part1.presentAddress.postOfficeCode}, উপজেলা: ${selectedApp.formData.part1.presentAddress.upazila}, জেলা: ${selectedApp.formData.part1.presentAddress.district}`
                      : '—'}
                  </span>
                </div>
              </div>

              {/* 2. Business Plan */}
              <div className="detail-section-card">
                <h4 className="detail-section-title">
                  <Building2 size={16} />
                  ব্যবসায়িক পরিকল্পনা ও বাজার সম্ভাব্যতা
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem' }}>
                  <div>
                    <span className="detail-item-label">ব্যবসায়িক ধারণা / উদ্যোগের সংক্ষিপ্ত বিবরণ:</span>
                    <p style={{ margin: '4px 0 0', background: '#f8fafc', padding: 8, borderRadius: 6, lineHeight: 1.5 }}>
                      {selectedApp.formData?.part2?.ideaSummary || selectedApp.formData?.part3?.businessTypeDetails || '—'}
                    </p>
                  </div>
                  <div className="detail-grid-2">
                    <div>
                      <span className="detail-item-label">সম্ভাব্য ক্রেতা:</span>
                      <span className="detail-item-val">{selectedApp.formData?.part2?.targetCustomers || '—'}</span>
                    </div>
                    <div>
                      <span className="detail-item-label">পণ্যের বাজার (স্থানীয়/আন্তর্জাতিক):</span>
                      <span className="detail-item-val">{selectedApp.formData?.part2?.marketScope || selectedApp.formData?.part3?.marketingArea || '—'}</span>
                    </div>
                    <div>
                      <span className="detail-item-label">সম্ভাব্য মাসিক বিক্রয়:</span>
                      <span className="detail-item-val">৳ {selectedApp.formData?.part2?.projectedSales?.monthly || selectedApp.formData?.part3?.sales?.monthly || '—'}</span>
                    </div>
                    <div>
                      <span className="detail-item-label">সম্ভাব্য মাসিক নিট মুনাফা:</span>
                      <span className="detail-item-val">৳ {selectedApp.formData?.part2?.projectedProfit?.monthly || selectedApp.formData?.part3?.profit?.monthly || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Financing Plan & Budget */}
              <div className="detail-section-card">
                <h4 className="detail-section-title">
                  <Wallet size={16} />
                  পার্ট-৪: অর্থায়ন পরিকল্পনা ও ব্যয়ের বিভাজন
                </h4>
                <div className="detail-grid-3" style={{ marginBottom: 12 }}>
                  <div>
                    <span className="detail-item-label">প্রস্তাবিত মোট মূলধন:</span>
                    <strong style={{ color: '#0e4b28', fontSize: '1rem' }}>
                      ৳ {selectedApp.formData?.part4?.totalCapitalNeeded || '০'}
                    </strong>
                  </div>
                  <div>
                    <span className="detail-item-label">নিজস্ব বিনিয়োগ (ইকুইটি):</span>
                    <span className="detail-item-val">৳ {selectedApp.formData?.part4?.ownInvestment || '০'}</span>
                  </div>
                  <div>
                    <span className="detail-item-label">ঋণ ও অনুদানের চাহিদা:</span>
                    <strong style={{ color: '#d97706', fontSize: '1rem' }}>
                      ৳ {selectedApp.formData?.part4?.requestedFinancing || selectedApp.requestedAmount || '০'}
                    </strong>
                  </div>
                </div>

                {/* 12-item budget breakdown */}
                {selectedApp.formData?.part4?.budgetRows && (
                  <div style={{ marginTop: 10 }}>
                    <span className="detail-item-label" style={{ marginBottom: 6 }}>
                      ১২টি খাতের ব্যয় বিভাজন:
                    </span>
                    <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 6 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '6px 8px', textAlign: 'left' }}>খাতের নাম</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right' }}>পরিমাণ (টাকা)</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left' }}>উৎস ও বিবরণ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedApp.formData.part4.budgetRows.map((r, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '5px 8px' }}>{r.sector}</td>
                              <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 600 }}>
                                {r.amount ? `৳ ${toBengaliDigits(formatTakaBn(parseNumericAmount(r.amount)))}` : '—'}
                              </td>
                              <td style={{ padding: '5px 8px', color: '#64748b' }}>
                                {[r.details, r.source].filter(Boolean).join(' | ') || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Bank & Attachments */}
              <div className="detail-section-card">
                <h4 className="detail-section-title">
                  <Building2 size={16} />
                  ব্যাংক শাখা ও সংযুক্তি চেকলিস্ট
                </h4>
                <div className="detail-grid-2">
                  <div>
                    <span className="detail-item-label">আবেদনকৃত ব্যাংক ও শাখা:</span>
                    <span className="detail-item-val">{selectedApp.formData?.office?.bankAndBranch || '—'}</span>
                  </div>
                  <div>
                    <span className="detail-item-label">উপজেলা ও জেলা:</span>
                    <span className="detail-item-val">
                      {selectedApp.formData?.office?.upazila || '—'}, {selectedApp.formData?.office?.district || ''}
                    </span>
                  </div>
                </div>

                {selectedApp.formData?.part5?.signatureDataUrl && (
                  <div style={{ marginTop: 12 }}>
                    <span className="detail-item-label">ডিজিটাল স্বাক্ষর:</span>
                    <img
                      src={selectedApp.formData.part5.signatureDataUrl}
                      alt="Signature"
                      style={{ maxHeight: 40, borderBottom: '1px dotted #000', paddingBottom: 2 }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn-admin-action"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(selectedApp.formData, null, 2)], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `udyog-${selectedApp.id}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download size={15} />
                <span>JSON ব্যাকআপ ডাউনলোড</span>
              </button>

              <button
                type="button"
                className="btn-admin-action btn-admin-primary"
                onClick={() => setSelectedApp(null)}
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
