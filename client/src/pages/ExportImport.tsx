import { FileDown, FileUp, Database, FileSpreadsheet, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ExportImport() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-8">
      <div>
        <h2 className="text-2xl font-display font-bold text-gray-900">Export & Import Data</h2>
        <p className="text-gray-500 mt-1">Manage data backups and reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Export Reports */}
        <Card className="hover:shadow-lg transition-all duration-300 border-gray-200">
          <CardHeader>
            <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <FileSpreadsheet className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Laporan Excel</CardTitle>
            <CardDescription>Export data kunjungan ke format Excel (.xlsx)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Includes all visitor details, check-in/out times, and status.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300">
              <FileDown className="mr-2 h-4 w-4" /> Download Excel
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-gray-200">
          <CardHeader>
             <div className="bg-red-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Laporan PDF</CardTitle>
            <CardDescription>Generate printable visitor report (.pdf)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Formatted daily or monthly report suitable for printing.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300">
              <FileDown className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </CardFooter>
        </Card>

        {/* Database Backup */}
        <Card className="hover:shadow-lg transition-all duration-300 border-gray-200">
          <CardHeader>
             <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Database Backup</CardTitle>
            <CardDescription>Full system backup SQL dump</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Recommended to perform weekly backups for data safety.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300">
              <FileDown className="mr-2 h-4 w-4" /> Backup SQL
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Section */}
        <Card className="border-dashed border-2 border-gray-300 bg-gray-50/50">
          <CardHeader>
            <CardTitle>Import Data</CardTitle>
            <CardDescription>Drag and drop Excel/CSV files here to bulk import visitors</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10">
             <FileUp className="h-16 w-16 text-gray-300 mb-4" />
             <Button variant="outline" className="mt-2">Select Files</Button>
             <p className="text-xs text-gray-400 mt-4">Supported formats: .xlsx, .csv (Max 10MB)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
