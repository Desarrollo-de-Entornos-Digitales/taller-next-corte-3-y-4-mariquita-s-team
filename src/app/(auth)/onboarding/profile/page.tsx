'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import Footer from '../../../../components/Footer';
import AuthCard from '../../../../components/ui/AuthCard';
import Button from '../../../../components/ui/Button';
import RoleOptionCard from '../../../../components/ui/RoleOptionCard';
import TextField from '../../../../components/ui/TextField';
import { ROLE_PROFILES } from '../../../../lib/categories';
import { updateUser } from '../../../../lib/api';
import { applyAuthUserFromLogin, setAccessToken, setAuthUserAvatar, setAuthUserRole } from '../../../../lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

const ROLE_IDS = {
    seller: 2,
    buyer: 3,
} as const;

const roleOptions = [
    {
        id: 'buyer' as const,
        title: 'Buyer',
        description: 'I am looking to buy livestock, products, or supplies.',
        icon: '🛒',
    },
    {
        id: 'seller' as const,
        title: 'Seller',
        description: 'I am looking to sell livestock, products, or supplies.',
        icon: '🏷️',
    },
];

type OnboardingDraft = {
    username?: string;
    email?: string;
};

type OnboardingCredentials = {
    email: string;
    password: string;
};

type AuthLoginResponse = {
    access_token?: string;
    accessToken?: string;
    token?: string;
    user?: {
        id?: number;
        email?: string;
        username?: string;
        avatarUrl?: string | null;
    };
    message?: string | string[];
};

