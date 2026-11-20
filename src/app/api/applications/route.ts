import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UdyogFormData } from '@/types/form';

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
      { status: 200 } // Return 200 so UI can gracefully show offline status
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
    const requestedAmount = formData?.part4?.requestedFinancing || '০';
    const status = body.status || 'draft';

    const savedRecord = await prisma.applicationForm.create({
      data: {
        title,
        applicantName,
        businessName,
        requestedAmount,
        status,
        formData: formData as unknown as object,
      },
    });

    return NextResponse.json({
      success: true,
      connected: true,
      message: 'MongoDB ডাটাবেজে সফলভাবে সংরক্ষিত হয়েছে।',
      data: savedRecord,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'ডাটাবেজে সেভ করতে সমস্যা হয়েছে';
    console.error('Failed to create application in MongoDB:', error);
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
