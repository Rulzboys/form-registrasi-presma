import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Success = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-secondary via-background to-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="h-20 w-20 text-primary" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-primary">Pendaftaran Berhasil!</h1>
          <p className="text-muted-foreground">
            Terima kasih telah mendaftar sebagai kandidat Ketua Senat Mahasiswa STTI Sony Sugema.
          </p>
          <p className="text-sm text-muted-foreground">
            Data Anda telah tersimpan dan akan segera diproses oleh panitia.
          </p>
        </div>

        <div className="pt-4">
          <Button onClick={() => navigate("/")} className="w-full">
            Kembali ke Halaman Utama
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Success;
