import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Pencil, Trash2, Minus, Plus, ExternalLink, Star } from 'lucide-react';
import { api } from '../services/api';
import type { Anime } from '../types/anime';
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS } from '../types/anime';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/ToastContext';

export function AnimeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { show } = useToast();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const a = await api.getAnime(id);
      setAnime(a);
    } catch (e: any) {
      show('error', e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function handleProgress(direction: 'increment' | 'decrement') {
    if (!id) return;
    const updated = await api.updateProgress(id, direction);
    setAnime(updated);
  }

  async function toggleFavorite() {
    if (!anime) return;
    const updated = await api.updateAnime(anime.id, { isFavorite: !anime.isFavorite } as any);
    setAnime(updated);
  }

  async function handleDelete() {
    if (!anime) return;
    await api.deleteAnime(anime.id);
    show('success', 'Anime supprimé.');
    navigate('/list');
  }

  if (loading) {
    return <div className="p-8 max-w-5xl mx-auto"><Skeleton className="h-96" /></div>;
  }
  if (!anime) return null;

  const progress = anime.episodesTotal > 0 ? Math.min((anime.episodesWatched / anime.episodesTotal) * 100, 100) : 0;

  return (
    <div className="page-shell p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="surface rounded-xl2 overflow-hidden aspect-[2/3] bg-bg-secondary">
          {anime.image && <img src={anime.image} className="w-full h-full object-cover" />}
        </motion.div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge color={STATUS_COLORS[anime.status]}>{STATUS_LABELS[anime.status]}</Badge>
                <Badge color="#F59E0B">{PRIORITY_LABELS[anime.priority]}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold hero-text">{anime.title}</h1>
              {anime.titleJapanese && <p className="text-text-secondary text-sm">{anime.titleJapanese}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={toggleFavorite} className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all ${anime.isFavorite ? 'bg-error/15 border-error/30 text-error shadow-glow' : 'bg-white/5 border-white/10 text-text-secondary hover:text-error hover:border-error/30'}`}>
                <Heart size={17} fill={anime.isFavorite ? 'currentColor' : 'none'} />
              </button>
              <Button variant="secondary" icon={<Pencil size={15} />} onClick={() => navigate(`/edit/${anime.id}`)}>Modifier</Button>
              <Button variant="danger" icon={<Trash2 size={15} />} onClick={() => setConfirmDelete(true)} />
            </div>
          </div>

          <p className="text-sm text-text-secondary leading-relaxed">{anime.synopsis || 'Aucun synopsis renseigné.'}</p>

          <div className="flex flex-wrap gap-2">
            {anime.genres.map((g) => <Badge key={g}>{g}</Badge>)}
            {anime.tags.map((t) => <Badge key={t} color="#8B5CF6">{t}</Badge>)}
          </div>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Progression</span>
              <span className="text-sm text-text-secondary">{anime.episodesWatched} / {anime.episodesTotal || '?'} épisodes</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4">
              <motion.div className="h-full bg-gradient-to-r from-accent to-accent-secondary" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleProgress('decrement')} className="w-10 h-10 rounded-2xl surface hover:bg-white/10 flex items-center justify-center transition-colors"><Minus size={15} /></button>
              <button onClick={() => handleProgress('increment')} className="w-10 h-10 rounded-2xl bg-gradient-to-r from-accent to-accent-secondary hover:brightness-110 flex items-center justify-center shadow-glow transition-all"><Plus size={15} /></button>
              <span className="text-xs text-text-secondary ml-2">Cliquez pour mettre à jour votre progression</span>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 space-y-3">
          <h3 className="panel-title text-sm mb-2">Informations</h3>
          {[
            ['Studios', anime.studios.join(', ') || '—'],
            ['Auteur', anime.author || '—'],
            ['Saison', anime.season || '—'],
            ['Date de sortie', anime.releaseDate || '—'],
            ['Plateforme', anime.platform || '—'],
            ['Langue', anime.language],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-text-secondary">{label}</span>
              <span>{value}</span>
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            {anime.malLink && <a href={anime.malLink} target="_blank" rel="noreferrer" className="text-xs text-accent flex items-center gap-1 hover:underline"><ExternalLink size={12} />MyAnimeList</a>}
            {anime.aniListLink && <a href={anime.aniListLink} target="_blank" rel="noreferrer" className="text-xs text-accent flex items-center gap-1 hover:underline"><ExternalLink size={12} />AniList</a>}
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <h3 className="panel-title text-sm mb-2">Ma note & avis</h3>
          {anime.rating !== null ? (
            <div className="flex items-center gap-2 text-warning">
              <Star size={20} fill="currentColor" />
              <span className="text-xl font-bold">{anime.rating}/10</span>
            </div>
          ) : <p className="text-sm text-text-secondary">Pas encore noté.</p>}
          <p className="text-sm text-text-secondary">{anime.comment || 'Aucun commentaire.'}</p>
          <div className="pt-2 text-xs text-text-secondary space-y-1">
            <p>Ajouté le {new Date(anime.dateAdded).toLocaleDateString('fr-FR')}</p>
            {anime.dateFinished && <p>Terminé le {new Date(anime.dateFinished).toLocaleDateString('fr-FR')}</p>}
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Supprimer cet anime ?"
        message={`"${anime.title}" sera définitivement supprimé. Cette action est irréversible.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
