'use client';

import { FormEvent, useState } from 'react';

import HelpLayout from '../../../../components/help/HelpLayout';
import { useNotificationStore } from '../../../../stores/useNotificationStore';

export default function ContactSupportPage() {
    const push = useNotificationStore((s) => s.push);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('general');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (!name.trim() || !email.trim() || !message.trim()) return;

        setSending(true);
        setTimeout(() => {
            push('success', 'Your message was sent. Our team will reply within 24–48 hours.');
            setName('');
            setEmail('');
            setSubject('general');
            setMessage('');
            setSending(false);
        }, 600);
    };

    return (
        <HelpLayout
            title="Contact Support"
            subtitle="Send us a message and we will get back to you as soon as possible."
        >
            <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-800">
                <p className="font-semibold">Support hours</p>
                <p className="mt-1">Monday – Friday, 8:00 AM – 6:00 PM (COT)</p>
                <p className="mt-2 text-green-700">Email: support@vincobov.com</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Your name</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-700"
                        placeholder="John Doe"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Email address</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-700"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Subject</label>
                    <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-700"
                    >
                        <option value="general">General question</option>
                        <option value="account">Account issue</option>
                        <option value="buying">Buying / orders</option>
                        <option value="selling">Selling / listings</option>
                        <option value="technical">Technical problem</option>
                    </select>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
                    <textarea
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-700"
                        placeholder="Describe your issue or question..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={sending}
                    className="rounded-xl bg-green-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
                >
                    {sending ? 'Sending...' : 'Send message'}
                </button>
            </form>
        </HelpLayout>
    );
}
