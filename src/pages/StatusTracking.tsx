import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KandidatStatus {
  id: string;
  nama: string;
  status: string;
  catatan_admin: string | null;
  created_at: string;
}

const StatusTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [kandidat, setKandidat] = useState<KandidatStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("kandidat_senma")
        .select("id, nama, status, catatan_admin, created_at")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        navigate("/");
      } else {
        setKandidat(data);
      }
      setLoading(false);
    };

    fetchStatus();

    // Realtime subscription untuk update status
    const channel = supabase
      .channel(`status_${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "kandidat_senma",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setKandidat(payload.new as KandidatStatus);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, navigate]);

  const getStatusProgress = (status: string) => {
    switch (status) {
      case "terkirim":
        return 25;
      case "diterima":
        return 50;
      case "disetujui":
        return 100;
      case "ditolak":
        return 100;
      default:
        return 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "terkirim":
        return "bg-blue-500";
      case "diterima":
        return "bg-yellow-500";
      case "disetujui":
        return "bg-green-500";
      case "ditolak":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <p className="text-muted-foreground">Memuat status...</p>
      </div>
    );
  }

  if (!kandidat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <p className="text-muted-foreground">Data tidak ditemukan</p>
      </div>
    );
  }

  const steps = [
    {
      label: "Terkirim",
      icon: Clock,
      status: "terkirim",
      description: "Data Anda telah terkirim",
    },
    {
      label: "Diterima",
      icon: FileCheck,
      status: "diterima",
      description: "Berkas sedang diverifikasi",
    },
    {
      label: kandidat.status === "ditolak" ? "Ditolak" : "Disetujui",
      icon: kandidat.status === "ditolak" ? XCircle : CheckCircle2,
      status: kandidat.status === "ditolak" ? "ditolak" : "disetujui",
      description: kandidat.status === "ditolak" 
        ? "Berkas tidak memenuhi syarat" 
        : "Selamat! Anda lolos seleksi",
    },
  ];

  const currentStepIndex = steps.findIndex((step) => step.status === kandidat.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Status Pendaftaran
          </h1>
          <p className="text-muted-foreground">
            Pantau status pendaftaran kandidat Senat Mahasiswa Anda
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Halo, {kandidat.nama}!</CardTitle>
            <CardDescription>
              ID Pendaftaran: {kandidat.id.slice(0, 8)}...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <Badge variant={kandidat.status === "ditolak" ? "destructive" : "default"}>
                  {kandidat.status.toUpperCase()}
                </Badge>
              </div>
              <Progress value={getStatusProgress(kandidat.status)} className="h-2" />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div
                    key={step.status}
                    className={`relative p-6 rounded-lg border-2 transition-all ${
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-muted bg-muted/30"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div
                        className={`p-3 rounded-full ${
                          isActive ? getStatusColor(step.status) : "bg-muted"
                        } text-white`}
                      >
                        <StepIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{step.label}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      </div>
                      {isCurrent && (
                        <Badge variant="secondary" className="mt-2">
                          Status Saat Ini
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {kandidat.catatan_admin && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">Catatan Admin</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{kandidat.catatan_admin}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={() => navigate("/")}>
                Kembali ke Beranda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatusTracking;
