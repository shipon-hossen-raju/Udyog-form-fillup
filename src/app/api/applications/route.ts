import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UdyogFormData } from '@/types/form';

export const dynamic = 'force-dynamic';

function normalizeDigits(val: unknown): string {
  if (!val) return '';
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  let str = String(val).trim();
  for (let i = 0; i < 10; i++) {
    str = str.replaceAll(bnDigits[i], String(i));
  }
  return str.replace(/\D/g, '');
}

export async function GET() {
  try {
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('username:password')) {
      return NextResponse.json({
        success: false,
        connected: false,
        message: 'DATABASE_URL কনফিগার করা হয়নি। আপনার .env ফাইলে MongoDB কানেকশন স্ট্রিং দিন।',
        data: [],
      });
    }

    const applications = await prisma.applicationForm.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        applicantName: true,
        businessName: true,
        requestedAmount: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        formData: true,
      },
    });

    return NextResponse.json({
      success: true,
      connected: true,
      data: applications,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'ডাটাবেজ সংযোগে সমস্যা হয়েছে';
    console.error('Failed to fetch applications from MongoDB:', error);
    return NextResponse.json(
      {
        success: false,
        connected: false,
        message,
        data: [],
      },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('username:password')) {
      return NextResponse.json(
        {
          success: false,
          connected: false,
          message: 'MongoDB DATABASE_URL সেট করা নেই। .env ফাইলে কানেকশন স্ট্রিং যুক্ত করুন।',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const formData = body.formData as UdyogFormData;
    const title =
      body.title?.trim() ||
      formData?.part3?.businessName ||
      formData?.part2?.businessTypeDetails ||
      formData?.part2?.businessType ||
      'উদ্যোগ আবেদন ফরম';

    const applicantName =
      formData?.part1?.nameBn || formData?.part1?.nameEn || 'নামহীন আবেদনকারী';
    const businessName =
      formData?.part3?.businessName ||
      formData?.part2?.businessTypeDetails ||
      formData?.part2?.businessType ||
      'উদ্যোগ প্রস্তাবনা';
    const requestedAmount =
      formData?.part4?.requestedFinancing || body.requestedAmount || '০';
    const status = body.status || 'draft';

    const clientProvidedId =
      typeof body.id === 'string' && body.id.trim() ? body.id.trim() : null;
    const cleanNid = normalizeDigits(formData?.part1?.nid);
    const cleanPhone = normalizeDigits(formData?.part1?.phone);
    const district = (
      formData?.part1?.presentAddress?.district ||
      formData?.office?.district ||
      ''
    ).trim().toLowerCase();

    let existingRecord: { id: string; status: string } | null = null;

    // 1. Check if client explicitly sent an existing submission ID
    if (clientProvidedId && clientProvidedId.length === 24) {
      existingRecord = await prisma.applicationForm.findUnique({
        where: { id: clientProvidedId },
        select: { id: true, status: true },
      });
    }

    // 2. If no record matched by ID, search by NID, Phone, or (Name + District) to prevent duplicates
    if (!existingRecord) {
      const candidates = await prisma.applicationForm.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 80,
        select: {
          id: true,
          applicantName: true,
          status: true,
          formData: true,
        },
      });

      const matched = candidates.find((cand) => {
        const candData = cand.formData as any;
        const candNid = normalizeDigits(candData?.part1?.nid);
        const candPhone = normalizeDigits(candData?.part1?.phone);
        const candName = (cand.applicantName || candData?.part1?.nameBn || '')
          .trim()
          .toLowerCase();
        const candDist = (
          candData?.part1?.presentAddress?.district ||
          candData?.office?.district ||
          ''
        )
          .trim()
          .toLowerCase();

        // Match by valid NID (>= 10 digits)
        if (cleanNid.length >= 10 && candNid.length >= 10 && cleanNid === candNid) {
          return true;
        }

        // Match by valid Phone (>= 10 digits)
        if (cleanPhone.length >= 10 && candPhone.length >= 10 && cleanPhone === candPhone) {
          const currName = (applicantName || '').trim().toLowerCase();
          if (
            !currName ||
            currName === 'নামহীন আবেদনকারী' ||
            !candName ||
            candName === 'নামহীন আবেদনকারী' ||
            currName === candName ||
            currName.includes(candName) ||
            candName.includes(currName)
          ) {
            return true;
          }
        }

        // Match by Name + District if both are strongly provided
        if (
          applicantName !== 'নামহীন আবেদনকারী' &&
          candName !== 'নামহীন আবেদনকারী' &&
          applicantName.trim().length >= 3 &&
          candName.trim().length >= 3 &&
          applicantName.trim().toLowerCase() === candName &&
          district &&
          candDist &&
          district === candDist
        ) {
          return true;
        }

        return false;
      });

      if (matched) {
        existingRecord = { id: matched.id, status: matched.status };
      }
    }

    let savedRecord;

    if (existingRecord) {
      // Smart Upsert: Update the existing record instead of creating a duplicate
      const finalStatus =
        status === 'pdf_generated'
          ? 'pdf_generated'
          : existingRecord.status === 'pdf_generated'
          ? 'pdf_generated'
          : status;

      const trafficInfo = body.traffic || null;
      const savedFormData = {
        ...formData,
        ...(trafficInfo ? { _trafficSource: trafficInfo } : {}),
      };

      savedRecord = await prisma.applicationForm.update({
        where: { id: existingRecord.id },
        data: {
          title,
          applicantName,
          businessName,
          requestedAmount,
          status: finalStatus,
          formData: savedFormData as unknown as object,
        },
      });

      return NextResponse.json({
        success: true,
        connected: true,
        isUpdated: true,
        message: 'আগের আবেদনটি সফলভাবে আপডেট করা হয়েছে (ডুপ্লিকেট প্রতিরোধ করা হয়েছে)।',
        data: savedRecord,
      });
    }

    // New unique submission
    const trafficInfo = body.traffic || null;
    const savedFormData = {
      ...formData,
      ...(trafficInfo ? { _trafficSource: trafficInfo } : {}),
    };

    savedRecord = await prisma.applicationForm.create({
      data: {
        title,
        applicantName,
        businessName,
        requestedAmount,
        status,
        formData: savedFormData as unknown as object,
      },
    });

    return NextResponse.json({
      success: true,
      connected: true,
      isUpdated: false,
      message: 'MongoDB ডাটাবেজে সফলভাবে সংরক্ষিত হয়েছে।',
      data: savedRecord,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'ডাটাবেজে সেভ করতে সমস্যা হয়েছে';
    console.error('Failed to create or update application in MongoDB:', error);
    return NextResponse.json(
      {
        success: false,
        connected: false,
        message,
      },
      { status: 500 }
    );
  }
}
