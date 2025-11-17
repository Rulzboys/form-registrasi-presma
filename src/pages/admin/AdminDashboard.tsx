import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [totalKandidat, setTotalKandidat] = useState(0);
  const [avgIpk, setAvgIpk] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Cek apakah user sudah login
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          navigate("/admin-login");
          return;
        }

        // Cek role user dari tabel profiles
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError || profile?.role !== "admin") {
          // Jika bukan admin, logout dan redirect
          await supabase.auth.signOut();
          navigate("/admin-login");
          return;
        }

        // User adalah admin, izinkan akses
        setIsAuthorized(true);
        setIsLoading(false);
      } catch (err) {
        console.error("Error checking auth:", err);
        navigate("/admin/login");
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!isAuthorized) return;

    const fetchStats = async () => {
      const { data, error } = await supabase
        .from("kandidat_senma")
        .select("ipk");

      if (!error && data) {
        setTotalKandidat(data.length);
        if (data.length > 0) {
          const sum = data.reduce((acc, curr) => acc + Number(curr.ipk), 0);
          setAvgIpk(sum / data.length);
        }
      }
    };

    fetchStats();

    // Realtime subscription
    const channel = supabase
      .channel("kandidat_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "kandidat_senma",
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthorized]);

  // Tampilkan loading saat mengecek auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  // Jika tidak authorized, jangan render apapun (akan redirect)
  if (!isAuthorized) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Statistik pendaftaran kandidat Senat Mahasiswa
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="shadow-card hover:shadow-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Kandidat
              </CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {totalKandidat}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Kandidat terdaftar
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rata-rata IPK
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {avgIpk > 0 ? avgIpk.toFixed(2) : "-"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                IPK semua kandidat
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status
              </CardTitle>
              <UserCheck className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">Aktif</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pendaftaran dibuka
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Selamat Datang di Admin Panel</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
