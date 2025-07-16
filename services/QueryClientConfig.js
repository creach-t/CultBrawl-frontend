import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // Recharge les données lorsqu'on revient sur l'écran
      staleTime: 10000, // Les données sont considérées comme fraîches pendant 10 secondes
      cacheTime: 300000, // Les données sont conservées en cache pendant 5 minutes
      retry: 2, // Réessaye la requête en cas d'échec
    },
  },
});

export default queryClient;
