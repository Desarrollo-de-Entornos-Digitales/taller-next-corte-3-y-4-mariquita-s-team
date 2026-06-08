'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import AlertBanner from '../../../components/ui/AlertBanner';
import Button from '../../../components/ui/Button';
import TextField from '../../../components/ui/TextField';
import { useAuthSession } from '../../../hooks/useAuthSession';
import { fetchUserById, updateUser } from '../../../lib/api';
import {
    formatDisplayName,
    getAuthUserBio,
    getAuthUserEmail,
    getAuthUsername,
    setAuthUserAvatar,
    setAuthUserBio,
    setAuthUsername,
} from '../../../lib/auth';
import { ROLE_PROFILES } from '../../../lib/categories';
import { useNotificationStore } from '../../../stores/useNotificationStore';

const ROLE_BADGES: Record<string, { label: string; color: string }> = {
    seller: { label: 'Seller', color: 'bg-amber-100 text-amber-800 ring-amber-200' },
    buyer: { label: 'Buyer', color: 'bg-sky-100 text-sky-800 ring-sky-200' },
    admin: { label: 'Admin', color: 'bg-purple-100 text-purple-800 ring-purple-200' },
};

function Avatar({ src, name, size = 'lg' }: { src?: string; name: string; size?: 'sm' | 'lg' }) {
    const dim = size === 'lg' ? 'h-24 w-24 text-3xl' : 'h-12 w-12 text-lg';
    return (
        <div className={`relative ${dim} overflow-hidden rounded-full ring-4 ring-white/30`}>
            {src ? (
                <Image src={src} alt={name} fill className="object-cover" unoptimized />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/20 font-bold">
                    {name.charAt(0).toUpperCase()}
                </div>
            )}
        </div>
    );
}

