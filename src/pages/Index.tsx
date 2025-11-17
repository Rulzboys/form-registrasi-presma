import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/registration/FileUpload";
import { ImagePreview } from "@/components/registration/ImagePreview";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2,
  User,
  Mail,
  Phone,
  Award,
  Target,
  FileText,
  Camera,
  BookOpen,
  TrendingUp,
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [formData, setFormData] = useState({
    nama: "",
    nim: "",
    semester: "",
    ipk: "",
    pengalaman: "",
    visi_misi: "",
    nomor_wa: "",
    email: "",
    jenis_kelamin: "",
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [sertifikat, setSertifikat] = useState<File[]>([]);

  useEffect(() => {
    const checkExistingRegistration = async () => {
      const existingId = localStorage.getItem("kandidat_registration_id");

      if (existingId) {
        try {
          const { data, error } = await supabase
            .from("kandidat_senma")
            .select("id")
            .eq("id", existingId)
            .maybeSingle();

          if (!error && data) {
            toast.info(
              "Anda sudah terdaftar, mengarahkan ke halaman status..."
            );
            navigate(`/status/${existingId}`);
            return;
          } else {
            localStorage.removeItem("kandidat_registration_id");
          }
        } catch (error) {
          console.error("Error checking registration:", error);
          localStorage.removeItem("kandidat_registration_id");
        }
      }

      setCheckingRegistration(false);
    };

    checkExistingRegistration();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!foto) {
      toast.error("Foto kandidat wajib diupload");
      return;
    }

    if (sertifikat.length === 0) {
      toast.error("Minimal 1 sertifikat harus diupload");
      return;
    }

    setLoading(true);

    try {
      const fotoFileName = `${crypto.randomUUID()}-${foto.name}`;
      const { error: fotoError } = await supabase.storage
        .from("kandidat-foto")
        .upload(fotoFileName, foto);

      if (fotoError) throw fotoError;

      const { data: fotoData } = supabase.storage
        .from("kandidat-foto")
        .getPublicUrl(fotoFileName);

      const sertifikatUrls: string[] = [];
      for (const file of sertifikat) {
        const fileName = `${crypto.randomUUID()}-${file.name}`;
        const { error: certError } = await supabase.storage
          .from("kandidat-sertifikat")
          .upload(fileName, file);

        if (certError) throw certError;

        const { data: certData } = supabase.storage
          .from("kandidat-sertifikat")
          .getPublicUrl(fileName);

        sertifikatUrls.push(certData.publicUrl);
      }

      const { data, error: insertError } = await supabase
        .from("kandidat_senma")
        .insert({
          nama: formData.nama,
          nim: formData.nim,
          semester: parseInt(formData.semester),
          ipk: parseFloat(formData.ipk),
          pengalaman: formData.pengalaman,
          visi_misi: formData.visi_misi,
          foto_url: fotoData.publicUrl,
          sertifikat_urls: sertifikatUrls,
          nomor_wa: formData.nomor_wa,
          email: formData.email,
          jenis_kelamin: formData.jenis_kelamin,
        })
        .select();

      if (insertError) throw insertError;

      localStorage.setItem("kandidat_registration_id", data[0].id);

      toast.success("Pendaftaran berhasil!");
      navigate(`/status/${data[0].id}`);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Gagal mendaftar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingRegistration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
          <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600 font-medium text-sm sm:text-base">
            Memeriksa data registrasi...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 sm:py-8 md:py-12 px-3 sm:px-4">
      <div className="container max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div className="flex justify-center mb-4 sm:mb-6">
            <img
              src="/icons.png"
              alt="Logo"
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 object-contain"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-3 px-4">
            Pendaftaran Kandidat
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 mb-2 sm:mb-3 px-4">
            Ketua Senat Mahasiswa
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Sekolah Tinggi Teknologi Informatika Sony Sugema
          </p>
          <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 text-xs sm:text-sm text-indigo-600">
            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Tahun Akademik 2025/2026</span>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-indigo-100">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6">
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Formulir Pendaftaran
            </h3>
            <p className="text-indigo-100 mt-1 text-xs sm:text-sm">
              Lengkapi semua data dengan benar dan akurat
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8"
          >
            {/* Section: Foto Kandidat */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-indigo-100">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <Label className="text-base sm:text-lg font-bold text-gray-800">
                    Foto Kandidat
                  </Label>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                    Upload foto formal dengan latar belakang netral
                  </p>
                </div>
              </div>
              <FileUpload
                label=""
                accept="image/*"
                value={foto ? [foto] : []}
                onChange={(files) => setFoto(files[0] || null)}
              />
              {foto && (
                <div className="mt-3 sm:mt-4">
                  <ImagePreview file={foto} onRemove={() => setFoto(null)} />
                </div>
              )}
            </div>

            {/* Section: Data Pribadi */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-800">
                  Data Pribadi
                </h4>
              </div>

              <div className="grid gap-4 sm:gap-6">
                <div className="group">
                  <Label
                    htmlFor="nama"
                    className="text-sm sm:text-base font-semibold text-gray-700 mb-2 flex items-center gap-2"
                  >
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
                    Nama Lengkap
                  </Label>
                  <Input
                    id="nama"
                    required
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
                    }
                    placeholder="Masukkan nama lengkap"
                    className="h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-indigo-500 rounded-lg sm:rounded-xl transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="group">
                    <Label
                      htmlFor="nim"
                      className="text-sm sm:text-base font-semibold text-gray-700 mb-2 flex items-center gap-2"
                    >
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
                      NIM
                    </Label>
                    <Input
                      id="nim"
                      required
                      value={formData.nim}
                      onChange={(e) =>
                        setFormData({ ...formData, nim: e.target.value })
                      }
                      placeholder="Masukkan NIM"
                      className="h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-indigo-500 rounded-lg sm:rounded-xl transition-colors"
                    />
                  </div>

                  <div className="group">
                    <Label
                      htmlFor="jenis_kelamin"
                      className="text-sm sm:text-base font-semibold text-gray-700 mb-2"
                    >
                      Jenis Kelamin
                    </Label>
                    <Select
                      value={formData.jenis_kelamin}
                      onValueChange={(value) =>
                        setFormData({ ...formData, jenis_kelamin: value })
                      }
                    >
                      <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-indigo-500 rounded-lg sm:rounded-xl">
                        <SelectValue placeholder="Pilih jenis kelamin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                        <SelectItem value="Perempuan">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Data Akademik */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-800">
                  Data Akademik
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="group">
                  <Label
                    htmlFor="semester"
                    className="text-sm sm:text-base font-semibold text-gray-700 mb-2 flex items-center gap-2"
                  >
                    <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
                    Semester
                  </Label>
                  <Input
                    id="semester"
                    type="number"
                    required
                    min="1"
                    max="14"
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData({ ...formData, semester: e.target.value })
                    }
                    placeholder="Contoh: 5"
                    className="h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-indigo-500 rounded-lg sm:rounded-xl transition-colors"
                  />
                </div>

                <div className="group">
                  <Label
                    htmlFor="ipk"
                    className="text-sm sm:text-base font-semibold text-gray-700 mb-2 flex items-center gap-2"
                  >
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
                    IPK Semester Sebelumnya
                  </Label>
                  <Input
                    id="ipk"
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    max="4"
                    value={formData.ipk}
                    onChange={(e) =>
                      setFormData({ ...formData, ipk: e.target.value })
                    }
                    placeholder="Contoh: 3.75"
                    className="h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-indigo-500 rounded-lg sm:rounded-xl transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Section: Pengalaman & Visi Misi */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-800">
                  Pengalaman & Visi Misi
                </h4>
              </div>

              <div className="group">
                <Label
                  htmlFor="pengalaman"
                  className="text-sm sm:text-base font-semibold text-gray-700 mb-2 flex items-center gap-2"
                >
                  <Award className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
                  Pengalaman Organisasi
                </Label>
                <Textarea
                  id="pengalaman"
                  required
                  value={formData.pengalaman}
                  onChange={(e) =>
                    setFormData({ ...formData, pengalaman: e.target.value })
                  }
                  placeholder="Jelaskan pengalaman organisasi Anda dengan detail..."
                  rows={5}
                  className="text-sm sm:text-base border-2 border-gray-200 focus:border-indigo-500 rounded-lg sm:rounded-xl transition-colors resize-none"
                />
              </div>

              <div className="group">
                <Label
                  htmlFor="visi_misi"
                  className="text-sm sm:text-base font-semibold text-gray-700 mb-2 flex items-center gap-2"
                >
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
                  Visi dan Misi
                </Label>
                <Textarea
                  id="visi_misi"
                  required
                  value={formData.visi_misi}
                  onChange={(e) =>
                    setFormData({ ...formData, visi_misi: e.target.value })
                  }
                  placeholder="Jelaskan visi dan misi Anda sebagai Ketua Senat Mahasiswa..."
                  rows={6}
                  className="text-sm sm:text-base border-2 border-gray-200 focus:border-indigo-500 rounded-lg sm:rounded-xl transition-colors resize-none"
                />
              </div>
            </div>

            {/* Section: Sertifikat */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-100">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <Label className="text-base sm:text-lg font-bold text-gray-800">
                    Sertifikat
                  </Label>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                    Upload sertifikat organisasi atau kegiatan (minimal 1 file)
                  </p>
                </div>
              </div>
              <FileUpload
                label=""
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                value={sertifikat}
                onChange={setSertifikat}
              />
            </div>

            {/* Section: Kontak */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-800">
                  Informasi Kontak
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="group">
                  <Label
                    htmlFor="nomor_wa"
                    className="text-sm sm:text-base font-semibold text-gray-700 mb-2 flex items-center gap-2"
                  >
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
                    Nomor WhatsApp
                  </Label>
                  <Input
                    id="nomor_wa"
                    type="tel"
                    required
                    value={formData.nomor_wa}
                    onChange={(e) =>
                      setFormData({ ...formData, nomor_wa: e.target.value })
                    }
                    placeholder="Contoh: 081234567890"
                    className="h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-indigo-500 rounded-lg sm:rounded-xl transition-colors"
                  />
                </div>

                <div className="group">
                  <Label
                    htmlFor="email"
                    className="text-sm sm:text-base font-semibold text-gray-700 mb-2 flex items-center gap-2"
                  >
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="email@example.com"
                    className="h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-indigo-500 rounded-lg sm:rounded-xl transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 sm:pt-6">
              <Button
                type="submit"
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    Memproses Pendaftaran...
                  </>
                ) : (
                  <>Daftar Sekarang</>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-600 px-4">
          <p>
            Pastikan semua data yang Anda masukkan sudah benar sebelum
            mengirimkan formulir
          </p>
          <p className="mt-2">
            Hubungi panitia jika mengalami kendala dalam pendaftaran
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
