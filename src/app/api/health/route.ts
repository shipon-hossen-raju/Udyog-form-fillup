import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || '';
  if (!dbUrl || dbUrl.includes('username:password')) {
    return NextResponse.json({
      connected: false,
      status: 'unconfigured',
      message: 'MongoDB DATABASE_URL কনফিগার করা হয়নি।',
    });
  }

  try {
    // Attempt a lightweight query to test the connection
    await prisma.$runCommandRaw({ ping: 1 });
    return NextResponse.json({
      connected: true,
      status: 'connected',
      message: 'MongoDB ডাটাবেজের সাথে সফলভাবে সংযুক্ত।',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'কানেকশন এরর';
    return NextResponse.json({
      connected: false,
      status: 'error',
      message,
    });
  }
}
