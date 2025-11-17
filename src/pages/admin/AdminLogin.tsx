import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Cek role user dari tabel profiles
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          setError("Gagal memverifikasi role pengguna");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // Cek apakah user memiliki role admin
        if (profile?.role !== "admin") {
          setError(
            "Akses ditolak. Hanya admin yang dapat login ke halaman ini."
          );
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // Login berhasil dan role adalah admin
        navigate("/admin");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && email && password) {
      handleLogin(e as any);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary via-background to-background">
      <div className="container max-w-md mx-auto px-4 py-12 flex flex-col justify-center min-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-3">Admin Login</h1>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Sistem Pendaftaran Kandidat
          </h2>
          <p className="text-base text-muted-foreground">STTI Sony Sugema</p>
        </div>

        <div className="bg-card rounded-lg shadow-card p-8">
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6" onKeyPress={handleKeyPress}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Admin *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              onClick={handleLogin}
              className="w-full h-12 text-base font-semibold"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Halaman khusus administrator sistem
        </p>
      </div>
    </div>
  );
}
