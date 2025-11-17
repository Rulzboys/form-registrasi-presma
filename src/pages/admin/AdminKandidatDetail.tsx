import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileCheck,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  Edit,
  Save,
  X,
  Upload,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface KandidatDetail {
  id: string;
  nama: string;
  nim: string;
  semester: number;
  ipk: number;
  pengalaman: string;
  visi_misi: string;
  foto_url: string;
  sertifikat_urls: string[];
  nomor_wa: string;
  email: string;
  jenis_kelamin: string;
  status: string;
  catatan_admin: string | null;
  created_at: string;
}

const AdminKandidatDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [kandidat, setKandidat] = useState<KandidatDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [catatan, setCatatan] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<KandidatDetail | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [uploadingSertifikat, setUploadingSertifikat] = useState<number | null>(
    null
  );

  const fetchKandidat = async () => {
    const { data, error } = await supabase
      .from("kandidat_senma")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Gagal memuat data kandidat");
      console.error(error);
      navigate("/admin/kandidat");
    } else {
      setKandidat(data);
      setEditedData(data);
      setCatatan(data.catatan_admin ?? "");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) {
      fetchKandidat();
    }
  }, [id, navigate]);

  const updateStatus = async (newStatus: string) => {
    if (!id) return;

    const { error } = await supabase
      .from("kandidat_senma")
      .update({ status: newStatus, catatan_admin: catatan })
      .eq("id", id);

    if (error) {
      toast.error("Gagal mengubah status");
      console.error(error);
    } else {
      toast.success(`Status berhasil diubah menjadi ${newStatus}`);
      fetchKandidat();
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit, reset data
      setEditedData(kandidat);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!id || !editedData) return;

    setSaving(true);

    const { error } = await supabase
      .from("kandidat_senma")
      .update({
        nama: editedData.nama,
        nim: editedData.nim,
        semester: editedData.semester,
        ipk: editedData.ipk,
        pengalaman: editedData.pengalaman,
        visi_misi: editedData.visi_misi,
        nomor_wa: editedData.nomor_wa,
        email: editedData.email,
        jenis_kelamin: editedData.jenis_kelamin,
        foto_url: editedData.foto_url,
        sertifikat_urls: editedData.sertifikat_urls,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      toast.error("Gagal menyimpan perubahan");
      console.error(error);
    } else {
      toast.success("Data kandidat berhasil diperbarui");
      setIsEditing(false);
      fetchKandidat();
    }
  };

  const handleInputChange = (field: keyof KandidatDetail, value: any) => {
    if (editedData) {
      setEditedData({ ...editedData, [field]: value });
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    // Upload dengan options yang lebih lengkap
    const { error: uploadError, data } = await supabase.storage
      .from("kandidat-files")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Upload error details:", uploadError);
      throw uploadError;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("kandidat-files").getPublicUrl(filePath);

    return publicUrl;
  };

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setUploadingFoto(true);

    try {
      const publicUrl = await uploadFile(file, "foto");
      handleInputChange("foto_url", publicUrl);
      toast.success("Foto berhasil diupload");
    } catch (error: any) {
      console.error("Error uploading foto:", error);

      // Tampilkan pesan error yang lebih detail
      if (error.message?.includes("row-level security")) {
        toast.error(
          "Error: Tidak ada permission untuk upload. Pastikan Storage Policy sudah di-set!"
        );
      } else if (error.message?.includes("bucket")) {
        toast.error(
          "Error: Bucket 'kandidat-files' tidak ditemukan. Buat bucket terlebih dahulu!"
        );
      } else {
        toast.error(
          `Gagal mengupload foto: ${error.message || "Unknown error"}`
        );
      }
    } finally {
      setUploadingFoto(false);
      // Reset input file
      e.target.value = "";
    }
  };

  const handleSertifikatUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran file (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 10MB");
      return;
    }

    setUploadingSertifikat(index);

    try {
      const publicUrl = await uploadFile(file, "sertifikat");
      const newUrls = [...editedData!.sertifikat_urls];
      newUrls[index] = publicUrl;
      handleInputChange("sertifikat_urls", newUrls);
      toast.success("Sertifikat berhasil diupload");
    } catch (error: any) {
      console.error("Error uploading sertifikat:", error);

      // Tampilkan pesan error yang lebih detail
      if (error.message?.includes("row-level security")) {
        toast.error(
          "Error: Tidak ada permission untuk upload. Pastikan Storage Policy sudah di-set!"
        );
      } else if (error.message?.includes("bucket")) {
        toast.error(
          "Error: Bucket 'kandidat-files' tidak ditemukan. Buat bucket terlebih dahulu!"
        );
      } else {
        toast.error(
          `Gagal mengupload sertifikat: ${error.message || "Unknown error"}`
        );
      }
    } finally {
      setUploadingSertifikat(null);
      // Reset input file
      e.target.value = "";
    }
  };

  const handleAddSertifikat = () => {
    handleInputChange("sertifikat_urls", [...editedData!.sertifikat_urls, ""]);
  };

  const handleRemoveSertifikat = (index: number) => {
    const newUrls = editedData!.sertifikat_urls.filter((_, i) => i !== index);
    handleInputChange("sertifikat_urls", newUrls);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "terkirim":
        return <Badge variant="secondary">Terkirim</Badge>;
      case "diterima":
        return <Badge className="bg-yellow-500">Diterima</Badge>;
      case "disetujui":
        return <Badge className="bg-green-500">Disetujui</Badge>;
      case "ditolak":
        return <Badge variant="destructive">Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  if (!kandidat || !editedData) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Data kandidat tidak ditemukan</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/kandidat")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              <h2 className="text-3xl font-bold text-foreground">
                Detail Kandidat
              </h2>
            </div>

            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Menyimpan..." : "Simpan"}
                </Button>
                <Button
                  onClick={handleEditToggle}
                  variant="outline"
                  disabled={saving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Batal
                </Button>
              </div>
            ) : (
              <Button onClick={handleEditToggle} variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Data
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Status Seleksi</CardTitle>
                {getStatusBadge(kandidat.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Catatan Admin</label>
                <Textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Tambahkan catatan untuk kandidat..."
                  rows={3}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {kandidat.status === "terkirim" && (
                  <Button
                    onClick={() => updateStatus("diterima")}
                    className="bg-yellow-500 hover:bg-yellow-600"
                  >
                    <FileCheck className="w-4 h-4 mr-2" />
                    Tandai Diterima
                  </Button>
                )}

                {kandidat.status === "diterima" && (
                  <>
                    <Button
                      onClick={() => updateStatus("disetujui")}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Setujui
                    </Button>
                    <Button
                      onClick={() => updateStatus("ditolak")}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Tolak
                    </Button>
                  </>
                )}

                {(kandidat.status === "disetujui" ||
                  kandidat.status === "ditolak") && (
                  <Button
                    onClick={() => updateStatus("diterima")}
                    variant="outline"
                  >
                    Ubah ke Diterima
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1 shadow-card">
            <CardHeader>
              <CardTitle>Foto Kandidat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <img
                src={editedData.foto_url}
                alt={editedData.nama}
                className="w-full aspect-square object-cover rounded-lg"
              />
              {isEditing && (
                <div className="space-y-2">
                  <label
                    htmlFor="foto-upload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 cursor-pointer transition-colors"
                  >
                    {uploadingFoto ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Mengupload...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload Foto Baru
                      </>
                    )}
                  </label>
                  <input
                    id="foto-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFotoUpload}
                    disabled={uploadingFoto}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Format: JPG, PNG (Max 5MB)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Informasi Pribadi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Nama Lengkap
                  </p>
                  {isEditing ? (
                    <Input
                      value={editedData.nama}
                      onChange={(e) =>
                        handleInputChange("nama", e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-lg font-semibold">{kandidat.nama}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">NIM</p>
                  {isEditing ? (
                    <Input
                      value={editedData.nim}
                      onChange={(e) => handleInputChange("nim", e.target.value)}
                    />
                  ) : (
                    <p className="text-lg font-semibold">{kandidat.nim}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Semester
                    </p>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editedData.semester}
                        onChange={(e) =>
                          handleInputChange(
                            "semester",
                            parseInt(e.target.value)
                          )
                        }
                      />
                    ) : (
                      <p className="text-lg font-semibold">
                        {kandidat.semester}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">IPK</p>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editedData.ipk}
                        onChange={(e) =>
                          handleInputChange("ipk", parseFloat(e.target.value))
                        }
                      />
                    ) : (
                      <p className="text-lg font-semibold">
                        {kandidat.ipk.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Jenis Kelamin
                  </p>
                  {isEditing ? (
                    <select
                      value={editedData.jenis_kelamin}
                      onChange={(e) =>
                        handleInputChange("jenis_kelamin", e.target.value)
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  ) : (
                    <p className="text-lg font-semibold">
                      {kandidat.jenis_kelamin}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Kontak</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <Mail className="h-4 w-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Email</p>
                  </div>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editedData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                    />
                  ) : (
                    <a
                      href={`mailto:${kandidat.email}`}
                      className="text-primary hover:underline"
                    >
                      {kandidat.email}
                    </a>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <Phone className="h-4 w-4 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Nomor WhatsApp
                    </p>
                  </div>
                  {isEditing ? (
                    <Input
                      value={editedData.nomor_wa}
                      onChange={(e) =>
                        handleInputChange("nomor_wa", e.target.value)
                      }
                    />
                  ) : (
                    <a
                      href={`https://wa.me/${kandidat.nomor_wa.replace(
                        /^0/,
                        "62"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {kandidat.nomor_wa}
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Pengalaman Organisasi</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={editedData.pengalaman}
                onChange={(e) =>
                  handleInputChange("pengalaman", e.target.value)
                }
                rows={6}
              />
            ) : (
              <p className="text-foreground whitespace-pre-wrap">
                {kandidat.pengalaman}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Visi dan Misi</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={editedData.visi_misi}
                onChange={(e) => handleInputChange("visi_misi", e.target.value)}
                rows={6}
              />
            ) : (
              <p className="text-foreground whitespace-pre-wrap">
                {kandidat.visi_misi}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Sertifikat</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-3">
                {editedData.sertifikat_urls.map((url, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">
                        Sertifikat {index + 1}
                      </h4>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveSertifikat(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        Lihat sertifikat saat ini
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}

                    <div>
                      <label
                        htmlFor={`sertifikat-upload-${index}`}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 cursor-pointer transition-colors"
                      >
                        {uploadingSertifikat === index ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Mengupload...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload Sertifikat
                          </>
                        )}
                      </label>
                      <input
                        id={`sertifikat-upload-${index}`}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleSertifikatUpload(e, index)}
                        disabled={uploadingSertifikat !== null}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground mt-1 text-center">
                        Format: JPG, PNG, PDF (Max 10MB)
                      </p>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={handleAddSertifikat}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Tambah Sertifikat Baru
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {kandidat.sertifikat_urls.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 border rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="flex-1 text-sm">
                      Sertifikat {index + 1}
                    </span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminKandidatDetail;
