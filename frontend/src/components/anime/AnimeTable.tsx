import { Link } from 'react-router-dom';
import { Heart, Pencil, Trash2, Star } from 'lucide-react';
import type { Anime } from '../../types/anime';
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS } from '../../types/anime';
import { Badge } from '../ui/Badge';

interface Props {
  animes: Anime[];
  onToggleFavorite: (a: Anime) => void;
  onDelete: (a: Anime) => void;
}

export function AnimeTable({ animes, onToggleFavorite, onDelete }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl2 surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-text-secondary border-b border-white/10 bg-white/[0.03]">
            <th className="px-4 py-4 font-semibold">Anime</th>
            <th className="px-4 py-4 font-semibold">Statut</th>
            <th className="px-4 py-4 font-semibold">Progression</th>
            <th className="px-4 py-4 font-semibold">Priorité</th>
            <th className="px-4 py-4 font-semibold">Note</th>
            <th className="px-4 py-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {animes.map((a) => (
            <tr key={a.id} className="border-b border-white/10 last:border-0 hover:bg-white/[0.04] transition-colors">
              <td className="px-4 py-4">
                <Link to={`/anime/${a.id}`} className="flex items-center gap-3">
                  <img src={a.image || undefined} className="w-10 h-14 object-cover rounded-xl bg-bg-secondary shrink-0 border border-white/8" />
                  <span className="font-semibold truncate max-w-[220px]">{a.title}</span>
                </Link>
              </td>
              <td className="px-4 py-4"><Badge color={STATUS_COLORS[a.status]}>{STATUS_LABELS[a.status]}</Badge></td>
              <td className="px-4 py-4 text-text-secondary">{a.episodesWatched}/{a.episodesTotal || '?'}</td>
              <td className="px-4 py-4 text-text-secondary">{PRIORITY_LABELS[a.priority]}</td>
              <td className="px-4 py-4">
                {a.rating !== null ? (
                  <span className="flex items-center gap-1 text-warning font-semibold"><Star size={12} fill="currentColor" />{a.rating}</span>
                ) : <span className="text-text-secondary">—</span>}
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-end gap-1">
                  <button type="button" onClick={() => onToggleFavorite(a)} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${a.isFavorite ? 'bg-error/15 text-error' : 'text-text-secondary hover:bg-white/8 hover:text-error'}`}>
                    <Heart size={15} fill={a.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <Link to={`/edit/${a.id}`} className="w-9 h-9 rounded-xl flex items-center justify-center text-text-secondary hover:bg-white/8 hover:text-accent transition-colors">
                    <Pencil size={15} />
                  </Link>
                  <button onClick={() => onDelete(a)} className="w-9 h-9 rounded-xl flex items-center justify-center text-text-secondary hover:bg-white/8 hover:text-error transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
