import Link from 'next/link';
import { useContext } from 'react';
import StarterKitContext from '../context/starterKit';
import useServiceById from '../hooks/useServiceById';
import { IProposal, ProposalStatusEnum, ServiceStatusEnum } from '../types';
import { renderTokenAmount } from '../utils/conversion';
import { formatDate } from '../utils/dates';
import ValidateProposalModal from './Modal/ValidateProposalModal';
import Image from 'next/image';

function ProposalItem({ proposal }: { proposal: IProposal }) {
  const { user, account } = useContext(StarterKitContext);
  const service = useServiceById(proposal.service.id);

  if (!service) {
    return null;
  }

  const isBuyer = user?.id === proposal.service.buyer.id;

  return (
    <div className='flex flex-row gap-2 rounded-xl p-4 border border-gray-700 text-white bg-endnight'>
      <div className='flex flex-col items-top justify-between gap-4 w-full'>
        <div className='flex flex-col justify-start items-start gap-4'>
          <div className='flex items-center justify-start w-full  relative'>
            <Image
              src={`/images/default-avatar-${Number(proposal.seller.id) % 9}.jpeg`}
              className='w-10 mr-4 rounded-full'
              width={50}
              height={50}
              alt='default avatar'
            />
            <div className='flex flex-col'>
              <p className='text-gray-100 font-medium break-all'>
                {proposal.seller.handle} - {service.description?.title}
              </p>
              <p className='text-xs text-gray-500'>
                Proposal created the {formatDate(Number(proposal.createdAt) * 1000)}
              </p>
            </div>

            <span className='absolute right-[-25px] top-[-25px] inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-800'>
              {proposal.status}
            </span>
          </div>

          <div className=' border-t border-gray-700 w-full'>
            <p className='text-sm text-gray-400 mt-4'>
              <strong>Message:</strong> {proposal.description?.about}
            </p>
            <p className='text-sm text-gray-400 mt-4'>
              <strong>Expiration Date:</strong> {formatDate(Number(proposal.expirationDate) * 1000)}
            </p>
            {proposal.description?.video_url && (
              <p className='text-sm text-zinc-500 mt-4'>
                <a target='_blank' href={`${proposal.description?.video_url}`}>
                  Proposal video link
                </a>
              </p>
            )}
          </div>
        </div>
        <div className='flex flex-row gap-4 justify-between items-center border-t border-gray-700 pt-4'>
          <p className='text-gray-400 font-bold line-clamp-1 flex-1'>
            {renderTokenAmount(proposal.rateToken, proposal.rateAmount)}
          </p>
          {account && isBuyer && proposal.status === ProposalStatusEnum.Pending && (
            <ValidateProposalModal proposal={proposal} account={account} />
          )}
        </div>
        {account &&
          !isBuyer &&
          proposal.status === ProposalStatusEnum.Pending &&
          service.status === ServiceStatusEnum.Opened && (
            <div className='flex flex-row gap-4 items-center border-t border-gray-700 pt-4'>
              <Link
                className='text-zinc-600 bg-zinc-50 hover:bg-zinc-500 hover:text-white px-3 py-2 rounded text-sm'
                href={`/dashboard/services/${service.id}/proposal`}>
                Edit proposal
              </Link>
            </div>
          )}
      </div>
    </div>
  );
}

export default ProposalItem;
