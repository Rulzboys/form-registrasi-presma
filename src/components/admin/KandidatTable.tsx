import { useState } from "react";
import { Search, Eye, Trash2, Download, FileSpreadsheet, FileText, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
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
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

interface KandidatTableProps {
  kandidats: Kandidat[];
  onDelete: (id: string) => void;
}

type SortField = "nama" | "semester" | "ipk" | "created_at";
type SortOrder = "asc" | "desc";

export function KandidatTable({ kandidats, onDelete }: KandidatTableProps) {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [semesterFilter, setSemesterFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const navigate = useNavigate();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const exportToExcel = () => {
    const exportData = filteredKandidats.map((k) => ({
      Nama: k.nama,
      Semester: k.semester,
      IPK: k.ipk,
      "Jenis Kelamin": k.jenis_kelamin,
      "No. WA": k.nomor_wa,
      Email: k.email,
      "Tanggal Daftar": new Date(k.created_at).toLocaleDateString("id-ID"),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kandidat");
    XLSX.writeFile(wb, `kandidat_senma_${new Date().getTime()}.xlsx`);
    toast.success("Data berhasil diexport ke Excel");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Data Kandidat Senat Mahasiswa", 14, 15);
    doc.setFontSize(10);
    doc.text(`Diekspor pada: ${new Date().toLocaleString("id-ID")}`, 14, 22);

    const tableData = filteredKandidats.map((k) => [
      k.nama,
      k.semester.toString(),
      k.ipk.toFixed(2),
      k.jenis_kelamin,
      k.nomor_wa,
      k.email,
    ]);

    autoTable(doc, {
      head: [["Nama", "Semester", "IPK", "Jenis Kelamin", "No. WA", "Email"]],
      body: tableData,
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`kandidat_senma_${new Date().getTime()}.pdf`);
    toast.success("Data berhasil diexport ke PDF");
  };

  let filteredKandidats = kandidats.filter((k) => {
    const matchSearch =
      k.nama.toLowerCase().includes(search.toLowerCase()) ||
      k.email.toLowerCase().includes(search.toLowerCase());
    const matchSemester =
      semesterFilter === "all" || k.semester === parseInt(semesterFilter);
    const matchGender =
      genderFilter === "all" || k.jenis_kelamin === genderFilter;
    return matchSearch && matchSemester && matchGender;
  });

  filteredKandidats = filteredKandidats.sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (sortField === "created_at") {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kandidat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={semesterFilter} onValueChange={setSemesterFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Semester</SelectItem>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <SelectItem key={sem} value={sem.toString()}>
                  Semester {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Jenis Kelamin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Gender</SelectItem>
              <SelectItem value="Laki-laki">Laki-laki</SelectItem>
              <SelectItem value="Perempuan">Perempuan</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToExcel}
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToPDF}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("nama")}
                  className="gap-1 px-0 hover:bg-transparent"
                >
                  Nama
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("semester")}
                  className="gap-1 px-0 hover:bg-transparent"
                >
                  Semester
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("ipk")}
                  className="gap-1 px-0 hover:bg-transparent"
                >
                  IPK
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Jenis Kelamin</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>No. WA</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredKandidats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Tidak ada data kandidat
                </TableCell>
              </TableRow>
            ) : (
              filteredKandidats.map((kandidat) => (
                <TableRow key={kandidat.id}>
                  <TableCell className="font-medium">{kandidat.nama}</TableCell>
                  <TableCell>{kandidat.semester}</TableCell>
                  <TableCell>{kandidat.ipk.toFixed(2)}</TableCell>
                  <TableCell>{kandidat.jenis_kelamin}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        kandidat.status === "disetujui" ? "default" : 
                        kandidat.status === "ditolak" ? "destructive" : 
                        kandidat.status === "diterima" ? "secondary" : 
                        "outline"
                      }
                      className={
                        kandidat.status === "diterima" ? "bg-yellow-500" : ""
                      }
                    >
                      {kandidat.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{kandidat.nomor_wa}</TableCell>
                  <TableCell>{kandidat.email}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/kandidat/${kandidat.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteId(kandidat.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kandidat?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data kandidat akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId);
                  setDeleteId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
