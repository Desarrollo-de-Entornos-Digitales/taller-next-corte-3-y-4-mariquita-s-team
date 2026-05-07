'use client';

import { useState } from 'react';
import type { ComponentProps } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Footer from '../../components/Footer';
import AuthCard from '../../components/ui/AuthCard';
import Button from '../../components/ui/Button';
import PasswordField from '../../components/ui/PasswordField';
import TextField from '../../components/ui/TextField';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const DEFAULT_ROLE_ID = 2;

export default function RegistroPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formError, setFormError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitRegistration = async () => {
        setSuccessMessage('');

        if (password !== confirmPassword) {
            setFormError('Passwords do not match.');
            return;
        }

        setFormError('');
        setIsSubmitting(true);

        const payload = {
            username: username.trim(),
            email: email.trim(),
            password,
            roleId: DEFAULT_ROLE_ID,
            ...(bio.trim() ? { bio: bio.trim() } : {}),
        };

        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorBody = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
                const backendMessage = errorBody?.message;
                const message =
                    typeof backendMessage === 'string'
                        ? backendMessage
                        : Array.isArray(backendMessage)
                          ? backendMessage.join(', ')
                          : 'Could not create your account.';
                throw new Error(message);
            }

            const normalizedUsername = username.trim();
            const normalizedEmail = email.trim();

            sessionStorage.setItem(
                'onboardingDraft',
                JSON.stringify({
                    username: normalizedUsername,
                    email: normalizedEmail,
                }),
            );

            sessionStorage.setItem(
                'onboardingCredentials',
                JSON.stringify({
                    email: normalizedEmail,
                    password,
                }),
            );

            setSuccessMessage('Account created successfully. Continue by completing your profile setup.');
            setUsername('');
            setEmail('');
            setBio('');
            setPassword('');
            setConfirmPassword('');
            router.push('/onboarding/profile');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unexpected error creating account.';
            setFormError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit: NonNullable<ComponentProps<'form'>['onSubmit']> = (event) => {
        event.preventDefault();
        void submitRegistration();
    };

    return (
        <div className="min-h-screen bg-[#f3f3f3] text-gray-900">
            <main className="flex min-h-[calc(100vh-80px)] w-full flex-col overflow-hidden bg-white shadow-sm lg:flex-row">
                <section className="relative min-h-[360px] w-full lg:w-1/2">
                    <Image src="/Vaca.png" alt="Vaca en el campo" fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute left-10 top-16 max-w-sm text-black">
                        <h1 className="text-4xl font-bold leading-tight">
                            Join <span className="text-[#4ca46d]">VincoBov</span>
                            <br />
                            and grow your business
                            <br />
                            quickly and easily
                        </h1>
                        <p className="mt-6 text-sm text-black/80">
                            Create your free account and start buying and selling in minutes.
                        </p>
                    </div>
                </section>

                <section className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2 lg:px-12">
                    <AuthCard title="Create your account" subtitle="Complete the information to begin">
                        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                            <TextField
                                label="Full Name"
                                type="text"
                                placeholder="e.g. Kevin Rodriguez"
                                required
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                            />

                            <TextField
                                label="Email Address"
                                type="email"
                                placeholder="example.1@gmail.com"
                                required
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                            />

                            <TextField
                                label="Bio (Optional)"
                                type="text"
                                placeholder="Tell us something about you"
                                value={bio}
                                onChange={(event) => setBio(event.target.value)}
                            />

                            <PasswordField
                                label="Password"
                                placeholder="Enter your password"
                                required
                                minLength={8}
                                pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                helperText="It must be a combination of minimum 8 letters, numbers, and symbols."
                            />

                            <PasswordField
                                label="Confirm Password"
                                placeholder="Enter your password"
                                required
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                helperText="It must be the same password."
                            />

                            <label className="flex items-start gap-2 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-green-700"
                                    required
                                />
                                <span>I accept the terms and conditions and the privacy policy.</span>
                            </label>

                            {formError && <p className="text-center text-xs text-rose-500">{formError}</p>}
                            {successMessage && <p className="text-center text-xs text-green-700">{successMessage}</p>}

                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating account...' : 'Sing up'}
                            </Button>

                            <p className="text-center text-sm text-gray-600">
                                Do you aleady have an account?{' '}
                                <Link href="/login" className="font-medium text-green-700">
                                    Log in
                                </Link>
                            </p>
                        </form>
                    </AuthCard>
                </section>
            </main>

            <Footer />
        </div>
    );
}
