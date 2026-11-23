import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

export async function POST() {
  try {
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('username:password')) {
      return NextResponse.json(
        { success: false, message: 'DATABASE_URL কনফিগার করা হয়নি।' },
        { status: 503 }
      );
    }

    const allApps = await prisma.applicationForm.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        applicantName: true,
        businessName: true,
        status: true,
        updatedAt: true,
        createdAt: true,
        formData: true,
      },
    });

    if (allApps.length <= 1) {
      return NextResponse.json({
        success: true,
        message: 'ডাটাবেজে কোনো ডুপ্লিকেট আবেদন নেই।',
        removedCount: 0,
        remainingCount: allApps.length,
      });
    }

    // Group by unique identity key
    const groups = new Map<string, typeof allApps>();

    for (const app of allApps) {
      const p1 = (app.formData as any)?.part1;
      const off = (app.formData as any)?.office;
      const cleanNid = normalizeDigits(p1?.nid);
      const cleanPhone = normalizeDigits(p1?.phone);
      const name = (app.applicantName || p1?.nameBn || '').trim().toLowerCase();
      const district = (p1?.presentAddress?.district || off?.district || '').trim().toLowerCase();

      let groupKey = '';
      if (cleanNid && cleanNid.length >= 10) {
        groupKey = `nid:${cleanNid}`;
      } else if (cleanPhone && cleanPhone.length >= 10) {
        groupKey = `phone:${cleanPhone}`;
      } else if (name && district) {
        groupKey = `name_dist:${name}_${district}`;
      } else if (name) {
        groupKey = `name:${name}`;
      } else {
        groupKey = `id:${app.id}`; // Standalone, won't group
      }

      const existingGroup = groups.get(groupKey) || [];
      existingGroup.push(app);
      groups.set(groupKey, existingGroup);
    }

    const idsToDelete: string[] = [];

    // In each group with > 1 entries, pick the master and mark others for deletion
    groups.forEach((group) => {
      if (group.length > 1) {
        // Sort by preference:
        // 1. status === 'pdf_generated' comes first
        // 2. most recent updatedAt comes first
        group.sort((a, b) => {
          if (a.status === 'pdf_generated' && b.status !== 'pdf_generated') return -1;
          if (b.status === 'pdf_generated' && a.status !== 'pdf_generated') return 1;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });

        // The first one is the master
        const duplicates = group.slice(1);
        for (const dup of duplicates) {
          idsToDelete.push(dup.id);
        }
      }
    });

    if (idsToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'ডাটাবেজে কোনো ডুপ্লিকেট এন্ট্রি পাওয়া যায়নি।',
        removedCount: 0,
        remainingCount: allApps.length,
      });
    }

    // Delete duplicates in batch
    await prisma.applicationForm.deleteMany({
      where: {
        id: { in: idsToDelete },
      },
    });

    const remainingCount = allApps.length - idsToDelete.length;

    return NextResponse.json({
      success: true,
      message: `সফলভাবে ${idsToDelete.length}টি ডুপ্লিকেট আবেদন মুছে ফেলা হয়েছে। বর্তমানে মোট ${remainingCount}টি অনন্য আবেদন রয়েছে।`,
      removedCount: idsToDelete.length,
      remainingCount,
      removedIds: idsToDelete,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'ডুপ্লিকেট রিমুভ করতে সমস্যা হয়েছে';
    console.error('Failed to deduplicate applications:', error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
