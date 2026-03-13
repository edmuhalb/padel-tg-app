import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { GameStatus, PlayerLevel } from '../types';

export function useGames(status?: GameStatus) {
  return useQuery({
    queryKey: ['games', status],
    queryFn: () => api.getGames(status),
    refetchInterval: 15_000,
  });
}

export function useGame(id: number) {
  return useQuery({
    queryKey: ['game', id],
    queryFn: () => api.getGame(id),
    refetchInterval: 10_000,
  });
}

export function useCreateGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createGame,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['games'] }),
  });
}

export function useUpdateGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Parameters<typeof api.updateGame>[1] & { id: number }) =>
      api.updateGame(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['games'] });
      qc.invalidateQueries({ queryKey: ['game', vars.id] });
    },
  });
}

export function useJoinGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: number; comment?: string }) =>
      api.joinGame(id, comment),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['games'] });
      qc.invalidateQueries({ queryKey: ['game', id] });
    },
  });
}

export function useLeaveGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.leaveGame(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['games'] });
      qc.invalidateQueries({ queryKey: ['game', id] });
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api.getProfile(),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { level: PlayerLevel }) => api.updateProfile(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });
}
