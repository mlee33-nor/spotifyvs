'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type TierList } from '@/lib/db/schema';

// Get user's tier lists
export function useTierLists(filter: 'all' | 'public' | 'private' = 'all') {
  return useQuery({
    queryKey: ['tier-lists', filter],
    queryFn: async () => {
      const res = await fetch(`/api/tier-lists?filter=${filter}`);
      if (!res.ok) throw new Error('Failed to fetch tier lists');
      const data = await res.json();
      return data.tierLists as TierList[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get single tier list
export function useTierList(id: string | null) {
  return useQuery({
    queryKey: ['tier-list', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/tier-lists/${id}`);
      if (!res.ok) throw new Error('Failed to fetch tier list');
      const data = await res.json();
      return data.tierList as TierList;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

// Update tier list
export function useUpdateTierList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TierList> }) => {
      const res = await fetch(`/api/tier-lists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update tier list');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tier-lists'] });
      queryClient.invalidateQueries({ queryKey: ['tier-list', variables.id] });
    },
  });
}

// Delete tier list
export function useDeleteTierList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tier-lists/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete tier list');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tier-lists'] });
    },
  });
}
