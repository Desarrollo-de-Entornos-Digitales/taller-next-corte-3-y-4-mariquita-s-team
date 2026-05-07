'use client';

import { useState } from 'react';
import type { ComponentProps } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import Footer from '../../components/Footer';
import AuthCard from '../../components/ui/AuthCard';
import Button from '../../components/ui/Button';
import TextField from '../../components/ui/TextField';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [formError, setFormError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitForgotPassword = async () => {
        setFormError('');
        setSuccessMessage('');
        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email.trim() }),
            });

            // Si el backend no tiene endpoint aun, igual dejamos el flujo listo y controlado.
            if (!response.ok) {
                console.info('[FORGOT_PASSWORD] endpoint pending or unavailable', { status: response.status });
            }

            setSuccessMessage('If the email exists, a reset code has been sent.');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unexpected error while requesting reset code.';
            setFormError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit: NonNullable<ComponentProps<'form'>['onSubmit']> = (event) => {
        event.preventDefault();
        void submitForgotPassword();
    };

    return (
        <div className="min-h-screen bg-[#f3f3f3] text-gray-900">
            <main className="flex min-h-[calc(100vh-80px)] w-full flex-col overflow-hidden bg-white shadow-sm lg:flex-row">
                <section className="relative min-h-[360px] w-full lg:w-1/2">
                    <Image
                        src="/Vaca.png"
                        alt="Vaca en el campo"
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/15" />
                </section>

                <section className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2 lg:px-12">
                    <AuthCard
                        title="Forgotten your password?"
                        subtitle="There is nothing to worry about, we'll send you a message to help you reset your password."
                        className="border-gray-300 bg-[#f9f9f9]"
                    >
                        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                            <TextField
                                label="Email Address"
                                type="email"
                                placeholder="example.1@gmail.com"
                                required
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                inputClassName="border-gray-400 bg-white"
                            />

                            {formError && <p className="text-center text-xs text-rose-500">{formError}</p>}
                            {successMessage && <p className="text-center text-xs text-green-700">{successMessage}</p>}

                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Sending...' : 'Send Reset Code'}
                            </Button>

                            <p className="text-center text-sm text-gray-600">
                                Remembered your password?{' '}
                                <Link href="/login" className="font-medium text-green-700 hover:text-green-800">
                                    Back to Log In
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