// "use client";

import { Icon, Icons } from '@/components/Icons';
import SignOutButton from '@/components/SignOutButton';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import FriendRequestSidebarOptions from '@/components/FriendRequestSidebarOptions';
import { fetchRedis } from '@/helpers/redis';
import { getFriendsByUserId } from '@/helpers/get-friends-by-user-id';
import SidebarChatList from '@/components/SidebarChatList';
import MobileChatLayout from '@/components/MobileChatLayout';
import { SidebarOption } from '@/types/typings';
import { DarkModeProvider, useDarkMode } from './darkmode';

interface LayoutProps {
    children: ReactNode;
}

export const metadata = {
    title: 'Friends For Life | Dashboard',
    description: 'Your dashboard',
};

const sidebarOptions: SidebarOption[] = [
    {
        id: 1,
        name: 'Add friend',
        href: '/dashboard/add',
        Icon: 'UserPlus',
    },
];

const Layout = async ({ children }: LayoutProps) => {
    const session = await getServerSession(authOptions);
    if (!session) notFound();

    const friends = await getFriendsByUserId(session.user.id);
    console.log('friends', friends);

    const unseenRequestCount = (
        (await fetchRedis(
            'smembers',
            `user:${session.user.id}:incoming_friend_requests`
        )) as User[]
    ).length;

    return (
        <DarkModeProvider> {/* Wrap the content with DarkModeProvider */}
            <InnerLayout
                session={session}
                friends={friends}
                unseenRequestCount={unseenRequestCount}
            >
                {children}
            </InnerLayout>
        </DarkModeProvider>
    );
};

const InnerLayout = ({ children, session, friends, unseenRequestCount }: { children: ReactNode; session: any; friends: any[]; unseenRequestCount: number }) => {
    const { darkMode, toggleDarkMode } = useDarkMode();

    return (
        <div className={`w-full flex h-screen ${darkMode ? 'dark' : ''}`}>
            <div className='md:hidden'>
                <MobileChatLayout
                    friends={friends}
                    session={session}
                    sidebarOptions={sidebarOptions}
                    unseenRequestCount={unseenRequestCount}
                />
            </div>

            <div className='hidden md:flex h-full w-full max-w-[380px] grow flex-col overflow-y-auto border-r border-gray-200 bg-white dark:bg-gray-800 px-6'>
                <Link href='/dashboard' className='flex h-16 shrink-0 items-center'>
                    <Icons.Logo className='h-8 w-auto text-sky-600' />
                </Link>

                {friends.length > 0 ? (
                    <div className='text-xs font-semibold leading-6 text-gray-400 dark:text-gray-300'>
                        Your Chats
                    </div>
                ) : null}

                <nav className='flex flex-1 flex-col'>
                    <ul role='list' className='flex flex-1 flex-col gap-y-7'>
                        <li>
                            <SidebarChatList sessionId={session.user.id} friends={friends} />
                        </li>
                        <li>
                            <div className='text-xs font-semibold leading-6 text-gray-400 dark:text-gray-300'>
                                Overview
                            </div>

                            <ul role='list' className='-mx-2 mt-2 space-y-1'>
                                {sidebarOptions.map((option) => {
                                    const Icon = Icons[option.Icon];
                                    return (
                                        <li key={option.id}>
                                            <Link
                                                href={option.href}
                                                className='text-gray-700 dark:text-gray-200 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-50 dark:hover:bg-gray-700 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold'>
                                                <span className='text-gray-400 dark:text-gray-200 border-gray-200 group-hover:border-sky-600 group-hover:text-sky-600 dark:group-hover:text-sky-400 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white dark:bg-gray-700'>
                                                    <Icon className='h-4 w-4' />
                                                </span>

                                                <span className='truncate'>{option.name}</span>
                                            </Link>
                                        </li>
                                    );
                                })}

                                <li>
                                    <FriendRequestSidebarOptions
                                        sessionId={session.user.id}
                                        initialUnseenRequestCount={unseenRequestCount}
                                    />
                                </li>
                            </ul>
                        </li>

                        <li className='-mx-6 mt-auto flex items-center'>
                            <div className='flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200'>
                                <div className='relative h-8 w-8 bg-gray-50 dark:bg-gray-700'>
                                    <Image
                                        fill
                                        referrerPolicy='no-referrer'
                                        className='rounded-full'
                                        src={session.user.image || ''}
                                        alt='Your profile picture'
                                    />
                                </div>

                                <span className='sr-only'>Your profile</span>
                                <div className='flex flex-col'>
                                    <span aria-hidden='true'>{session.user.name}</span>
                                    <span className='text-xs text-zinc-400 dark:text-zinc-500' aria-hidden='true'>
                                        {session.user.email}
                                    </span>
                                </div>
                            </div>

                            <SignOutButton className='h-full aspect-square' />
                        </li>

                        {/* Dark Mode Toggle */}
                        <li className='flex items-center justify-center mt-4'>
                            <button
                                onClick={toggleDarkMode}
                                className='p-2 text-sm font-semibold rounded-md bg-gray-200 dark:bg-gray-600 dark:text-gray-200 text-gray-800'>
                                Toggle Dark Mode
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>

            <aside className='max-h-screen container py-16 md:py-12 w-full'>
                {children}
            </aside>
        </div>
    );
};

export default Layout;
