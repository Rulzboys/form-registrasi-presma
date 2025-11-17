import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Settings, LogOut, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Logout dari Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      // Tampilkan notifikasi sukses
      toast({
        title: "Berhasil keluar",
        description: "Anda telah keluar dari sistem",
      });

      // Redirect ke halaman login
      navigate("/admin-login");
    } catch (error) {
      console.error("Error saat logout:", error);

      toast({
        title: "Gagal keluar",
        description: "Terjadi kesalahan saat logout. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Pengaturan</h2>
          <p className="text-muted-foreground mt-1">Kelola pengaturan sistem</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Akun
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Kelola akun dan sesi login Anda
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowLogoutDialog(true)}
                  variant="destructive"
                  className="flex items-center gap-2"
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sedang keluar...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
                      Keluar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Konfirmasi Logout */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Keluar</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin keluar dari sistem? Anda perlu login
              kembali untuk mengakses halaman admin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sedang keluar...
                </>
              ) : (
                "Oke"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminSettings;
