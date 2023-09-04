import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { getUserByAddress } from '../queries/users';
import { IAccount, IPlatform, IUser } from '../types';
import { useChainId } from '../hooks/useChainId';
import { getPlatformsByOwner } from '../queries/platform';

const StarterKitContext = createContext<{
  user?: IUser;
  account?: IAccount;
  isActiveDelegate: boolean;
  ownedPlatforms: IPlatform[];
  refreshData?: () => void;
  loading: boolean;
}>({
  user: undefined,
  account: undefined,
  isActiveDelegate: false,
  ownedPlatforms: [],
  loading: true,
});

const StarterKitProvider = ({ children }: { children: ReactNode }) => {
  const chainId = useChainId();
  const [user, setUser] = useState<IUser | undefined>();
  const account = useAccount();
  const [isActiveDelegate, setIsActiveDelegate] = useState(false);
  const [ownedPlatforms, setOwnedPlatforms] = useState<IPlatform[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!account.address || !account.isConnected) {
      setLoading(false);
      return false;
    }

    try {
      const response = await getUserByAddress(chainId, account.address);

      if (response?.data?.data?.users?.length == 0) {
        return false;
      }

      const currentUser = response.data.data.users[0];
      setUser(currentUser);

      setIsActiveDelegate(
        process.env.NEXT_PUBLIC_ACTIVE_DELEGATE &&
          response.data.data.users[0].delegates &&
          response.data.data.users[0].delegates.indexOf(
            (process.env.NEXT_PUBLIC_DELEGATE_ADDRESS as string).toLowerCase(),
          ) !== -1,
      );

      const ownedPlatforms = await getPlatformsByOwner(chainId, currentUser.address);
      setOwnedPlatforms(ownedPlatforms?.data?.data?.platforms);

      setLoading(false);
      return true;
    } catch (err: any) {
      setLoading(false);
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [chainId, account.address, account.isConnected, isActiveDelegate]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 4000);
    return () => {
      clearInterval(interval);
    };
  }, [fetchData]);

  const value = useMemo(() => {
    return {
      user,
      account: account ? account : undefined,
      ownedPlatforms,
      isActiveDelegate,
      refreshData: fetchData,
      loading,
    };
  }, [account.address, user?.id, isActiveDelegate, ownedPlatforms, loading]);

  return <StarterKitContext.Provider value={value}>{children}</StarterKitContext.Provider>;
};

export { StarterKitProvider };

export default StarterKitContext;
