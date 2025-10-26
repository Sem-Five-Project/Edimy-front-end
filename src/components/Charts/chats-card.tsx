'use client';

import { DotIcon } from "@/assets/icons";
import { formatMessageTime } from "@/lib/format-message-time";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";

type ChatData = {
  name: string;
  profile: string;
  isActive: boolean;
  lastMessage: {
    content: string;
    type: string;
    timestamp: string;
    isRead: boolean;
  };
  unreadCount: number;
};

export function ChatsCard() {
  const [data, setData] = useState<ChatData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/admin/chats');
        const apiData = response.data?.data ?? response.data;
        
        if (Array.isArray(apiData)) {
          setData(apiData);
        } else {
          setData(apiData?.chats ?? []);
        }
      } catch (error) {
        console.error('Error fetching chats data:', error);
        // Fallback mock data
        setData([
          {
            name: 'Jacob Jones',
            profile: '/images/user/user-01.png',
            isActive: true,
            lastMessage: {
              content: 'See you tomorrow at the meeting!',
              type: 'text',
              timestamp: '2024-12-19T14:30:00Z',
              isRead: false,
            },
            unreadCount: 3,
          },
          {
            name: 'Wilium Smith',
            profile: '/images/user/user-03.png',
            isActive: true,
            lastMessage: {
              content: 'Thanks for the update',
              type: 'text',
              timestamp: '2024-12-19T10:15:00Z',
              isRead: true,
            },
            unreadCount: 0,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="col-span-12 rounded-[10px] bg-white py-6 shadow-1 dark:bg-gray-900 dark:shadow-card xl:col-span-4">
        <h2 className="mb-5.5 px-7.5 text-body-2xlg font-bold text-dark dark:text-white">
          Chats
        </h2>
        <div className="animate-pulse px-7.5 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12 rounded-[10px] bg-white py-6 shadow-1 dark:bg-gray-900 dark:shadow-card xl:col-span-4">
      <h2 className="mb-5.5 px-7.5 text-body-2xlg font-bold text-dark dark:text-white">
        Chats
      </h2>

      <ul>
        {data.map((chat: ChatData, key: number) => (
          <li key={key}>
            <Link
              href="/"
              className="flex items-center gap-4.5 px-7.5 py-3 outline-none hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-dark-2 dark:focus-visible:bg-dark-2"
            >
              <div className="relative shrink-0">
                <Image
                  src={chat.profile}
                  width={56}
                  height={56}
                  className="size-14 rounded-full object-cover"
                  alt={"Avatar for " + chat.name}
                />

                <span
                  className={cn(
                    "absolute bottom-0 right-0 size-3.5 rounded-full ring-2 ring-white dark:ring-dark-2",
                    chat.isActive ? "bg-green" : "bg-orange-light",
                  )}
                />
              </div>

              <div className="relative flex-grow">
                <h3 className="font-medium text-dark dark:text-white">
                  {chat.name}
                </h3>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "truncate text-sm font-medium dark:text-dark-5 xl:max-w-[8rem]",
                      chat.unreadCount && "text-dark-4 dark:text-dark-6",
                    )}
                  >
                    {chat.lastMessage.content}
                  </span>

                  <DotIcon />

                  <time
                    className="text-xs"
                    dateTime={chat.lastMessage.timestamp}
                  >
                    {formatMessageTime(chat.lastMessage.timestamp)}
                  </time>
                </div>

                {!!chat.unreadCount && (
                  <div className="pointer-events-none absolute right-0 top-1/2 aspect-square max-w-fit -translate-y-1/2 select-none rounded-full bg-primary px-2 py-0.5 text-sm font-medium text-white">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
