'use client';

import Link from 'next/link';

export default function EditPostButton({ postId }: { postId: string }) {
  return (
    <Link href={`/dashboard/edit/${postId}`} className="btn-secondary text-sm py-1.5">
      ✏️ Edit Post
    </Link>
  );
}
