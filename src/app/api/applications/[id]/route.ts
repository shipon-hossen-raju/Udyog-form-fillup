import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UdyogFormData } from '@/types/form';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const record = await prisma.applicationForm.findUnique({
      where: { id },
    });

    if (!record) {
      return NextResponse.json(
        { success: false, message: 'আবেদন পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'ডাটা আনতে সমস্যা হয়েছে';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const formData = body.formData as UdyogFormData;

    const applicantName =
      formData?.part1?.nameBn || formData?.part1?.nameEn || 'নামহীন আবেদনকারী';
    const businessName =
      formData?.part3?.businessName ||
      formData?.part2?.businessTypeDetails ||
      formData?.part2?.businessType ||
      'উদ্যোগ প্রস্তাবনা';
    const requestedAmount = formData?.part4?.requestedFinancing || '০';

    const updated = await prisma.applicationForm.update({
      where: { id },
      data: {
        ...(body.title ? { title: body.title.trim() } : {}),
        applicantName,
        businessName,
        requestedAmount,
        ...(body.status ? { status: body.status } : {}),
        formData: formData as unknown as object,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'MongoDB-তে সফলভাবে আপডেট হয়েছে।',
      data: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'আপডেট করতে সমস্যা হয়েছে';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.applicationForm.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'MongoDB থেকে আবেদনটি মুছে ফেলা হয়েছে।',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'মুছে ফেলতে সমস্যা হয়েছে';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
