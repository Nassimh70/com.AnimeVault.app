export type AnimeStatus = 'a_voir' | 'en_cours' | 'termine' | 'pause' | 'abandonne';
export type Priority = 'haute' | 'moyenne' | 'faible';
export type Language = 'VOSTFR' | 'VF' | 'VO';

export interface Anime {
  id: string;
  title: string;
  titleJapanese: string;
  image: string;
  synopsis: string;
  genres: string[];
  studios: string[];
  author: string;
  episodesTotal: number;
  episodesWatched: number;
  episodeDuration: number;
  releaseDate: string;
  season: string;
  status: AnimeStatus;
  rating: number | null;
  comment: string;
  priority: Priority;
  platform: string;
  language: Language;
  malLink: string;
  aniListLink: string;
  isFavorite: boolean;
  tags: string[];
  collections: string[];
  dateAdded: string;
  dateFinished: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AnimeInput = Partial<Omit<Anime, 'id' | 'createdAt' | 'updatedAt'>> & { title: string };

export interface Stats {
  total: number;
  termine: number;
  enCours: number;
  aVoir: number;
  pause: number;
  abandonne: number;
  totalEpisodesWatched: number;
  totalHoursWatched: number;
  remainingEpisodes: number;
  remainingHours: number;
  favoriteCount: number;
  genreDistribution: { name: string; value: number }[];
  studioDistribution: { name: string; value: number }[];
  ratingDistribution: { rating: number; count: number }[];
  lastAdded: Anime | null;
}

export const STATUS_LABELS: Record<AnimeStatus, string> = {
  a_voir: 'À voir',
  en_cours: 'En cours',
  termine: 'Terminé',
  pause: 'Pause',
  abandonne: 'Abandonné',
};

export const STATUS_COLORS: Record<AnimeStatus, string> = {
  a_voir: '#94A3B8',
  en_cours: '#6366F1',
  termine: '#22C55E',
  pause: '#F59E0B',
  abandonne: '#EF4444',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  haute: 'Haute',
  moyenne: 'Moyenne',
  faible: 'Faible',
};
