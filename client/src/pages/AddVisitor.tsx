import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVisitSchema } from "@shared/schema";
import { useCreateVisit } from "@/hooks/use-visits";
import { useLocation } from "wouter";
import { z } from "zod";
import { Camera, RefreshCw, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";

// Extend schema for form validation
const formSchema = insertVisitSchema.extend({
  fullName: z.string().min(1, "Nama lengkap wajib diisi"),
  phoneNumber: z.string().min(1, "Nomor telepon wajib diisi"),
  meetingWith: z.string().min(1, "Bertemu dengan wajib diisi"),
  purpose: z.string().min(1, "Keperluan wajib diisi"),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddVisitor() {
  const [, setLocation] = useLocation();
  const createMutation = useCreateVisit();
  const webcamRef = useRef<Webcam>(null);
  
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      rfidCardId: "",
      address: "",
      meetingWith: "",
      purpose: "",
      photoUrl: "",
    },
  });

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
      setIsCameraOpen(false);
      if (imageSrc) {
        form.setValue("photoUrl", imageSrc);
      }
    }
  }, [webcamRef, form]);

  const retake = () => {
    setImgSrc(null);
    setIsCameraOpen(true);
    form.setValue("photoUrl", undefined);
  };

  const onSubmit = (data: FormValues) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        // setLocation("/");
        form.reset({
          fullName: "",
          phoneNumber: "",
          rfidCardId: "",
          address: "",
          meetingWith: "",
          purpose: "",
          photoUrl: "",
        });
        setImgSrc(null);
        setIsCameraOpen(false);
        import("@/hooks/use-toast").then(({ toast }) => {
          toast({
            title: "Pendaftaran Berhasil",
            description: "Data pengunjung telah berhasil disimpan.",
          });
        });
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h2 className="text-2xl font-display font-bold text-gray-900">Formulir Pendaftaran</h2>
        <p className="text-gray-500 mt-1">Isi data pengunjung baru di bawah ini</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Camera Section */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 bg-white border-gray-200 shadow-sm overflow-hidden rounded-2xl">
            <Label className="text-base font-semibold mb-3 block">Foto Pengunjung</Label>
            
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative border-2 border-dashed border-gray-300 flex items-center justify-center group">
              {imgSrc ? (
                <img src={imgSrc} alt="Captured" className="w-full h-full object-cover" />
              ) : isCameraOpen ? (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6">
                  <div className="bg-gray-200 p-4 rounded-full inline-flex mb-3">
                    <Camera className="h-8 w-8 text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-500">Ambil foto pengunjung untuk identifikasi</p>
                </div>
              )}

              {/* Action Buttons Overlay */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                {!imgSrc && !isCameraOpen && (
                  <Button type="button" onClick={() => setIsCameraOpen(true)} className="rounded-full shadow-lg">
                    <Camera className="mr-2 h-4 w-4" /> Buka Kamera
                  </Button>
                )}
                
                {isCameraOpen && (
                  <Button type="button" onClick={capture} variant="default" className="rounded-full shadow-lg bg-red-500 hover:bg-red-600 border-none text-white">
                    <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse" /> Ambil Foto
                  </Button>
                )}

                {imgSrc && (
                  <Button type="button" onClick={retake} variant="secondary" className="rounded-full shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white">
                    <RefreshCw className="mr-2 h-4 w-4" /> Foto Ulang
                  </Button>
                )}
              </div>
            </div>
            {imgSrc && (
              <div className="mt-3 flex items-center justify-center text-sm text-green-600 font-medium">
                <Check className="h-4 w-4 mr-1" /> Foto Tersimpan
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Form */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-white border-gray-200 shadow-sm rounded-2xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="rfidCardId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Kartu RFID (Opsional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Scan kartu RFID..." {...field} value={field.value || ''} className="bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Telepon <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="08..." {...field} className="bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel>Nama Lengkap <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Nama sesuai identitas" {...field} className="bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel>Alamat / Perusahaan</FormLabel>
                        <FormControl>
                          <Input placeholder="PT..." {...field} value={field.value || ''} className="bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="meetingWith"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bertemu Dengan <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Nama karyawan/staff" {...field} className="bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Keperluan <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Interview, Meeting, dll" {...field} className="bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4 flex gap-3 justify-end border-t mt-6">
                  <Button type="button" variant="outline" onClick={() => setLocation("/")} className="rounded-xl px-6">
                    Batal
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} className="bg-primary hover:bg-primary/90 rounded-xl px-8 shadow-lg shadow-primary/20">
                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Data
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
