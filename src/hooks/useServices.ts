import { useEffect, useState } from 'react';
import { getServices, searchServices } from '../queries/services';
import { IService, ServiceStatusEnum } from '../types';
import { useChainId } from './useChainId';

const useServices = (
  serviceStatus?: ServiceStatusEnum,
  buyerId?: string,
  sellerId?: string,
  searchQuery?: string,
  numberPerPage?: number,
): {
  hasMoreData: boolean;
  loading: boolean;
  services: IService[];
  loadMore: () => void;
} => {
  const chainId = useChainId();
  const [services, setServices] = useState<IService[]>([]);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    setServices([]);
    setOffset(0);
  }, [searchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let response;
        let newServices: IService[] = [];
        if (searchQuery) {
          response = await searchServices(chainId, {
            serviceStatus,
            buyerId,
            sellerId,
            platformId: process.env.NEXT_PUBLIC_PLATFORM_ID,
            numberPerPage,
            offset,
            searchQuery,
          });
          if (response?.data?.data?.serviceDescriptionSearchRank.length > 0) {
            newServices = response.data.data.serviceDescriptionSearchRank.map(
              (serviceDescription: { service: any }) => {
                return {
                  ...serviceDescription.service,
                  description: {
                    ...serviceDescription,
                  },
                };
              },
            );
          }
        } else {
          response = await getServices(chainId, {
            serviceStatus,
            buyerId,
            sellerId,
            platformId: process.env.NEXT_PUBLIC_PLATFORM_ID,
            numberPerPage,
            offset,
          });
          newServices = response?.data?.data?.services;
        }

        if (offset === 0) {
          setServices(newServices || []);
        } else {
          setServices([...services, ...newServices]);
        }
        if (numberPerPage && newServices.length < numberPerPage) {
          setHasMoreData(false);
        } else {
          setHasMoreData(true);
        }
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [numberPerPage, offset, searchQuery, buyerId, serviceStatus]);

  const loadMore = () => {
    numberPerPage ? setOffset(offset + numberPerPage) : '';
  };

  return { hasMoreData: hasMoreData, services, loading, loadMore };
};

export default useServices;
