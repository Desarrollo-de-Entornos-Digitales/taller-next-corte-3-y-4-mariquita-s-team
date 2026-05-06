'use client';

import { useState } from 'react';
import type { ComponentProps } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import Footer from '../../components/Footer';
import AuthCard from '../../components/ui/AuthCard';
import Button from '../../components/ui/Button';
import PasswordField from '../../components/ui/PasswordField';
import TextField from '../../components/ui/TextField';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type LoginPayload = {
    email: string;
    password: string;
};

type LoginResponse = {
    accessToken?: string;
    refreshToken?: string;
    message?: string | string[];
};

async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const body = (await response.json().catch(() => null)) as LoginResponse | null;

    if (!response.ok) {
        const backendMessage = body?.message;
        const message =
            typeof backendMessage === 'string'
                ? backendMessage
                : Array.isArray(backendMessage)
                    ? backendMessage.join(', ')
                    : 'Could not sign in with the provided credentials.';
        throw new Error(message);
    }

    return body ?? {};
}

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [formError, setFormError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitLogin = async () => {
        setFormError('');
        setSuccessMessage('');
        setIsSubmitting(true);

        try {
            const response = await loginRequest({
                email: email.trim(),
                password,
            });

            // JWT integration point: replace this with secure token handling strategy.
            if (response.accessToken) {
                localStorage.setItem('accessToken', response.accessToken);
                setSuccessMessage('Login successful. JWT received and ready for next integration step.');
            } else {
                setSuccessMessage('Login successful.');
            }

            if (rememberMe) {
                localStorage.setItem('rememberEmail', email.trim());
            } else {
                localStorage.removeItem('rememberEmail');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unexpected error during sign in.';
            setFormError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit: NonNullable<ComponentProps<'form'>['onSubmit']> = (event) => {
        event.preventDefault();
        void submitLogin();
    };

    return (
        <div className="min-h-screen bg-[#f3f3f3] text-gray-900">
            <main className="flex min-h-[calc(100vh-80px)] w-full flex-col overflow-hidden bg-white shadow-sm lg:flex-row">
                <section className="relative min-h-[360px] w-full lg:w-1/2">
                    <Image src="/Vaca.png" alt="Vaca en el campo" fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-black/15" />
                    <div className="absolute left-10 top-16 max-w-sm text-black">
                        <h1 className="text-5xl font-bold leading-tight">
                            <span className="text-[#2f7d4d]">We connect</span> the countryside with opportunities
                        </h1>
                        <p className="mt-6 text-lg text-black/80">
                            Buy and sell livestock, agricultural products, and much more - easily, quickly, and
                            directly.
                        </p>
                    </div>
                </section>

                <section className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2 lg:px-12">
                    <AuthCard
                        title="Welcome Back!"
                        subtitle="Please log in to continue"
                        className="border-gray-300 bg-[#f9f9f9]"
                    >
                        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                            <TextField
                                label="Email Address"
                                type="email"
                                placeholder="example.1@gmail.com"
                                required
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                inputClassName="border-gray-400 bg-white"
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
                                inputClassName="border-gray-400 bg-white"
                            />

                            <div className="flex items-center justify-between gap-4 text-sm">
                                <label className="flex items-center gap-2 text-gray-600">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-green-700"
                                        checked={rememberMe}
                                        onChange={(event) => setRememberMe(event.target.checked)}
                                    />
                                    Remember me
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="font-medium text-green-700 hover:text-green-800"
                                >
                                    Forgot Password?
                                </Link>
                            </div>

                            {formError && <p className="text-center text-xs text-rose-500">{formError}</p>}
                            {successMessage && <p className="text-center text-xs text-green-700">{successMessage}</p>}

                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Logging in...' : 'Log In'}
                            </Button>

                            <p className="text-center text-sm text-gray-600">
                                No account yet?{' '}
                                <Link href="/registro" className="font-medium text-green-700 hover:text-green-800">
                                    Sign Up
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