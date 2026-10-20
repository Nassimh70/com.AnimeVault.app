import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimeForm } from '../components/anime/AnimeForm';
import { api } from '../services/api';
import type { Anime, AnimeInput } from '../types/anime';
import { Skeleton } from '../components/ui/Skeleton';

export function AnimeEdit() {
  const { id } = useParams();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getAnime(id).then(setAnime).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 max-w-4xl mx-auto"><Skeleton className="h-96" /></div>;
  if (!anime) return null;

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-6 max-w-4xl mx-auto">Modifier « {anime.title} »</h1>
      <AnimeForm initial={anime} onSubmit={async (data: AnimeInput) => { await api.updateAnime(anime.id, data); }} />
    </div>
  );
}
