'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import Footer from '../../../components/Footer';
import AuthCard from '../../../components/ui/AuthCard';
import Button from '../../../components/ui/Button';
import RoleOptionCard from '../../../components/ui/RoleOptionCard';
import SelectableChip from '../../../components/ui/SelectableChip';

const roleOptions = [
    {
        id: 'buyer',
        title: 'Buyer',
        description: 'I am looking to buy livestock, products, or supplies.',
        icon: '🛒',
    },
    {
        id: 'seller',
        title: 'Seller',
        description: 'I am looking to sell livestock, products, or supplies.',
        icon: '🏷️',
    },
] as const;

const interestOptions = ['Livestock', 'Agriculture', 'Poultry farming', 'Supplies and equipment', 'Other products'];

const priceRanges = [
    { id: 'any', label: 'Any price' },
    { id: 'low', label: 'Up to $200' },
    { id: 'mid', label: '$200 - $1000' },
    { id: 'high', label: '$1000+' },
];

type OnboardingDraft = {
    username?: string;
    email?: string;
};

export default function ProfileOnboardingPage() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<(typeof roleOptions)[number]['id']>('buyer');
    const [selectedInterests, setSelectedInterests] = useState<string[]>(['Livestock']);
    const [selectedRange, setSelectedRange] = useState(priceRanges[0].id);
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

    const subtitle = useMemo(() => {
        if (!draft.username && !draft.email) {
            return 'This information will help us personalize your experience.';
        }

        return Setting up profile for ${draft.username ?? draft.email};
    }, [draft.email, draft.username]);

    const toggleInterest = (interest: string) => {
        setSelectedInterests((prev) =>
            prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest],
        );
    };

    const handleContinue = () => {
        // Placeholder: for now this remains as UI-only preferences.
        console.info('[ONBOARDING_PREFERENCES]', {
            selectedRole,
            selectedInterests,
            selectedRange,
            draft,
        });
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-[#f3f3f3] text-gray-900">
            <main className="flex min-h-[calc(100vh-80px)] w-full flex-col overflow-hidden bg-white shadow-sm lg:flex-row">
                <section className="relative min-h-[360px] w-full lg:w-1/2">
                    <Image src="/Vaca.png" alt="Vaca en el campo" fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-black/15" />
                    <div className="absolute left-10 top-16 max-w-sm text-black">
                        <h1 className="text-5xl font-bold leading-tight">
                            Complete <span className="text-[#2f7d4d]">your profile</span>
                            <br />
                            and get better opportunities
                        </h1>
                        <p className="mt-6 text-lg text-black/80">
                            Tell us more about yourself so we can personalize your experience and show what really
                            interests you.
                        </p>
                    </div>
                </section>

                <section className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2 lg:px-12">
                    <AuthCard
                        title="Tell us about yourself"
                        subtitle={subtitle}
                        className="border-gray-300 bg-[#f9f9f9]"
                    >
                        <div className="mt-8 space-y-5">
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Type of user</p>
                                <p className="text-xs text-gray-500">
                                    Select how you are going to participate in VincoBov
                                </p>
                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    {roleOptions.map((role) => (
                                        <RoleOptionCard
                                            key={role.id}
                                            title={role.title}
                                            description={role.description}
                                            icon={role.icon}
                                            selected={selectedRole === role.id}
                                            onClick={() => setSelectedRole(role.id)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-gray-800">What are your interests?</p>
                                <p className="text-xs text-gray-500">Select one or more</p>
                                <div className="mt-3 space-y-2">
                                    {interestOptions.map((interest) => (
                                        <SelectableChip
                                            key={interest}
                                            label={interest}
                                            selected={selectedInterests.includes(interest)}
                                            onClick={() => toggleInterest(interest)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="priceRange" className="text-sm font-semibold text-gray-800">
                                    Additional preferences
                                </label>
                                <p className="text-xs text-gray-500">Price range of interest</p>
                                <select
                                    id="priceRange"
                                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-700"
                                    value={selectedRange}
                                    onChange={(event) => setSelectedRange(event.target.value)}
                                >
                                    {priceRanges.map((range) => (
                                        <option key={range.id} value={range.id}>
                                            {range.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-3 pt-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-auto px-6"
                                    onClick={() => router.back()}
                                >
                                    Go Back
                                </Button>
                                <Button type="button" className="w-auto px-8" onClick={handleContinue}>
                                    Continue
                                </Button>
                            </div>
                        </div>
                    </AuthCard>
                </section>
            </main>

            <Footer />
        </div>
    );
}