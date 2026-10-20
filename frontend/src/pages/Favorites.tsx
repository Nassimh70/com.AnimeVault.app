import { useMemo } from 'react';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { useAnimes } from '../hooks/useAnimes';
import { AnimeCard } from '../components/anime/AnimeCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import type { Anime } from '../types/anime';
import { useToast } from '../components/ui/ToastContext';

export function Favorites() {
  const filters = useMemo(() => ({ favorite: true }), []);
  const { animes, loading, remove, toggleFavorite } = useAnimes(filters);
  const [toDelete, setToDelete] = useState<Anime | null>(null);
  const { show } = useToast();

  async function handleDelete() {
    if (!toDelete) return;
    await remove(toDelete.id);
    show('success', `"${toDelete.title}" a été supprimé.`);
    setToDelete(null);
  }

  return (
    <div className="page-shell p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <p className="section-title mb-2">Collections</p>
        <h1 className="text-3xl font-bold hero-text">Mes favoris</h1>
        <p className="text-text-secondary text-sm">{animes.length} anime{animes.length > 1 ? 's' : ''} en favoris</p>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[2/3]" />)}
        </div>
      ) : animes.length === 0 ? (
        <EmptyState icon={<Heart size={26} />} title="Aucun favori" subtitle="Ajoute des animes à tes favoris depuis leur carte ou leur page détails." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {animes.map((a) => <AnimeCard key={a.id} anime={a} onToggleFavorite={toggleFavorite} onDelete={setToDelete} />)}
        </div>
      )}
      <ConfirmDialog open={!!toDelete} title="Supprimer cet anime ?" message={`"${toDelete?.title}" sera définitivement supprimé.`} onConfirm={handleDelete} onCancel={() => setToDelete(null)} />
    </div>
  );
}
