import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, List as ListIcon, SlidersHorizontal, Download, Upload } from 'lucide-react';
import { useAnimes } from '../hooks/useAnimes';
import { AnimeCard } from '../components/anime/AnimeCard';
import { AnimeTable } from '../components/anime/AnimeTable';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/ToastContext';
import { CustomSelect } from '../components/ui/CustomSelect';
import type { Anime } from '../types/anime';
import { api } from '../services/api';

export function AnimeList() {
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [toDelete, setToDelete] = useState<Anime | null>(null);
  const [visibleCount, setVisibleCount] = useState(18);
  const { show } = useToast();

  const filters = useMemo(() => ({
    search: params.get('search') || undefined,
    status: params.get('status') || undefined,
    priority: params.get('priority') || undefined,
    sortBy: params.get('sortBy') || 'createdAt',
    order: (params.get('order') as 'asc' | 'desc') || 'desc',
  }), [params]);

  const { animes, loading, remove, toggleFavorite } = useAnimes(filters);

  async function handleDelete() {
    if (!toDelete) return;
    await remove(toDelete.id);
    show('success', `"${toDelete.title}" a été supprimé.`);
    setToDelete(null);
  }

  function updateParam(key: string, value: string) {
    const p = new URLSearchParams(params);
    if (value) p.set(key, value); else p.delete(key);
    setParams(p);
  }

  const visible = animes.slice(0, visibleCount);

  return (
    <div className="page-shell p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-title mb-2">Collection</p>
          <h1 className="text-3xl font-bold hero-text">Ma bibliothèque</h1>
          <p className="text-text-secondary text-sm">{animes.length} anime{animes.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <a href={api.exportJSONUrl}><Button variant="secondary" icon={<Download size={15} />}>JSON</Button></a>
          <a href={api.exportCSVUrl}><Button variant="secondary" icon={<Download size={15} />}>CSV</Button></a>
          <div className="flex surface rounded-2xl p-1">
            <button onClick={() => setView('grid')} className={`p-2.5 rounded-xl transition-colors ${view === 'grid' ? 'bg-gradient-to-r from-accent to-accent-secondary text-white shadow-glow' : 'text-text-secondary hover:text-text-primary'}`}><LayoutGrid size={16} /></button>
            <button onClick={() => setView('table')} className={`p-2.5 rounded-xl transition-colors ${view === 'table' ? 'bg-gradient-to-r from-accent to-accent-secondary text-white shadow-glow' : 'text-text-secondary hover:text-text-primary'}`}><ListIcon size={16} /></button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 surface rounded-xl2 p-4">
        <SlidersHorizontal size={16} className="text-text-secondary" />
        <CustomSelect
          value={filters.status || ''}
          onChange={(value: string) => updateParam('status', value)}
          placeholder="Tous statuts"
          className="w-full sm:w-52"
          options={[
            { value: '', label: 'Tous statuts' },
            { value: 'a_voir', label: 'À voir', description: 'Anime à commencer' },
            { value: 'en_cours', label: 'En cours', description: 'Lecture actuelle' },
            { value: 'termine', label: 'Terminé', description: 'Regardé jusqu’au bout' },
            { value: 'pause', label: 'Pause', description: 'Mis en attente' },
            { value: 'abandonne', label: 'Abandonné', description: 'Arrêté définitivement' },
          ]}
        />
        <CustomSelect
          value={filters.priority || ''}
          onChange={(value: string) => updateParam('priority', value)}
          placeholder="Toutes priorités"
          className="w-full sm:w-52"
          options={[
            { value: '', label: 'Toutes priorités' },
            { value: 'haute', label: 'Haute', description: 'À traiter en premier' },
            { value: 'moyenne', label: 'Moyenne', description: 'Priorité normale' },
            { value: 'faible', label: 'Faible', description: 'Quand tu as le temps' },
          ]}
        />
        <CustomSelect
          value={filters.sortBy}
          onChange={(value: string) => updateParam('sortBy', value)}
          placeholder="Trier par"
          className="w-full sm:w-56"
          options={[
            { value: 'createdAt', label: "Date d'ajout" },
            { value: 'title', label: 'Nom' },
            { value: 'releaseDate', label: 'Date de sortie' },
            { value: 'episodesTotal', label: 'Nb épisodes' },
            { value: 'rating', label: 'Note' },
            { value: 'priority', label: 'Priorité' },
          ]}
        />
        <CustomSelect
          value={filters.order}
          onChange={(value: string) => updateParam('order', value)}
          placeholder="Ordre"
          className="w-full sm:w-44"
          options={[
            { value: 'desc', label: 'Décroissant' },
            { value: 'asc', label: 'Croissant' },
          ]}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-[2/3]" />)}
        </div>
      ) : animes.length === 0 ? (
        <EmptyState
          icon={<LayoutGrid size={26} />}
          title="Aucun anime trouvé"
          subtitle="Essaie de modifier tes filtres, ou ajoute un nouvel anime à ta bibliothèque."
        />
      ) : view === 'grid' ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {visible.map((a) => (
              <AnimeCard key={a.id} anime={a} onToggleFavorite={toggleFavorite} onDelete={setToDelete} />
            ))}
          </div>
          {visibleCount < animes.length && (
            <div className="flex justify-center pt-2">
              <Button variant="secondary" onClick={() => setVisibleCount((v) => v + 18)}>Charger plus</Button>
            </div>
          )}
        </>
      ) : (
        <AnimeTable animes={visible} onToggleFavorite={toggleFavorite} onDelete={setToDelete} />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Supprimer cet anime ?"
        message={`"${toDelete?.title}" sera définitivement supprimé de ta bibliothèque. Cette action est irréversible.`}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
