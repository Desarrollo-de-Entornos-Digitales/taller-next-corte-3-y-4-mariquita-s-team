'use client';

import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuthSession } from '../../../hooks/useAuthSession';
import { createMessage, fetchChats, fetchMessages } from '../../../lib/api';
import type { ApiChat, ApiMessage } from '../../../lib/types';
import { useNotificationStore } from '../../../stores/useNotificationStore';

function formatTime(value: string) {
    try {
        return new Date(value).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '';
    }
}

function MessagesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const session = useAuthSession();
    const push = useNotificationStore((s) => s.push);

    const [chats, setChats] = useState<ApiChat[]>([]);
    const [messages, setMessages] = useState<ApiMessage[]>([]);
    const [activeChatId, setActiveChatId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [draft, setDraft] = useState('');

    const requestedChatId = Number(searchParams.get('chatId'));

    useEffect(() => {
        if (!session.ready) return;
        if (!session.authenticated) {
            router.replace('/login');
            return;
        }

        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const [chatData, messageData] = await Promise.all([fetchChats(), fetchMessages()]);
                const myChats = chatData.filter(
                    (chat) => chat.seller?.id === session.userId || chat.buyer?.id === session.userId,
                );
                const myChatIds = new Set(myChats.map((chat) => chat.id));
                setChats(myChats);
                setMessages(messageData.filter((message) => myChatIds.has(message.chat?.id ?? -1)));

                if (Number.isFinite(requestedChatId)) {
                    setActiveChatId(requestedChatId);
                } else {
                    setActiveChatId((prev) => prev ?? chatData[0]?.id ?? null);
                }
            } catch (e) {
                const message = e instanceof Error ? e.message : 'Could not load messages.';
                setError(message);
                push('error', message);
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, [session.ready, session.authenticated, router, push, requestedChatId, session.userId]);

    useEffect(() => {
        if (!session.ready || !session.authenticated) {
            return;
        }

        const refreshMessages = async () => {
            try {
                const [chatData, messageData] = await Promise.all([fetchChats(), fetchMessages()]);
                const myChats = chatData.filter(
                    (chat) => chat.seller?.id === session.userId || chat.buyer?.id === session.userId,
                );
                const myChatIds = new Set(myChats.map((chat) => chat.id));
                setChats(myChats);
                setMessages(messageData.filter((message) => myChatIds.has(message.chat?.id ?? -1)));
            } catch {
                // Silencioso: el polling no debe interrumpir la conversación activa.
            }
        };

        const intervalId = window.setInterval(() => {
            void refreshMessages();
        }, 5_000);

        return () => window.clearInterval(intervalId);
    }, [session.ready, session.authenticated, session.userId]);

    const activeChat = useMemo(() => chats.find((c) => c.id === activeChatId) ?? null, [chats, activeChatId]);

    const activeMessages = useMemo(() => {
        if (!activeChatId) return [];
        return messages
            .filter((m) => m.chat?.id === activeChatId)
            .slice()
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [messages, activeChatId]);

    const lastMessageByChat = useMemo(() => {
        const map = new Map<number, ApiMessage>();
        for (const msg of messages) {
            const chatId = msg.chat?.id;
            if (!chatId) continue;
            const prev = map.get(chatId);
            if (!prev || new Date(msg.createdAt).getTime() > new Date(prev.createdAt).getTime()) {
                map.set(chatId, msg);
            }
        }
        return map;
    }, [messages]);

    const getChatPartner = (chat: ApiChat) => {
        const myId = session.userId;
        return chat.seller?.id === myId ? chat.buyer : chat.seller;
    };

    const getChatTitle = (chat: ApiChat) => {
        const other = getChatPartner(chat);
        return other?.username || other?.email || `Chat #${chat.id}`;
    };

    const handleSend = async (event: FormEvent) => {
        event.preventDefault();
        if (!activeChatId || !session.userId) return;
        if (!draft.trim()) return;

        try {
            await createMessage({ chatId: activeChatId, senderId: session.userId, content: draft.trim() });
            setDraft('');
            const messageData = await fetchMessages();
            setMessages(messageData);
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Could not send message.';
            push('error', message);
        }
    };

    const activePartner = activeChat ? getChatPartner(activeChat) : null;

    return (
        <div className="mx-auto w-full max-w-6xl">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                <p className="mt-1 text-sm text-gray-600">Your saved conversations with buyers and sellers.</p>
            </div>

            {loading ? <p className="rounded-lg bg-white p-3 text-sm text-gray-700">Loading chats...</p> : null}
            {error ? (
                <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600" role="alert">
                    {error}
                </p>
            ) : null}

            {!loading && chats.length === 0 ? (
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <p className="text-sm text-gray-700">You do not have any conversations yet.</p>
                    <p className="mt-2 text-sm text-gray-500">
                        Open a product and use &quot;Contact seller&quot; to start chatting.
                    </p>
                </div>
            ) : null}

            {chats.length > 0 ? (
                <div className="grid min-h-[70vh] gap-4 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm lg:grid-cols-[340px_1fr]">
                    <aside className="border-r border-gray-100">
                        <div className="border-b border-gray-100 px-4 py-4">
                            <p className="text-sm font-semibold text-gray-900">Conversations</p>
                            <p className="text-xs text-gray-500">{chats.length} chats</p>
                        </div>
                        <ul className="max-h-[65vh] overflow-auto">
                            {chats.map((chat) => {
                                const last = lastMessageByChat.get(chat.id);
                                const partner = getChatPartner(chat);
                                const active = chat.id === activeChatId;
                                return (
                                    <li key={chat.id}>
                                        <button
                                            type="button"
                                            className={`w-full px-4 py-3 text-left transition ${
                                                active ? 'bg-green-50' : 'hover:bg-gray-50'
                                            }`}
                                            onClick={() => setActiveChatId(chat.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                                                    {(partner?.username ?? 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="truncate text-sm font-semibold text-gray-900">
                                                            {getChatTitle(chat)}
                                                        </p>
                                                        {last ? (
                                                            <span className="shrink-0 text-[11px] text-gray-500">
                                                                {formatTime(last.createdAt)}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    <p className="mt-1 line-clamp-1 text-xs text-gray-600">
                                                        {last?.content ?? 'No messages yet'}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </aside>

                    <section className="flex min-h-[70vh] flex-col">
                        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
                            {activePartner?.avatarUrl ? (
                                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                                    <Image
                                        src={activePartner.avatarUrl}
                                        alt={activePartner.username ?? 'User'}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                                    {(activePartner?.username ?? 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    {activeChat ? getChatTitle(activeChat) : 'Select a conversation'}
                                </p>
                                <p className="text-xs text-gray-500">{activeMessages.length} messages in this chat</p>
                            </div>
                        </div>

                        <div className="flex-1 space-y-3 overflow-auto bg-[#f8faf9] px-5 py-5">
                            {activeMessages.length === 0 ? (
                                <p className="text-sm text-gray-600">No messages in this conversation yet.</p>
                            ) : (
                                activeMessages.map((m) => {
                                    const mine = m.sender?.id === session.userId;
                                    return (
                                        <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                            <div
                                                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                                                    mine
                                                        ? 'bg-[#2f7d4d] text-white'
                                                        : 'bg-white text-gray-900 ring-1 ring-gray-200'
                                                }`}
                                            >
                                                {!mine ? (
                                                    <p className="mb-1 text-[11px] font-semibold text-green-700">
                                                        {m.sender?.username ?? 'User'}
                                                    </p>
                                                ) : null}
                                                <p>{m.content}</p>
                                                <p
                                                    className={`mt-1 text-[11px] ${
                                                        mine ? 'text-white/80' : 'text-gray-500'
                                                    }`}
                                                >
                                                    {formatTime(m.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="border-t border-gray-100 px-5 py-4">
                            <form className="flex items-center gap-3" onSubmit={(e) => void handleSend(e)}>
                                <input
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    placeholder="Write a message..."
                                    className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-700"
                                    disabled={!activeChatId}
                                />
                                <button
                                    type="submit"
                                    disabled={!activeChatId || !draft.trim()}
                                    className="shrink-0 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    </section>
                </div>
            ) : null}
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<p className="rounded-lg bg-white p-3 text-sm text-gray-700">Loading messages...</p>}>
            <MessagesContent />
        </Suspense>
    );
}
