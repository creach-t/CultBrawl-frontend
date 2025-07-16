import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

interface Battle {
  id: string;
  name: string;
  entity1Id: string;
  entity2Id: string;
  status: string;
  endTime: string;
  createdById: string;
  votes: {
    entity1Votes: number;
    entity2Votes: number;
  };
}

interface CreateBattleVariables {
  entity1Id: string;
  entity2Id: string;
  durationHours: number;
  createdById: string;
}

export const useBattles = () => {
  const queryClient = useQueryClient();

  // Fetch function to get battles
  const fetchBattles = async (): Promise<Battle[]> => {
    const response = await api.get<Battle[]>('/battles');
    return response.data;
  };

  // Query to fetch the list of battles
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['battles'],
    queryFn: fetchBattles,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    cacheTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });

  // Mutation to create a new battle
  const createBattle = useMutation<Battle, Error, CreateBattleVariables>(
    async (newBattle: CreateBattleVariables): Promise<Battle> => {
      const response = await api.post<Battle>('/battles', newBattle);
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate queries to refresh the battle list
        queryClient.invalidateQueries(['battles']);
      },
    }
  );

  return {
    data, // List of battles
    isLoading, // Loading state
    isError, // Error state
    refetch, // Function to refetch battles
    createBattle, // Mutation to create a battle
  };
};
