import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { KandidatTable } from "@/components/admin/KandidatTable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Kandidat {
  id: string;
  nama: string;
  semester: number;
  ipk: number;
  jenis_kelamin: string;
  nomor_wa: string;
  email: string;
  status: string;
  created_at: string;
}

const AdminKandidat = () => {
  const [kandidats, setKandidats] = useState<Kandidat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKandidats = async () => {
    const { data, error } = await supabase
      .from("kandidat_senma")
      .select("id, nama, semester, ipk, jenis_kelamin, nomor_wa, email, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Gagal memuat data kandidat");
      console.error(error);
    } else {
      setKandidats(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchKandidats();

    // Realtime subscription
    const channel = supabase
      .channel("kandidat_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "kandidat_senma",
        },
        () => {
          fetchKandidats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("kandidat_senma").delete().eq("id", id);

    if (error) {
      toast.error("Gagal menghapus kandidat");
      console.error(error);
    } else {
      toast.success("Kandidat berhasil dihapus");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Data Kandidat</h2>
          <p className="text-muted-foreground mt-1">
            Kelola data kandidat Senat Mahasiswa
          </p>
        </div>

        <KandidatTable kandidats={kandidats} onDelete={handleDelete} />
      </div>
    </AdminLayout>
  );
};

export default AdminKandidat;
