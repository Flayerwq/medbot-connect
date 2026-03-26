import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Upload, Download, Trash2, Loader2, Eye } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  file_name: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

export default function Reports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchReports = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setReports(data);
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, [user]);

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim() || !user) return;
    setUploading(true);

    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage.from('medical-reports').upload(path, file);
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('medical-reports').getPublicUrl(path);

      await supabase.from('reports').insert({
        user_id: user.id,
        title: title.trim(),
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
      });

      setTitle('');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      await fetchReports();
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const deleteReport = async (report: Report) => {
    const path = report.file_url.split('/medical-reports/')[1];
    if (path) await supabase.storage.from('medical-reports').remove([path]);
    await supabase.from('reports').delete().eq('id', report.id);
    setReports((prev) => prev.filter((r) => r.id !== report.id));
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl fade-in">
      <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1.5 tracking-tight">Medical Reports</h1>
      <p className="text-muted-foreground text-sm mb-8">Upload and manage your medical documents</p>

      <form onSubmit={upload} className="glass-card p-6 mb-8">
        <h2 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Upload className="h-4 w-4 text-primary" />
          </div>
          Upload Report
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Report Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Blood Test Results" className="bg-muted/30 border-border rounded-xl h-11" required />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">File (PDF / Image)</Label>
            <Input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setFile(e.target.files?.[0] || null)} className="bg-muted/30 border-border rounded-xl h-11" required />
          </div>
        </div>
        <Button type="submit" variant="glow" className="rounded-xl" disabled={uploading}>
          {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</> : <><Upload className="h-4 w-4" /> Upload</>}
        </Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">No reports uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {reports.map((r) => (
            <div key={r.id} className="glass-card-hover p-4 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate text-sm">{r.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{r.file_name} · {new Date(r.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-1.5">
                <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 hover:bg-muted" asChild>
                  <a href={r.file_url} target="_blank" rel="noopener noreferrer"><Eye className="h-4 w-4" /></a>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 hover:bg-muted" asChild>
                  <a href={r.file_url} download><Download className="h-4 w-4" /></a>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 hover:bg-destructive/10" onClick={() => deleteReport(r)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
