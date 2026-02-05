import { useState } from "react";
import { useVisits, useCheckoutVisit, useDeleteVisit } from "@/hooks/use-visits";
import { format } from "date-fns";
import { Search, LogOut, Trash2, QrCode, BadgeCheck, Clock, User, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked_in' | 'checked_out'>('all');
  
  const { data: visits, isLoading } = useVisits(search, statusFilter);
  const checkoutMutation = useCheckoutVisit();
  const deleteMutation = useDeleteVisit();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">Daftar Pengunjung</h2>
          <p className="text-gray-500 mt-1">Kelola data kunjungan hari ini</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Cari nama, perusahaan..." 
              className="pl-9 bg-white border-gray-200 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={(val) => setStatusFilter(val as any)}>
        <TabsList className="bg-white border border-gray-200 p-1 rounded-xl h-auto">
          <TabsTrigger value="all" className="rounded-lg px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            Semua
          </TabsTrigger>
          <TabsTrigger value="checked_in" className="rounded-lg px-6 py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Masuk
          </TabsTrigger>
          <TabsTrigger value="checked_out" className="rounded-lg px-6 py-2 data-[state=active]:bg-gray-600 data-[state=active]:text-white">
            Keluar
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
             {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl bg-gray-50" />)}
          </div>
        ) : visits?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <User className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Belum ada pengunjung</h3>
            <p className="text-gray-500 max-w-sm mx-auto mt-1">
              Tidak ada data pengunjung yang ditemukan untuk filter saat ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Pengunjung</th>
                  <th className="px-6 py-4">Keperluan & Bertemu</th>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visits?.map((visit, idx) => (
                  <motion.tr 
                    key={visit.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-primary font-bold overflow-hidden border-2 border-white shadow-sm">
                          {visit.photoUrl ? (
                            <img src={visit.photoUrl} alt={visit.fullName} className="h-full w-full object-cover" />
                          ) : (
                            visit.fullName.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{visit.fullName}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                             <Building2 className="h-3 w-3" /> {visit.address || "-"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{visit.purpose}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <User className="h-3 w-3" /> {visit.meetingWith}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                          <Clock className="h-3.5 w-3.5 text-green-600" />
                          <span className="font-medium text-green-700">In:</span>
                          {format(new Date(visit.checkInTime), "HH:mm")}
                        </div>
                        {visit.checkOutTime && (
                           <div className="flex items-center gap-1.5 text-sm text-gray-700">
                             <Clock className="h-3.5 w-3.5 text-red-600" />
                             <span className="font-medium text-red-700">Out:</span>
                             {format(new Date(visit.checkOutTime), "HH:mm")}
                           </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {visit.status === 'checked_in' ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200 shadow-sm gap-1">
                          <BadgeCheck className="h-3.5 w-3.5" /> Masuk
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200 gap-1">
                          <LogOut className="h-3.5 w-3.5" /> Keluar
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-primary hover:bg-orange-50">
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-xs p-6 text-center flex flex-col items-center">
                            <h3 className="font-bold text-lg mb-4">Visitor Pass</h3>
                            <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-300">
                               <QrCode className="h-32 w-32 text-gray-900" />
                            </div>
                            <p className="text-sm text-gray-500 mt-4">{visit.fullName}</p>
                            <p className="font-mono text-xs text-gray-400">{visit.id}</p>
                          </DialogContent>
                        </Dialog>
                        
                        {visit.status === 'checked_in' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                              >
                                Checkout
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Konfirmasi Checkout</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah anda yakin ingin melakukan checkout untuk <b>{visit.fullName}</b>?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => checkoutMutation.mutate(visit.id)}
                                  className="bg-primary hover:bg-primary/90"
                                >
                                  Ya, Checkout
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Data</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Data kunjungan ini akan dihapus permanen.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteMutation.mutate(visit.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
