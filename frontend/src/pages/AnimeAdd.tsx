import { AnimeForm } from '../components/anime/AnimeForm';
import { api } from '../services/api';
import type { AnimeInput } from '../types/anime';

export function AnimeAdd() {
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-6 max-w-4xl mx-auto">Ajouter un anime</h1>
      <AnimeForm onSubmit={async (data: AnimeInput) => { await api.createAnime(data); }} />
    </div>
  );
}
