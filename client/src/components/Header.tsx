import React from "react";
import { Link, useLocation } from "wouter";
import { CalendarDays, LayoutDashboard, UserPlus, ScanLine, QrCode, FileInput, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const MENU_ITEMS = [
  { label: "Tambah Data", icon: UserPlus, href: "/" },
  { label: "Daftar Pengunjung", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Scan RFID", icon: ScanLine, href: "/scan-rfid" },
  { label: "Scan QR Code", icon: QrCode, href: "/scan-qr" },
  { label: "Export & Import", icon: FileInput, href: "/export" },
];

export function Header() {
  const [location] = useLocation();
  const [open, setOpen] = React.useState(false);
  const currentDate = format(new Date(), "EEEE, d MMMM yyyy", { locale: id });

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      {/* Top Bar - Orange Brand */}
      <div className="bg-primary px-4 py-3 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-lg shadow-inner">
               <ScanLine className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-white font-display font-bold text-lg sm:text-xl tracking-tight leading-none">
                SISTEM KELUAR MASUK
              </h1>
              <p className="text-orange-100 text-xs font-medium">Visitor Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90 bg-white/10 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
            <CalendarDays className="h-4 w-4" />
            <span className="font-medium">{currentDate}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Desktop */}
      <div className="hidden md:block bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1">
            {MENU_ITEMS.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className={cn(
                  "flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-all duration-200 outline-none",
                  isActive 
                    ? "border-primary text-primary bg-orange-50/50" 
                    : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200 hover:bg-gray-50"
                )}>
                  <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden p-4 flex items-center justify-between border-b">
         <span className="font-semibold text-gray-700">Menu</span>
         <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <nav className="flex flex-col gap-2 mt-6">
                {MENU_ITEMS.map((item) => {
                  const isActive = location === item.href;
                  const Icon = item.icon;
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href} 
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
         </Sheet>
      </div>
    </header>
  );
}
