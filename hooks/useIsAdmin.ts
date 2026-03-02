import { useUser } from '../context/UserContext';

export const useIsAdmin = () => {
  const { user } = useUser();
  return user?.roleId === 2;
};
