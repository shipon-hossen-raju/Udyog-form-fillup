export interface TrafficSourceInfo {
  source: 'google' | 'facebook' | 'youtube' | 'whatsapp' | 'social_other' | 'direct' | 'referral';
  sourceName: string;
  referrer: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export function detectTrafficSource(): TrafficSourceInfo {
  if (typeof window === 'undefined') {
    return { source: 'direct', sourceName: 'সরাসরি (Direct)', referrer: '' };
  }

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source')?.toLowerCase() || undefined;
  const utmMedium = params.get('utm_medium')?.toLowerCase() || undefined;
  const utmCampaign = params.get('utm_campaign')?.toLowerCase() || undefined;

  // 1. Check UTM parameter overrides
  if (utmSource) {
    if (utmSource === 'facebook' || utmSource === 'fb') {
      return { source: 'facebook', sourceName: 'Facebook', referrer: document.referrer, utmSource, utmMedium, utmCampaign };
    }
    if (utmSource === 'google') {
      return { source: 'google', sourceName: 'Google Search', referrer: document.referrer, utmSource, utmMedium, utmCampaign };
    }
    if (utmSource === 'youtube') {
      return { source: 'youtube', sourceName: 'YouTube', referrer: document.referrer, utmSource, utmMedium, utmCampaign };
    }
    if (utmSource === 'whatsapp') {
      return { source: 'whatsapp', sourceName: 'WhatsApp', referrer: document.referrer, utmSource, utmMedium, utmCampaign };
    }
  }

  // 2. Check document.referrer header
  const ref = document.referrer ? document.referrer.toLowerCase() : '';

  if (!ref) {
    return {
      source: 'direct',
      sourceName: 'সরাসরি (Direct / শেয়ার লিংক)',
      referrer: '',
      utmSource,
      utmMedium,
      utmCampaign,
    };
  }

  if (ref.includes('google.') || ref.includes('bing.') || ref.includes('yahoo.') || ref.includes('duckduckgo.')) {
    return {
      source: 'google',
      sourceName: 'Google / সার্চ ইঞ্জিন',
      referrer: document.referrer,
      utmSource,
      utmMedium,
      utmCampaign,
    };
  }

  if (ref.includes('facebook.com') || ref.includes('fb.me') || ref.includes('fb.com') || ref.includes('instagram.com')) {
    return {
      source: 'facebook',
      sourceName: 'Facebook / Instagram',
      referrer: document.referrer,
      utmSource,
      utmMedium,
      utmCampaign,
    };
  }

  if (ref.includes('youtube.com') || ref.includes('youtu.be')) {
    return {
      source: 'youtube',
      sourceName: 'YouTube',
      referrer: document.referrer,
      utmSource,
      utmMedium,
      utmCampaign,
    };
  }

  if (ref.includes('whatsapp.com') || ref.includes('wa.me')) {
    return {
      source: 'whatsapp',
      sourceName: 'WhatsApp',
      referrer: document.referrer,
      utmSource,
      utmMedium,
      utmCampaign,
    };
  }

  if (ref.includes('linkedin.com')) {
    return {
      source: 'social_other',
      sourceName: 'LinkedIn',
      referrer: document.referrer,
      utmSource,
      utmMedium,
      utmCampaign,
    };
  }

  if (ref.includes('t.me') || ref.includes('telegram')) {
    return {
      source: 'social_other',
      sourceName: 'Telegram',
      referrer: document.referrer,
      utmSource,
      utmMedium,
      utmCampaign,
    };
  }

  return {
    source: 'referral',
    sourceName: 'অন্যান্য রেফারেল সাইট',
    referrer: document.referrer,
    utmSource,
    utmMedium,
    utmCampaign,
  };
}
