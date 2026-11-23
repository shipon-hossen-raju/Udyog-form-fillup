'use client';

import { useEffect, useRef } from 'react';
import {
  Code2,
  ExternalLink,
  Facebook,
  Github,
  Globe,
  Mail,
  MessageCircle,
  MessageSquare,
  Sparkles,
  User,
  X,
} from 'lucide-react';

interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeveloperModal({ isOpen, onClose }: DeveloperModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const whatsappMsg = encodeURIComponent(
    'আসসালামু আলাইকুম শিপন ভাই, আমি আপনার উদ্যোগ (UDYOG) প্ল্যাটফর্ম ভিজিট করেছি। একটি প্রজেক্ট/বিষয়ে আপনার সাথে কথা বলতে চাই।'
  );

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="developer-dialog no-print"
      aria-labelledby="dev-dialog-title"
      onClose={onClose}
    >
      <div className="dev-modal-card">
        {/* Header */}
        <div className="dev-modal-header">
          <div className="dev-modal-tag">
            <Sparkles size={14} className="text-bb-accent" />
            <span>Software Engineer</span>
          </div>
          <button
            type="button"
            className="btn-close-modal"
            onClick={onClose}
            aria-label="বন্ধ করুন"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Profile Body */}
        <div className="dev-modal-body">
          <div className="dev-avatar-wrapper">
            <div className="dev-avatar-ring">
              <img
                src="https://res.cloudinary.com/dw7uwbzl1/image/upload/v1781449838/uploads/about/1781449837183-shipon-hossen-raju-professional.jpg"
                alt="Shipon Hossain Raju"
                className="dev-avatar-img"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.currentTarget as HTMLElement).style.display = 'none';
                  const placeholder = document.getElementById('dev-fallback-icon');
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
              <div id="dev-fallback-icon" className="dev-avatar-fallback" style={{ display: 'none' }}>
                <User size={38} />
              </div>
            </div>
            <div className="dev-online-dot" title="Available for Opportunities" />
          </div>

          <div className="dev-identity">
            <h2 id="dev-dialog-title" className="dev-name">
              শিপন হোসাইন রাজু
            </h2>
            {/* <p className="dev-name-en">Shipon Hossain Raju</p> */}
            {/* <p className="dev-role-badge">Software Engineer</p> */}
          </div>

          <p className="dev-bio">
            বাংলাদেশ ব্যাংকের <strong>&ldquo;উদ্যোগ (UDYOG)&rdquo;</strong> ২০ লাখ টাকার ব্লেন্ডেড অর্থায়ন কর্মসূচির সম্পূর্ণ অনলাইন আবেদন ও ৭-পৃষ্ঠার ভেক্টর PDF জেনারেটর প্ল্যাটফর্মের নির্মাতা ও ডেভেলপার।
          </p>

          {/* Welcoming Contact Message Box */}
          <div className="dev-contact-prompt">
            <div className="dev-contact-prompt-header">
              <MessageSquare size={16} className="text-bb-green" />
              <span>কথা বলতে চান বা কোনো সহযোগিতা প্রয়োজন?</span>
            </div>
            <p>
              উদ্যোগ (UDYOG) ফর্ম পূরণ সম্পর্কিত যেকোনো জিজ্ঞাসা, কাস্টম ওয়েবসাইট বা সফটওয়্যার ডেভেলপমেন্ট প্রজেক্টের ব্যাপারে নির্দ্বিধায় আমাকে <strong>WhatsApp</strong> বা <strong>Facebook</strong>-এ সরাসরি মেসেজ দিন।
            </p>
          </div>

          {/* Key Links */}
          <div className="dev-links-grid">
            <a
              href="https://developershipon.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="dev-action-btn dev-btn-portfolio"
            >
              <Globe size={18} />
              <div className="dev-btn-text">
                <strong>পোর্টফোলিও ওয়েবসাইট</strong>
                <span>developershipon.vercel.app</span>
              </div>
              <ExternalLink size={15} className="dev-ext-icon" />
            </a>

            {/* Direct Messaging: WhatsApp */}
            <a
              href={`https://wa.me/8801310861071?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="dev-action-btn dev-btn-whatsapp"
              title="হোয়াটসঅ্যাপে এক ক্লিকে সরাসরি মেসেজ পাঠান"
            >
              <MessageCircle size={18} />
              <div className="dev-btn-text">
                <strong>WhatsApp মেসেজ</strong>
                <span>সরাসরি চ্যাট করুন (+8801310861071)</span>
              </div>
              <ExternalLink size={15} className="dev-ext-icon" />
            </a>

            {/* Direct Messaging: Facebook */}
            <a
              href="https://www.facebook.com/ShiponHossenRaju"
              target="_blank"
              rel="noopener noreferrer"
              className="dev-action-btn dev-btn-facebook"
            >
              <Facebook size={18} />
              <div className="dev-btn-text">
                <strong>Facebook প্রোফাইল / মেসেঞ্জার</strong>
                <span>facebook.com/ShiponHossenRaju</span>
              </div>
              <ExternalLink size={15} className="dev-ext-icon" />
            </a>

            <a
              href="https://github.com/shipon-hossen-raju"
              target="_blank"
              rel="noopener noreferrer"
              className="dev-action-btn dev-btn-github"
            >
              <Github size={18} />
              <div className="dev-btn-text">
                <strong>গিটহাব প্রোফাইল</strong>
                <span>github.com/shipon-hossen-raju</span>
              </div>
              <ExternalLink size={15} className="dev-ext-icon" />
            </a>

            <a
              href="mailto:msshipon234@gmail.com"
              className="dev-action-btn dev-btn-email"
            >
              <Mail size={18} />
              <div className="dev-btn-text">
                <strong>ইমেইল যোগাযোগ</strong>
                <span>msshipon234@gmail.com</span>
              </div>
              <ExternalLink size={15} className="dev-ext-icon" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="dev-modal-footer">
          <p className="dev-footer-note">যেকোনো ওয়েব বা সফটওয়্যার ডেভেলপমেন্ট সহায়তার জন্য নির্দ্বিধায় যোগাযোগ করুন।</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </dialog>
  );
}
