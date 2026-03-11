'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuperadminIndex() {
  const router = useRouter();
  useEffect(() => { router.replace('/superadmin/settings/theme'); }, []);
  return null;
}
