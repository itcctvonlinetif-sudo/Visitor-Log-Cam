import { FileDown, FileUp, Database, FileSpreadsheet, FileText, Loader2, Check, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVisits, useCreateVisit } from "@/hooks/use-visits";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function ExportImport() {
  const { data: visits } = useVisits();
  const { toast } = useToast();
  const createVisit = useCreateVisit();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportExcel = () => {
    if (!visits || visits.length === 0) {
      toast({ title: "No data", description: "Belum ada data untuk di-export", variant: "destructive" });
      return;
    }

    setIsExporting(true);
    try {
      const data = visits.map((v) => ({
        Nama: v.fullName,
        RFID: v.rfidCardId || "-",
        Telepon: v.phoneNumber,
        "Alamat/Perusahaan": v.address || "-",
        Bertemu: v.meetingWith,
        Keperluan: v.purpose,
        Masuk: format(new Date(v.checkInTime), "dd/MM/yyyy HH:mm"),
        Keluar: v.checkOutTime ? format(new Date(v.checkOutTime), "dd/MM/yyyy HH:mm") : "-",
        Status: v.status === "checked_in" ? "Masuk" : "Keluar",
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Pengunjung");
      XLSX.writeFile(wb, `Laporan_Pengunjung_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
      
      toast({ title: "Success", description: "Laporan Excel berhasil diunduh" });
    } catch (err) {
      toast({ title: "Export Failed", description: "Gagal membuat file Excel", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const exportPDF = async () => {
    if (!visits || visits.length === 0) {
      toast({ title: "No data", description: "Belum ada data untuk di-export", variant: "destructive" });
      return;
    }

    setIsExporting(true);
    try {
      const doc = new jsPDF();
      doc.text("Laporan Data Pengunjung", 14, 15);
      doc.setFontSize(10);
      doc.text(`Tanggal Cetak: ${format(new Date(), "dd MMMM yyyy, HH:mm")}`, 14, 22);

      const tableData = visits.map((v, i) => [
        i + 1,
        "", // Placeholder for photo
        v.fullName,
        v.purpose,
        v.meetingWith,
        format(new Date(v.checkInTime), "HH:mm"),
        v.checkOutTime ? format(new Date(v.checkOutTime), "HH:mm") : "-",
        v.status === "checked_in" ? "Masuk" : "Keluar"
      ]);

      doc.autoTable({
        startY: 30,
        head: [["#", "Foto", "Nama", "Keperluan", "Bertemu", "Masuk", "Keluar", "Status"]],
        body: tableData,
        headStyles: { fillColor: [249, 115, 22] }, // Orange primary
        didDrawCell: (data: any) => {
          if (data.column.index === 1 && data.cell.section === "body") {
            const visit = visits[data.row.index];
            if (visit.photoUrl && visit.photoUrl.startsWith("data:image")) {
              try {
                // Ensure photoUrl is valid data URL
                doc.addImage(visit.photoUrl, "JPEG", data.cell.x + 2, data.cell.y + 2, 10, 10);
              } catch (e) {
                console.error("Failed to add image to PDF", e);
              }
            }
          }
        },
        columnStyles: {
          1: { cellWidth: 15, minCellHeight: 15 }
        },
        styles: {
          valign: "middle"
        }
      });

      doc.save(`Laporan_Pengunjung_${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast({ title: "Success", description: "Laporan PDF berhasil diunduh" });
    } catch (err) {
      console.error(err);
      toast({ title: "Export Failed", description: "Gagal membuat file PDF", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleBackup = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/backup");
      if (!res.ok) throw new Error("Backup failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_visitor_system_${format(new Date(), "yyyy-MM-dd_HHmm")}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast({ title: "Backup Berhasil", description: "Data sistem berhasil dicadangkan" });
    } catch (err) {
      toast({ title: "Backup Gagal", description: "Gagal melakukan pencadangan data", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        let successCount = 0;
        for (const row of data) {
          try {
            // Basic mapping - adjust based on your Excel headers
            await createVisit.mutateAsync({
              fullName: row.Nama || row.fullName || "",
              phoneNumber: String(row.Telepon || row.phoneNumber || ""),
              rfidCardId: String(row.RFID || row.rfidCardId || ""),
              address: row["Alamat/Perusahaan"] || row.address || "",
              meetingWith: row.Bertemu || row.meetingWith || "",
              purpose: row.Keperluan || row.purpose || "",
              photoUrl: ""
            });
            successCount++;
          } catch (e) {
            console.error("Row import failed", e);
          }
        }

        toast({ 
          title: "Import Complete", 
          description: `Berhasil mengimport ${successCount} data pengunjung`,
          variant: successCount > 0 ? "default" : "destructive"
        });
      } catch (err) {
        toast({ title: "Import Error", description: "Gagal memproses file. Pastikan format benar.", variant: "destructive" });
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-8 px-4">
      <div>
        <h2 className="text-2xl font-display font-bold text-gray-900">Export & Import Data</h2>
        <p className="text-gray-500 mt-1">Kelola pencadangan data dan laporan kunjungan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Export Reports */}
        <Card className="hover:shadow-md transition-all duration-300 border-gray-200 rounded-2xl overflow-hidden">
          <CardHeader className="bg-green-50/50 pb-4">
            <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-2">
              <FileSpreadsheet className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">Laporan Excel</CardTitle>
            <CardDescription>Export data kunjungan ke format Excel (.xlsx)</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500 italic">Termasuk detail lengkap pengunjung dan waktu kunjungan.</p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={exportExcel}
              disabled={isExporting}
              className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl"
            >
              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
              Download Excel
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 border-gray-200 rounded-2xl overflow-hidden">
          <CardHeader className="bg-red-50/50 pb-4">
             <div className="bg-red-100 w-12 h-12 rounded-xl flex items-center justify-center mb-2">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-lg">Laporan PDF</CardTitle>
            <CardDescription>Cetak laporan pengunjung (.pdf)</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500 italic">Laporan harian yang rapi dan siap cetak untuk arsip.</p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={exportPDF}
              disabled={isExporting}
              className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl"
            >
              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
              Download PDF
            </Button>
          </CardFooter>
        </Card>

        {/* Database Backup */}
        <Card className="hover:shadow-md transition-all duration-300 border-gray-200 rounded-2xl overflow-hidden">
          <CardHeader className="bg-blue-50/50 pb-4">
             <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-2">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Database Backup</CardTitle>
            <CardDescription>Full system backup (JSON format)</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500 italic">Cadangkan seluruh data kunjungan ke dalam file JSON.</p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleBackup}
              disabled={isExporting}
              className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl"
            >
              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
              Backup Data
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Import Section */}
        <Card className="border-dashed border-2 border-gray-300 bg-gray-50/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5 text-primary" /> Import Data Pengunjung
            </CardTitle>
            <CardDescription>Upload file Excel/CSV untuk menambahkan data pengunjung dalam jumlah banyak sekaligus</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
             <div className="bg-white p-6 rounded-full shadow-sm mb-4 border border-gray-100">
               {isImporting ? <Loader2 className="h-12 w-12 text-primary animate-spin" /> : <FileSpreadsheet className="h-12 w-12 text-gray-300" />}
             </div>
             <input 
               type="file" 
               className="hidden" 
               ref={fileInputRef} 
               accept=".xlsx, .xls, .csv" 
               onChange={handleFileUpload}
             />
             <Button 
               variant="default" 
               className="bg-primary hover:bg-primary/90 rounded-xl px-8"
               onClick={() => fileInputRef.current?.click()}
               disabled={isImporting}
             >
               {isImporting ? "Memproses..." : "Pilih File Excel / CSV"}
             </Button>
             <div className="flex items-center gap-6 mt-6 text-xs text-gray-400">
               <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> Format .xlsx / .csv</span>
               <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> Maks 10MB</span>
               <span className="flex items-center gap-1"><AlertCircle className="h-3 w-3 text-orange-500" /> Headers: Nama, Telepon, Keperluan, Bertemu</span>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
