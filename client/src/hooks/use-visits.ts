import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertVisit } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useVisits(search?: string, status?: 'checked_in' | 'checked_out' | 'all') {
  return useQuery({
    queryKey: [api.visits.list.path, search, status],
    queryFn: async () => {
      // Build query params
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status && status !== 'all') params.append("status", status);

      const url = `${api.visits.list.path}?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch visits");
      return api.visits.list.responses[200].parse(await res.json());
    },
  });
}

export function useVisit(id: number) {
  return useQuery({
    queryKey: [api.visits.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.visits.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch visit");
      return api.visits.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateVisit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertVisit) => {
      const res = await fetch(api.visits.create.path, {
        method: api.visits.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create visit");
      }
      return api.visits.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.visits.list.path] });
      toast({
        title: "Success",
        description: "Visitor checked in successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useCheckoutVisit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.visits.checkout.path, { id });
      const res = await fetch(url, { method: api.visits.checkout.method });
      if (!res.ok) throw new Error("Failed to checkout visitor");
      return api.visits.checkout.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.visits.list.path] });
      // Force immediate refetch of all list queries
      queryClient.refetchQueries({ 
        queryKey: [api.visits.list.path],
        type: 'active'
      });
      toast({
        title: "Checked Out",
        description: "Visitor has been successfully checked out",
      });
    },
  });
}

export function useDeleteVisitsByRange() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (range: "week" | "month" | "year") => {
      const res = await fetch(`/api/visits/purge/${range}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus data");
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.visits.list.path] });
      toast({
        title: "Data Berhasil Dihapus",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal Menghapus",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useScanRfid() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (rfid: string) => {
      const res = await fetch(api.visits.scanRfid.path, {
        method: api.visits.scanRfid.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rfid }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Scan gagal");
      }
      return api.visits.scanRfid.responses[200].parse(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.visits.list.path] });
      // Force immediate refetch of all list queries to ensure all tabs update
      queryClient.refetchQueries({ 
        queryKey: [api.visits.list.path],
        type: 'active'
      });
      if (data.message && data.message.includes("Checked out")) {
        toast({
          title: "Checked Out",
          description: data.message,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Scan Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
