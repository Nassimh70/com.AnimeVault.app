import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Upload, Loader2, Sparkles } from 'lucide-react';
import type { Anime, AnimeInput } from '../../types/anime';
import { api } from '../../services/api';
import { Button } from '../ui/Button';
import { useToast } from '../ui/ToastContext';
import { CustomSelect } from '../ui/CustomSelect';

interface Props {
  initial?: Anime;
  onSubmit: (data: AnimeInput) => Promise<void>;
}

const emptyForm: AnimeInput = {
  title: '', titleJapanese: '', image: '', synopsis: '', genres: [], studios: [],
  author: '', episodesTotal: 0, episodesWatched: 0, episodeDuration: 24, releaseDate: '',
  season: '', status: 'a_voir', rating: null, comment: '', priority: 'moyenne',
  platform: 'Crunchyroll', language: 'VOSTFR', malLink: '', aniListLink: '', tags: [],
};

const inputClass = 'anime-form-field text-sm';
const textAreaClass = 'anime-form-field anime-form-textarea text-sm';
const labelClass = 'section-title mb-2 block';

export function AnimeForm({ initial, onSubmit }: Props) {
  const navigate = useNavigate();
  const { show } = useToast();
  const [form, setForm] = useState<AnimeInput>(initial ? { ...initial } : emptyForm);
  const [jikanQuery, setJikanQuery] = useState('');
  const [jikanResults, setJikanResults] = useState<any[]>([]);
  const [jikanLoading, setJikanLoading] = useState(false);
  const [jikanMessage, setJikanMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function runJikanSearch(rawQuery: string) {
    const query = rawQuery.trim();
    if (query.length < 2) {
      show('error', 'Tape au moins 2 caractères pour lancer la recherche automatique.');
      return;
    }

    setJikanLoading(true);
    setJikanMessage('');
    try {
      const results = await api.searchJikan(query);
      setJikanResults(results);
      if (results.length === 0) {
        setJikanMessage('Aucun résultat trouvé pour cette recherche.');
      }
    } catch (e: any) {
      setJikanResults([]);
      setJikanMessage('Recherche automatique indisponible pour le moment.');
    } finally {
      setJikanLoading(false);
    }
  }

  useEffect(() => {
    if (!jikanQuery || jikanQuery.trim().length < 2) { setJikanResults([]); return; }
    const t = setTimeout(async () => {
      await runJikanSearch(jikanQuery);
    }, 500);
    return () => clearTimeout(t);
  }, [jikanQuery]);

  function applyJikanResult(r: any) {
    const sourceLabel = r.source || 'source automatique';
    setForm((f) => ({
      ...f,
      title: r.title,
      titleJapanese: r.titleJapanese,
      image: r.image,
      synopsis: r.synopsis,
      genres: r.genres,
      studios: r.studios,
      episodesTotal: r.episodesTotal,
      episodeDuration: r.episodeDuration,
      rating: r.rating,
      releaseDate: r.releaseDate,
      season: r.season,
      malLink: r.malLink,
    }));
    setJikanResults([]);
    setJikanQuery('');
    show('success', `Informations importées depuis ${sourceLabel} pour "${r.title}"`);
  }

  function set<K extends keyof AnimeInput>(key: K, value: AnimeInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setListField(key: 'genres' | 'studios' | 'tags', raw: string) {
    set(key, raw.split(',').map((s) => s.trim()).filter(Boolean));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await api.uploadImage(file);
      set('image', url);
      show('success', 'Image téléversée avec succès.');
    } catch (err: any) {
      show('error', err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title?.trim()) { show('error', 'Le titre est obligatoire.'); return; }
    setSubmitting(true);
    try {
      await onSubmit(form);
      show('success', initial ? 'Anime mis à jour.' : 'Anime ajouté à ta bibliothèque.');
      navigate('/list');
    } catch (err: any) {
      show('error', err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
      {!initial && (
        <div className="surface rounded-xl2 p-5 md:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-accent" />
            <h3 className="panel-title text-sm">Recherche automatique (MyAnimeList / Jikan)</h3>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              value={jikanQuery}
              onChange={(e) => setJikanQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void runJikanSearch(jikanQuery);
                }
              }}
              placeholder="Tape un nom d'anime pour auto-remplir la fiche…"
              className={`${inputClass} anime-form-search pl-11 pr-12 rounded-full`}
            />
            <button
              type="button"
              onClick={() => void runJikanSearch(jikanQuery)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-gradient-to-r from-accent to-accent-secondary text-white flex items-center justify-center shadow-glow transition-transform hover:scale-105"
              aria-label="Lancer la recherche automatique"
              title="Lancer la recherche automatique"
            >
              {jikanLoading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            </button>
          </div>
          {jikanMessage && !jikanLoading && (
            <p className="mt-2 text-xs text-text-secondary">{jikanMessage}</p>
          )}
          {jikanResults.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
              {jikanResults.map((r) => (
                <button
                  type="button"
                  key={r.malId}
                  onClick={() => applyJikanResult(r)}
                  className="text-left surface hover:border-accent/40 rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
                >
                  <img src={r.image} className="w-full aspect-[2/3] object-cover" loading="lazy" />
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{r.title}</p>
                    <p className="text-[11px] text-text-secondary">{r.episodesTotal || '?'} ép.</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </div>
      )}

      <div className="surface rounded-xl2 p-5 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-1">
          <label className={labelClass}>Image de couverture</label>
          <div className="aspect-[2/3] bg-white/5 rounded-2xl overflow-hidden mb-3 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            {form.image ? <img src={form.image} className="w-full h-full object-cover" /> : <span className="text-text-secondary text-xs">Aucune image</span>}
          </div>
          <label className="flex items-center justify-center gap-2 surface hover:border-accent/30 rounded-2xl py-2.5 text-xs font-semibold cursor-pointer transition-all">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            Téléverser une image
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Titre *</label>
            <input required value={form.title} onChange={(e) => set('title', e.target.value)} className={inputClass} placeholder="One Piece" />
          </div>
          <div>
            <label className={labelClass}>Titre japonais</label>
            <input value={form.titleJapanese} onChange={(e) => set('titleJapanese', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Auteur</label>
            <input value={form.author} onChange={(e) => set('author', e.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Synopsis</label>
            <textarea value={form.synopsis} onChange={(e) => set('synopsis', e.target.value)} rows={4} className={textAreaClass} />
          </div>
          <div>
            <label className={labelClass}>Genres (séparés par virgule)</label>
            <input value={(form.genres || []).join(', ')} onChange={(e) => setListField('genres', e.target.value)} className={inputClass} placeholder="Action, Aventure" />
          </div>
          <div>
            <label className={labelClass}>Studios (séparés par virgule)</label>
            <input value={(form.studios || []).join(', ')} onChange={(e) => setListField('studios', e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="surface rounded-xl2 p-5 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className={labelClass}>Épisodes total</label>
          <input type="number" min={0} value={form.episodesTotal} onChange={(e) => set('episodesTotal', Number(e.target.value))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Épisodes vus</label>
          <input type="number" min={0} value={form.episodesWatched} onChange={(e) => set('episodesWatched', Number(e.target.value))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Durée par épisode (min)</label>
          <input type="number" min={1} value={form.episodeDuration} onChange={(e) => set('episodeDuration', Number(e.target.value))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Saison</label>
          <input value={form.season} onChange={(e) => set('season', e.target.value)} className={inputClass} placeholder="Automne 2024" />
        </div>
        <div>
          <label className={labelClass}>Date de sortie</label>
          <input type="date" value={form.releaseDate} onChange={(e) => set('releaseDate', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Date de fin</label>
          <input type="date" value={form.dateFinished || ''} onChange={(e) => set('dateFinished', e.target.value)} className={inputClass} />
        </div>
          <div>
            <label className={labelClass}>Statut</label>
            <CustomSelect
              value={form.status ?? 'a_voir'}
              onChange={(value) => set('status', value as any)}
              placeholder="Choisir un statut"
              className="w-full"
              options={[
                { value: 'a_voir', label: 'À voir' },
                { value: 'en_cours', label: 'En cours' },
                { value: 'termine', label: 'Terminé' },
                { value: 'pause', label: 'Pause' },
                { value: 'abandonne', label: 'Abandonné' },
              ]}
            />
          </div>
          <div>
            <label className={labelClass}>Priorité</label>
            <CustomSelect
              value={form.priority ?? 'moyenne'}
              onChange={(value) => set('priority', value as any)}
              placeholder="Choisir une priorité"
              className="w-full"
              options={[
                { value: 'haute', label: 'Haute' },
                { value: 'moyenne', label: 'Moyenne' },
                { value: 'faible', label: 'Faible' },
              ]}
            />
          </div>
      </div>

      <div className="surface rounded-xl2 p-5 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className={labelClass}>Note personnelle (/10)</label>
          <input type="number" min={0} max={10} step={0.5} value={form.rating ?? ''} onChange={(e) => set('rating', e.target.value ? Number(e.target.value) : null)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Plateforme</label>
          <CustomSelect
            value={form.platform ?? 'Crunchyroll'}
            onChange={(value) => set('platform', value)}
            placeholder="Choisir une plateforme"
            className="w-full"
            options={['Netflix','Crunchyroll','ADN','Disney+','Prime Video','Autre'].map((platform) => ({ value: platform, label: platform }))}
          />
        </div>
        <div>
          <label className={labelClass}>Langue</label>
          <CustomSelect
            value={form.language ?? 'VOSTFR'}
            onChange={(value) => set('language', value as any)}
            placeholder="Choisir une langue"
            className="w-full"
            options={[
              { value: 'VOSTFR', label: 'VOSTFR' },
              { value: 'VF', label: 'VF' },
              { value: 'VO', label: 'VO' },
            ]}
          />
        </div>
        <div>
          <label className={labelClass}>Tags (séparés par virgule)</label>
          <input value={(form.tags || []).join(', ')} onChange={(e) => setListField('tags', e.target.value)} className={inputClass} placeholder="Chef-d'œuvre, À revoir" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Lien MyAnimeList</label>
          <input value={form.malLink} onChange={(e) => set('malLink', e.target.value)} className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Lien AniList</label>
          <input value={form.aniListLink} onChange={(e) => set('aniListLink', e.target.value)} className={inputClass} />
        </div>
        <div className="col-span-2 md:col-span-4">
          <label className={labelClass}>Commentaire personnel</label>
          <textarea value={form.comment} onChange={(e) => set('comment', e.target.value)} rows={3} className={textAreaClass} />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Annuler</Button>
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 size={15} className="animate-spin" />}
          {initial ? 'Enregistrer les modifications' : "Ajouter à ma bibliothèque"}
        </Button>
      </div>
    </form>
  );
}
