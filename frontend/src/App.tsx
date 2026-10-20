import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { AnimeList } from './pages/AnimeList';
import { AnimeDetail } from './pages/AnimeDetail';
import { AnimeAdd } from './pages/AnimeAdd';
import { AnimeEdit } from './pages/AnimeEdit';
import { Favorites } from './pages/Favorites';
import { Stats } from './pages/Stats';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/list" element={<AnimeList />} />
          <Route path="/anime/:id" element={<AnimeDetail />} />
          <Route path="/add" element={<AnimeAdd />} />
          <Route path="/edit/:id" element={<AnimeEdit />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}
