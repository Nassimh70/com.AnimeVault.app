import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Library, CheckCircle2, PlayCircle, Clock3, Star, TrendingUp } from 'lucide-react';
import { api } from '../services/api';
import type { Stats, Anime } from '../types/anime';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { STATUS_LABELS, STATUS_COLORS } from '../types/anime';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const statCards = [
  { key: 'total', label: 'Total animes', icon: Library, color: '#6366F1' },
  { key: 'termine', label: 'Terminés', icon: CheckCircle2, color: '#22C55E' },
  { key: 'enCours', label: 'En cours', icon: PlayCircle, color: '#8B5CF6' },
  { key: 'aVoir', label: 'À voir', icon: Clock3, color: '#F59E0B' },
] as const;

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, animes] = await Promise.all([api.getStats(), api.getAnimes({ sortBy: 'createdAt', order: 'desc' })]);
        setStats(s);
        setRecent(animes.slice(0, 6));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pieData = stats
    ? [
        { name: 'Terminés', value: stats.termine, color: STATUS_COLORS.termine },
        { name: 'En cours', value: stats.enCours, color: STATUS_COLORS.en_cours },
        { name: 'À voir', value: stats.aVoir, color: STATUS_COLORS.a_voir },
        { name: 'Pause', value: stats.pause, color: STATUS_COLORS.pause },
        { name: 'Abandonné', value: stats.abandonne, color: STATUS_COLORS.abandonne },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="page-shell p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="section-title mb-2">Bibliothèque</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-1 hero-text">Bon retour, Nassim</h1>
        <p className="text-text-secondary text-sm">Voici un aperçu de ta bibliothèque d'animes.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ key, label, icon: Icon, color }, i) => (
          <motion.div key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5">
              {loading ? <Skeleton className="h-16" /> : (
                <>
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3 border border-white/10" style={{ backgroundColor: `${color}18`, color }}>
                    <Icon size={19} />
                  </div>
                  <p className="text-2xl font-bold">{stats?.[key] ?? 0}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{label}</p>
                </>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold panel-title">Ajoutés récemment</h2>
            <Link to="/list" className="text-xs text-accent hover:underline">Voir tout</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">{Array.from({length:6}).map((_,i)=><Skeleton key={i} className="aspect-[2/3]" />)}</div>
          ) : recent.length === 0 ? (
            <p className="text-sm text-text-secondary">Aucun anime pour l'instant. Ajoute ton premier anime !</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {recent.map((a) => (
                <Link key={a.id} to={`/anime/${a.id}`} className="group">
                  <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-bg-secondary mb-1.5 border border-white/8">
                    {a.image && <img src={a.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                  </div>
                  <p className="text-xs truncate">{a.title}</p>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-5 panel-title">Répartition</h2>
          {loading ? <Skeleton className="h-48" /> : pieData.length === 0 ? (
            <p className="text-sm text-text-secondary">Pas encore de données.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                  {pieData.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0D1728', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs text-text-secondary">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-accent/15 border border-white/10 flex items-center justify-center text-accent"><TrendingUp size={20} /></div>
          <div>
            <p className="text-lg font-bold">{stats?.totalHoursWatched ?? 0}h</p>
            <p className="text-xs text-text-secondary">Temps total regardé</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-warning/15 border border-white/10 flex items-center justify-center text-warning"><Clock3 size={20} /></div>
          <div>
            <p className="text-lg font-bold">{stats?.remainingHours ?? 0}h restantes</p>
            <p className="text-xs text-text-secondary">{stats?.remainingEpisodes ?? 0} épisodes à voir</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-error/15 border border-white/10 flex items-center justify-center text-error"><Star size={20} /></div>
          <div>
            <p className="text-lg font-bold">{stats?.favoriteCount ?? 0}</p>
            <p className="text-xs text-text-secondary">Favoris</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
