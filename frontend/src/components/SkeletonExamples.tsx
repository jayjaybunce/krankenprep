/**
 * Skeleton Component Examples
 *
 * This file demonstrates how to use the various skeleton components
 * for loading states throughout your application.
 */

import React from "react";
import {
  Skeleton,
  SkeletonText,
  SkeletonTitle,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonList,
  SkeletonTable,
  SkeletonImage,
} from "./Skeleton";

export const SkeletonExamples = () => {
  return (
    <div className="p-8 space-y-12 max-w-4xl mx-auto">
      {/* Basic Skeleton */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Basic Skeleton</h2>
        <Skeleton className="w-full h-12 rounded-lg" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" variant="circular" />
          <Skeleton className="h-24" variant="rectangular" />
        </div>
      </section>

      {/* Text Skeletons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Text Skeletons</h2>
        <SkeletonText lines={1} />
        <SkeletonText lines={3} />
        <SkeletonText lines={5} lastLineWidth="40%" />
      </section>

      {/* Title Skeletons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Title Skeletons</h2>
        <SkeletonTitle size="sm" />
        <SkeletonTitle size="md" />
        <SkeletonTitle size="lg" />
        <SkeletonTitle size="xl" />
      </section>

      {/* Card Skeletons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Card Skeletons</h2>
        <div className="grid grid-cols-2 gap-4">
          <SkeletonCard variant="default" />
          <SkeletonCard variant="elevated" showBadges />
          <SkeletonCard variant="bordered" showImage={false} />
          <SkeletonCard variant="neon-gradient" showBadges />
        </div>
      </section>

      {/* Avatar Skeletons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Avatar Skeletons</h2>
        <div className="flex items-center gap-4">
          <SkeletonAvatar size="xs" />
          <SkeletonAvatar size="sm" />
          <SkeletonAvatar size="md" />
          <SkeletonAvatar size="lg" />
          <SkeletonAvatar size="xl" />
        </div>
      </section>

      {/* Button Skeletons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Button Skeletons</h2>
        <div className="flex items-center gap-4">
          <SkeletonButton size="xs" />
          <SkeletonButton size="sm" />
          <SkeletonButton size="md" />
          <SkeletonButton size="lg" />
        </div>
      </section>

      {/* List Skeletons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">List Skeletons</h2>
        <SkeletonList items={3} />
        <SkeletonList items={4} showAvatar />
      </section>

      {/* Table Skeleton */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Table Skeleton</h2>
        <SkeletonTable rows={5} columns={4} />
      </section>

      {/* Image Skeletons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Image Skeletons</h2>
        <SkeletonImage aspectRatio="16/9" />
        <div className="grid grid-cols-2 gap-4">
          <SkeletonImage aspectRatio="1/1" />
          <SkeletonImage aspectRatio="4/3" />
        </div>
      </section>

      {/* Real-world Example: Boss Display Loading */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Real Example: Boss Display Loading</h2>
        <div className="space-y-2">
          {/* Boss image skeleton */}
          <SkeletonImage aspectRatio="16/9" className="h-56" />

          {/* Admin toolbar skeleton */}
          <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 px-3 py-2 rounded-lg">
            <SkeletonButton size="xs" />
            <SkeletonButton size="xs" />
          </div>

          {/* Section cards skeleton */}
          <div className="space-y-4">
            <SkeletonCard variant="default" showBadges />
            <SkeletonCard variant="warning" showBadges />
            <SkeletonCard variant="success" showBadges />
          </div>
        </div>
      </section>

      {/* Composed Example: Profile Card */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Composed Example: Profile Card</h2>
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-600 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <SkeletonAvatar size="lg" />
            <div className="flex-1">
              <SkeletonTitle size="md" className="mb-2" />
              <SkeletonText lines={1} className="w-3/4" />
            </div>
          </div>
          <SkeletonText lines={3} />
          <div className="flex gap-2 mt-4">
            <SkeletonButton size="sm" />
            <SkeletonButton size="sm" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default SkeletonExamples;
