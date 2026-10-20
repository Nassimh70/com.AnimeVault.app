import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';

export function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 px-4 md:px-6 py-4 flex items-center justify-between border-b border-white/10 bg-bg/55 backdrop-blur-2xl shadow-[0_12px_40px_rgba(1,6,17,0.22)]">
      <div>
        <p className="text-sm text-text-secondary">Bienvenue sur</p>
        <h1 className="text-lg font-semibold">Anime Vault</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button icon={<Plus size={16} />} onClick={() => navigate('/add')}>
          Ajouter un anime
        </Button>
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-sm font-semibold shadow-glow">
          N
        </div>
      </div>
    </header>
  );
}
