import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BoardListPage from '@/domains/Board/BoardList';
import ShopBoard from '@/domains/Board/ShopBoard';
import { getCategoryBySlugAPI } from '@/api/category';
import type { Category } from '@/domains/Board/types';

function BoardRoutePage() {
  const { boardType } = useParams<{ boardType: string }>();
  const slug = boardType?.toLowerCase() || 'news';
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCategoryBySlugAPI(slug)
      .then((nextCategory) => {
        if (!cancelled) setCategory(nextCategory);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) return <BoardListPage slug={slug} />;
  if (category?.shopEnabled) return <ShopBoard boardSlug={slug} />;
  return <BoardListPage slug={slug} />;
}

export default BoardRoutePage;
