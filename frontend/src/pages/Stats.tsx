import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import type { Stats as StatsType } from '../types/anime';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';

export function Stats() {
  const [stats, setStats] = useState<StatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 max-w-6xl mx-auto space-y-6"><Skeleton className="h-40" /><Skeleton className="h-72" /></div>;
  if (!stats) return null;

  return (
    <div className="page-shell p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <p className="section-title mb-2">Analyse</p>
        <h1 className="text-3xl font-bold hero-text">Statistiques</h1>
        <p className="text-text-secondary text-sm">Un aperçu détaillé de tes habitudes de visionnage.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ['Animes terminés', stats.termine],
          ['Épisodes vus', stats.totalEpisodesWatched],
          ['Heures regardées', stats.totalHoursWatched],
          ['Favoris', stats.favoriteCount],
        ].map(([label, value]) => (
          <Card key={label as string} className="p-5">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-text-secondary mt-1">{label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="font-semibold mb-5">Genres préférés</h2>
        {stats.genreDistribution.length === 0 ? <p className="text-sm text-text-secondary">Pas encore de données.</p> : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.genreDistribution.slice(0, 8)} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" stroke="#94A3B8" fontSize={12} allowDecimals={false} />
              <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={12} width={90} />
              <Tooltip contentStyle={{ background: '#1A2333', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
              <Bar dataKey="value" fill="#6366F1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-5">Studios préférés</h2>
        {stats.studioDistribution.length === 0 ? <p className="text-sm text-text-secondary">Pas encore de données.</p> : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.studioDistribution.slice(0, 8)} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" stroke="#94A3B8" fontSize={12} allowDecimals={false} />
              <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={12} width={110} />
              <Tooltip contentStyle={{ background: '#1A2333', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} cursor={{ fill: 'rgba(139,92,246,0.08)' }} />
              <Bar dataKey="value" fill="#8B5CF6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-5">Répartition des notes</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stats.ratingDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="rating" stroke="#94A3B8" fontSize={12} />
            <YAxis stroke="#94A3B8" fontSize={12} allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#1A2333', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} cursor={{ fill: 'rgba(34,197,94,0.08)' }} />
            <Bar dataKey="count" fill="#22C55E" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