export default function ProfilePage() {
    const router = useRouter();
    const session = useAuthSession();
    const pushNotification = useNotificationStore((state) => state.push);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('');
    const [profileDescription, setProfileDescription] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [roleLabel, setRoleLabel] = useState('user');
    const [createdAt, setCreatedAt] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [tab, setTab] = useState<'info' | 'edit'>('info');

    useEffect(() => {
        if (!session.ready) return;
        if (!session.authenticated || !session.userId) {
            router.replace('/login');
            return;
        }

        const loadProfile = async () => {
            setLoading(true);
            setError('');
            setUsername(getAuthUsername() ?? formatDisplayName(getAuthUserEmail()));
            setEmail(getAuthUserEmail() ?? '');
            setBio(getAuthUserBio() ?? '');
            setAvatarUrl(session.avatarUrl ?? '');
            setRoleLabel(session.role ?? 'user');

            try {
                const user = await fetchUserById(session.userId!);
                setUsername(user.username);
                setEmail(user.email);
                setBio(user.bio ?? '');
                setProfileDescription(user.profileDescription ?? user.bio ?? '');
                setAvatarUrl(user.avatarUrl ?? '');
                setRoleLabel(user.role?.name ?? session.role ?? 'user');
                setCreatedAt(user.createdAt ?? '');
                setAuthUsername(user.username);
                setAuthUserBio(user.bio ?? '');
                if (user.avatarUrl) setAuthUserAvatar(user.avatarUrl);
            } catch {
                pushNotification('info', 'Showing cached profile data.');
            } finally {
                setLoading(false);
            }
        };

        void loadProfile();
    }, [
        session.ready,
        session.authenticated,
        session.userId,
        session.role,
        session.avatarUrl,
        router,
        pushNotification,
    ]);

    const handleAvatarFile = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            pushNotification('error', 'Image must be smaller than 2 MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') setAvatarUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!session.userId) return;
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            if (!username.trim()) throw new Error('Username is required.');
            await updateUser(session.userId, {
                username: username.trim(),
                bio: bio.trim(),
                profileDescription: profileDescription.trim(),
                avatarUrl: avatarUrl.startsWith('data:') ? avatarUrl : avatarUrl.trim() || undefined,
            });
            setAuthUsername(username.trim());
            setAuthUserBio(bio.trim());
            if (avatarUrl) setAuthUserAvatar(avatarUrl);
            setSuccess('Profile updated successfully.');
            pushNotification('success', 'Your profile was updated.');
            setTab('info');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error saving profile.';
            setError(message);
            pushNotification('error', message);
        } finally {
            setSaving(false);
        }
    };

    if (!session.ready || loading) {
        return (
            <div className="mx-auto flex w-full max-w-4xl items-center justify-center py-20">
                <p className="text-sm text-gray-500">Loading profile...</p>
            </div>
        );
    }

    const badge = ROLE_BADGES[roleLabel] ?? { label: roleLabel, color: 'bg-gray-100 text-gray-700 ring-gray-200' };
    const memberSince = createdAt
        ? new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        : null;
    const roleProfile =
        roleLabel === 'seller' || roleLabel === 'buyer' ? ROLE_PROFILES[roleLabel] : ROLE_PROFILES.buyer;
    const activityCards = session.isSeller
        ? [
              { label: 'Published products', href: '/mis-posts', description: 'Manage your active listings' },
              { label: 'Sales history', href: '/historial-ventas', description: 'Track completed purchases' },
              { label: 'Messages', href: '/mensajes', description: 'Reply to buyer inquiries' },
              { label: 'Notifications', href: '/notificaciones', description: 'Stay updated on new activity' },
          ]
        : [
              { label: 'Favorites', href: '/favoritos', description: 'Products you saved for later' },
              { label: 'Cart', href: '/carrito', description: 'Review items before checkout' },
              { label: 'Messages', href: '/mensajes', description: 'Chat with sellers' },
              { label: 'Notifications', href: '/notificaciones', description: 'Purchase and message alerts' },
          ];

    return (
        <div className="mx-auto w-full max-w-4xl space-y-6">
            {/* Hero banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a3d28] via-[#2f7d4d] to-[#4ca46d] p-8 text-white shadow-lg">
                <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
                <div className="absolute -bottom-10 right-10 h-40 w-40 rounded-full bg-white/5" />

                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end">
                    <Avatar src={avatarUrl || undefined} name={username} size="lg" />

                    <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-bold">{username}</h1>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${badge.color}`}>
                                {badge.label}
                            </span>
                        </div>
                        <p className="text-sm text-white/80">{email}</p>
                        {bio && <p className="max-w-md text-sm text-white/70">{bio}</p>}
                        {memberSince && <p className="text-xs text-white/50">Member since {memberSince}</p>}
                    </div>

                    <button
                        type="button"
                        onClick={() => setTab(tab === 'edit' ? 'info' : 'edit')}
                        className="shrink-0 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-white/20"
                    >
                        {tab === 'edit' ? 'View profile' : 'Edit profile'}
                    </button>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                    { label: 'Role', value: badge.label },
                    { label: 'Status', value: 'Active' },
                    { label: 'Account', value: 'Verified' },
                    { label: 'Member since', value: memberSince ?? '—' },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 text-center"
                    >
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                            {stat.label}
                        </p>
                        <p className="mt-1 text-sm font-bold text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            {tab === 'info' ? (
                /* Info view */
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">About</h2>
                        {profileDescription ? (
                            <p className="text-sm leading-relaxed text-gray-700">{profileDescription}</p>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No profile description yet.</p>
                        )}
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                            Marketplace activity
                        </h2>
                        <p className="text-sm leading-relaxed text-gray-600">{roleProfile.description}</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {activityCards.map((card) => (
                                <Link
                                    key={card.href}
                                    href={card.href}
                                    className="rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-green-200 hover:bg-green-50/60"
                                >
                                    <p className="text-sm font-semibold text-gray-900">{card.label}</p>
                                    <p className="mt-1 text-xs leading-relaxed text-gray-600">{card.description}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* Edit form */
                <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                    <h2 className="mb-6 text-lg font-bold text-gray-900">Edit profile</h2>

                    {error && (
                        <div className="mb-4">
                            <AlertBanner variant="error" message={error} />
                        </div>
                    )}
                    {success && (
                        <div className="mb-4">
                            <AlertBanner variant="success" message={success} />
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={(e) => void handleSubmit(e)}>
                        {/* Photo section */}
                        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:flex-row sm:items-center">
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gray-200">
                                {avatarUrl ? (
                                    <Image src={avatarUrl} alt="Preview" fill className="object-cover" unoptimized />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-green-700">
                                        {username.charAt(0).toUpperCase() || '?'}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-3">
                                <TextField
                                    label="Profile photo URL"
                                    value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                    placeholder="https://example.com/photo.jpg"
                                />
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarFile}
                                    />
                                    Upload from device
                                </label>
                            </div>
                        </div>

                        <TextField
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            minLength={3}
                            errorText={!username.trim() ? 'Required' : undefined}
                        />

                        <TextField
                            label="Email address"
                            type="email"
                            value={email}
                            disabled
                            inputClassName="bg-gray-100 cursor-not-allowed"
                        />

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Short bio</label>
                            <textarea
                                className="min-h-20 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-700"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                maxLength={255}
                                placeholder="A brief summary about you or your activity"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Profile description</label>
                            <textarea
                                className="min-h-28 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-700"
                                value={profileDescription}
                                onChange={(e) => setProfileDescription(e.target.value)}
                                maxLength={500}
                                placeholder="Tell others about your farm, what you buy, or your business"
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button type="submit" disabled={saving} className="w-auto px-8">
                                {saving ? 'Saving...' : 'Save changes'}
                            </Button>
                            <button
                                type="button"
                                className="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                                onClick={() => setTab('info')}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
