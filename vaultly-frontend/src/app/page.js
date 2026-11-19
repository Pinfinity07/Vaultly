'use client';

import Link from "next/link";
import { Wallet2 } from "lucide-react";
import { useEffect } from "react";
import { getCurrentUser, wakeUpServer } from "../lib/api";
import { useRouter } from "next/navigation";
import HeroSection from "../components/home/HeroSection";
import ProductShot from "../components/home/ProductShot";
import SectionAnimator from "../components/SectionAnimator";
import Button from "../components/ui/Button";

const REPO_URL = "https://github.com/Pinfinity07/Vaultly";

const FEATURES = [
  {
    title: "Every expense, easy to find",
    body: "Log a purchase in a few seconds, then search by description or filter by category and date when you need it again.",
    image: "/product/expenses.webp",
    alt: "The expenses list with a search box, filters and dated rows.",
  },
  {
    title: "Shared costs without the spreadsheet",
    body: "Make a group for your flat or a trip, add the people in it, and see what the group has spent and who logged each bill.",
    image: "/product/groups.webp",
    alt: "A group called Flat 4B with two members and its recent shared bills.",
  },
  {
    title: "Savings goals you can watch move",
    body: "Set a target and a deadline, add money as you save it, and see how far you have left to go.",
    image: "/product/goals.webp",
    alt: "Three savings goals with progress bars and days left.",
  },
];

const STEPS = [
  { title: "Create an account", body: "With Google or an email and password." },
  { title: "Add expenses or a group", body: "Log what you spend and invite the people you share costs with." },
  { title: "See where the month went", body: "Check spending by month and category, and export it as CSV." },
];

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    void wakeUpServer();

    // Signed-in visitors go straight to their dashboard.
    async function checkAuth() {
      try {
        const response = await getCurrentUser();
        if (isMounted && response?.user) router.push("/dashboard");
      } catch {
        // Unauthenticated visitor
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 rounded-control text-body font-semibold text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-control bg-ink text-white">
              <Wallet2 size={18} aria-hidden="true" />
            </span>
            Vaultly
          </Link>
          <nav aria-label="Account" className="flex items-center gap-2">
            <Button href="/login" variant="ghost">Sign in</Button>
            <Button href="/signup" variant="secondary">Create account</Button>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <HeroSection />

        <section aria-labelledby="features-heading" className="border-y border-line bg-surface py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 id="features-heading" className="max-w-[24ch] text-h2 font-semibold text-ink">
              Built for the money you spend alone and the money you split
            </h2>

            <div className="mt-12 space-y-16 sm:space-y-24">
              {FEATURES.map((feature, index) => (
                <SectionAnimator key={feature.title} animationType="slideUp">
                  <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
                    <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                      <h3 className="text-h3 font-semibold text-ink">{feature.title}</h3>
                      <p className="mt-3 max-w-[45ch] text-body text-ink-2">{feature.body}</p>
                    </div>
                    <ProductShot src={feature.image} alt={feature.alt} width={2560} height={1440} />
                  </div>
                </SectionAnimator>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="steps-heading" className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 id="steps-heading" className="text-h2 font-semibold text-ink">Up and running in three steps</h2>
            <SectionAnimator staggerChildren className="relative mt-10">
              {/* Connecting line between the step markers. */}
              <div className="absolute left-4 top-4 bottom-4 w-px bg-line md:right-4 md:bottom-auto md:h-px md:w-auto" aria-hidden="true" />
              <ol className="relative grid gap-8 md:grid-cols-3 md:gap-6">
                {STEPS.map((step, index) => (
                  <li key={step.title} data-animate className="relative flex gap-4 md:block">
                    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line-strong bg-canvas font-mono text-ui font-medium text-ink">
                      {index + 1}
                    </span>
                    <div className="md:mt-4">
                      <h3 className="text-body font-semibold text-ink">{step.title}</h3>
                      <p className="mt-1 text-body text-ink-3">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </SectionAnimator>
          </div>
        </section>

        <section className="border-t border-line bg-surface py-16 sm:py-20">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <h2 className="max-w-[28ch] text-h2 font-semibold text-ink">Start with this month&apos;s expenses.</h2>
            <Button href="/signup" size="lg">Create a free account</Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-ui text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            <span className="font-medium text-ink">Vaultly</span>, an expense tracker for individuals and shared costs.
          </p>
          <nav aria-label="Project" className="flex gap-6">
            <a href={REPO_URL} className="rounded-control hover:text-ink">GitHub</a>
            <a href={`${REPO_URL}#readme`} className="rounded-control hover:text-ink">How it&apos;s built</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
