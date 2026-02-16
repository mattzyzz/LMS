'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import CourseBuilderPage from '@/components/CourseBuilder/CourseBuilderPage';

export default function BuilderPage() {
  const params = useParams();
  const courseId = params.id as string;

  return <CourseBuilderPage courseId={courseId} />;
}
