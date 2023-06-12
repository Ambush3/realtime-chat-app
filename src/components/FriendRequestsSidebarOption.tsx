import { User } from 'lucide-react'
import Link from 'next/link'
import { FC } from 'react'

interface FriendRequestsSidebarOptionProps {
  
}

const FriendRequestsSidebarOption: FC<FriendRequestsSidebarOptionProps
> = ({}) => {
  return <Link href='/dashboard/requests' className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex-items-center gap-x-3 rounded-md p-2 text-small leading-6 font-semibold' >
    <div className='text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'>
        <User className='h-4 w-4' />
    </div>
    <p className='truncate'>Friend Requests</p>
  </Link>
}

export default FriendRequestsSidebarOption