import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Star, Pencil, Trash2, Eye } from 'lucide-react';
import type { Anime } from '../../types/anime';
import { STATUS_LABELS, STATUS_COLORS } from '../../types/anime';
import { Badge } from '../ui/Badge';

interface Props {
  anime: Anime;
  onToggleFavorite: (a: Anime) => void;
  onDelete: (a: Anime) => void;
}

export function AnimeCard({ anime, onToggleFavorite, onDelete }: Props) {
  const progress = anime.episodesTotal > 0 ? Math.min((anime.episodesWatched / anime.episodesTotal) * 100, 100) : 0;

  return (
    <motion.div
      layout
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="group surface rounded-xl2 overflow-hidden shadow-soft"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-bg-secondary">
        {anime.image ? (
          <img
            src={anime.image}
            alt={anime.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm">Pas d'image</div>
        )}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#020713]/85 via-[#020713]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(anime);
          }}
          className={`absolute top-3 right-3 z-10 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all border ${
            anime.isFavorite ? 'bg-error text-white border-white/10 shadow-glow' : 'bg-black/30 text-white border-white/10 hover:bg-error/85'
          }`}
        >
          <Heart size={15} fill={anime.isFavorite ? 'currentColor' : 'none'} />
        </button>

        <div className="absolute top-2.5 left-2.5">
          <Badge color={STATUS_COLORS[anime.status]}>{STATUS_LABELS[anime.status]}</Badge>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
          <Link to={`/anime/${anime.id}`} className="flex-1 bg-white/10 backdrop-blur-md hover:bg-accent text-white rounded-2xl py-2 flex items-center justify-center gap-1 text-xs font-semibold transition-colors">
            <Eye size={13} /> Détails
          </Link>
          <Link to={`/edit/${anime.id}`} className="w-10 h-10 bg-white/10 backdrop-blur-md hover:bg-accent text-white rounded-2xl flex items-center justify-center transition-colors">
            <Pencil size={13} />
          </Link>
          <button onClick={() => onDelete(anime)} className="w-10 h-10 bg-white/10 backdrop-blur-md hover:bg-error text-white rounded-2xl flex items-center justify-center transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="p-3.5">
        <h3 className="font-semibold text-sm truncate mb-1 leading-tight">{anime.title}</h3>
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {anime.genres.slice(0, 2).map((g) => (
            <span key={g} className="text-[11px] text-text-secondary">{g}{anime.genres.indexOf(g) < 1 && anime.genres.length > 1 ? ' ·' : ''}</span>
          ))}
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-secondary">{anime.episodesWatched}/{anime.episodesTotal || '?'} ép.</span>
          {anime.rating !== null && (
            <span className="flex items-center gap-1 text-xs font-semibold text-warning">
              <Star size={12} fill="currentColor" /> {anime.rating}
            </span>
          )}
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent to-accent-secondary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
}
