import { useRef, useState } from 'react';
import { Upload, Download, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/ToastContext';
import { api } from '../services/api';

export function Settings() {
  const { show } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const animes = json.animes || json;
      const result = await api.importJSON(animes);
      show('success', `${result.imported}/${result.total} animes importés avec succès.`);
    } catch (err: any) {
      show('error', `Échec de l'import : ${err.message}`);
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="page-shell p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <p className="section-title mb-2">Préférences</p>
        <h1 className="text-3xl font-bold hero-text">Paramètres</h1>
        <p className="text-text-secondary text-sm">Gère ta bibliothèque et tes préférences.</p>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="panel-title">Sauvegarde & données</h2>
        <p className="text-sm text-text-secondary">
          Toutes tes modifications sont enregistrées automatiquement dans la base SQLite — aucune action manuelle requise.
        </p>
        <div className="flex flex-wrap gap-3">
          <a href={api.exportJSONUrl}><Button variant="secondary" icon={<Download size={15} />}>Exporter en JSON</Button></a>
          <a href={api.exportCSVUrl}><Button variant="secondary" icon={<Download size={15} />}>Exporter en CSV</Button></a>
          <Button variant="outline" icon={<Upload size={15} />} disabled={importing} onClick={() => fileRef.current?.click()}>
            {importing ? 'Import en cours…' : 'Importer un JSON'}
          </Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
        </div>
      </Card>

      <Card className="p-6 space-y-4 border-error/20">
        <h2 className="font-semibold text-error flex items-center gap-2"><Trash2 size={16} /> Zone de danger</h2>
        <p className="text-sm text-text-secondary">
          La suppression d'un anime est irréversible. Utilise l'export régulier pour garder une sauvegarde de ta bibliothèque.
        </p>
      </Card>
    </div>
  );
}