export default function ProfileOnboardingPage() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<(typeof roleOptions)[number]['id']>('buyer');
    const [profileDescription, setProfileDescription] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [avatarError, setAvatarError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [draft] = useState<OnboardingDraft>(() => {
        if (typeof window === 'undefined') {
            return {};
        }

        const savedDraft = sessionStorage.getItem('onboardingDraft');
        if (!savedDraft) {
            return {};
        }

        try {
            return JSON.parse(savedDraft) as OnboardingDraft;
        } catch {
            return {};
        }
    });

    const roleProfile = ROLE_PROFILES[selectedRole];
    const displayName = draft.username ?? draft.email ?? 'User';

    const subtitle = useMemo(() => {
        if (!draft.username && !draft.email) {
            return 'This information will help us personalize your experience.';
        }

        return `Setting up profile for ${draft.username ?? draft.email}`;
    }, [draft.email, draft.username]);

    const handleAvatarFile = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setAvatarError('Image must be smaller than 2 MB.');
            return;
        }

        setAvatarError('');
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setAvatarUrl(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleContinue = async (): Promise<void> => {
        setError('');
        setSubmitting(true);

        const credentialsRaw = sessionStorage.getItem('onboardingCredentials');
        if (!credentialsRaw) {
            router.push('/login');
            return;
        }

        let credentials: OnboardingCredentials | null = null;
        try {
            const parsed = JSON.parse(credentialsRaw) as unknown;
            if (
                typeof parsed === 'object' &&
                parsed !== null &&
                'email' in parsed &&
                'password' in parsed &&
                typeof (parsed as { email: unknown }).email === 'string' &&
                typeof (parsed as { password: unknown }).password === 'string'
            ) {
                credentials = {
                    email: (parsed as { email: string }).email,
                    password: (parsed as { password: string }).password,
                };
            }
        } catch {
            credentials = null;
        }

        if (!credentials) {
            router.push('/login');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            const body = (await response.json().catch(() => null)) as AuthLoginResponse | null;
            if (!response.ok) {
                router.push('/login');
                return;
            }

            const token = body?.accessToken ?? body?.access_token ?? body?.token;
            const userId = body?.user?.id;
            if (!token || !userId) {
                router.push('/login');
                return;
            }

            setAccessToken(token);
            applyAuthUserFromLogin({
                ...body.user,
                email: body.user?.email ?? credentials.email,
                username: body.user?.username ?? draft.username,
            });
            setAuthUserRole(selectedRole);

            const composedDescription = profileDescription.trim() || roleProfile.description;
            const normalizedAvatar =
                avatarUrl.trim() && !avatarUrl.startsWith('data:')
                    ? avatarUrl.trim()
                    : avatarUrl.startsWith('data:')
                      ? avatarUrl
                      : undefined;

            await updateUser(userId, {
                roleId: ROLE_IDS[selectedRole],
                profileDescription: composedDescription,
                bio: composedDescription.slice(0, 255),
                ...(normalizedAvatar ? { avatarUrl: normalizedAvatar } : {}),
            });

            if (normalizedAvatar) {
                setAuthUserAvatar(normalizedAvatar);
            }

            sessionStorage.removeItem('onboardingCredentials');
            sessionStorage.removeItem('onboardingDraft');
            router.push('/');
        } catch (continueError) {
            const message =
                continueError instanceof Error ? continueError.message : 'Could not complete profile setup.';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#f3f3f3] text-gray-900">
            <main className="flex w-full flex-1 flex-col overflow-hidden bg-white shadow-sm lg:flex-row">
                <section className="relative min-h-[360px] w-full lg:w-1/2">
                    <Image src="/Vaca.png" alt="Cow in the field" fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-black/15" />
                </section>

                <section className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2 lg:px-12">
                    <AuthCard title="Complete your profile" subtitle={subtitle}>
                        <div className="mt-8 space-y-6">
                            <div>
                                <p className="mb-2 text-sm font-semibold text-gray-800">I want to</p>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {roleOptions.map((option) => (
                                        <RoleOptionCard
                                            key={option.id}
                                            title={option.title}
                                            description={option.description}
                                            icon={option.icon}
                                            selected={selectedRole === option.id}
                                            onClick={() => setSelectedRole(option.id)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                                <p className="text-sm font-bold text-green-900">{roleProfile.title}</p>
                                <p className="mt-2 text-sm text-green-800">{roleProfile.description}</p>
                                <ul className="mt-3 space-y-1 text-sm text-green-800">
                                    {roleProfile.highlights.map((item) => (
                                        <li key={item} className="flex gap-2">
                                            <span aria-hidden>•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                <p className="text-sm font-semibold text-gray-800">Profile photo</p>
                                <p className="mt-1 text-xs text-gray-600">
                                    Add a photo so buyers and sellers can recognize you. You can skip this and add one
                                    later from your profile.
                                </p>

                                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <div className="relative mx-auto h-24 w-24 shrink-0 overflow-hidden rounded-full bg-white ring-4 ring-white shadow-sm sm:mx-0">
                                        {avatarUrl ? (
                                            <Image
                                                src={avatarUrl}
                                                alt="Profile preview"
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-green-100 text-2xl font-bold text-green-700">
                                                {displayName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1 space-y-3">
                                        <TextField
                                            label="Photo URL (optional)"
                                            value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                                            onChange={(event) => {
                                                setAvatarError('');
                                                setAvatarUrl(event.target.value);
                                            }}
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

                                {avatarError ? <p className="mt-2 text-xs text-rose-600">{avatarError}</p> : null}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-800">
                                    Profile description
                                </label>
                                <textarea
                                    className="min-h-24 w-full rounded-md border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-700"
                                    value={profileDescription}
                                    onChange={(event) => setProfileDescription(event.target.value)}
                                    placeholder={
                                        selectedRole === 'seller'
                                            ? 'Tell buyers about your farm, products, and delivery options...'
                                            : 'Tell sellers what you are looking for, your location, and buying needs...'
                                    }
                                    maxLength={500}
                                />
                            </div>

                            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

                            <Button type="button" onClick={() => void handleContinue()} disabled={submitting}>
                                {submitting ? 'Saving profile...' : 'Continue'}
                            </Button>
                        </div>
                    </AuthCard>
                </section>
            </main>

            <Footer />
        </div>
    );
}
