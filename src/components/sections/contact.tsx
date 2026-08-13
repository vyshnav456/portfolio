"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  Send,
} from "lucide-react";
import { sendMessage } from "@/app/actions";
import { initialContactState } from "@/lib/contact-state";
import { profile } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { Magnetic, Reveal, Reveal3D } from "@/components/motion-primitives";

function LinkedinIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.8v1.64h.05c.53-.95 1.83-1.95 3.76-1.95 4.02 0 4.76 2.5 4.76 5.76V21h-4v-5.6c0-1.34-.03-3.06-1.9-3.06-1.9 0-2.19 1.45-2.19 2.96V21h-4z" />
    </svg>
  );
}

const fieldBase =
  "w-full rounded-xl border border-line bg-fg/[0.02] px-4 py-3 text-[14px] text-fg placeholder:text-faint outline-none transition-colors focus:border-accent/60";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Magnetic strength={0.2}>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send size={15} />
            Send message
          </>
        )}
      </button>
    </Magnetic>
  );
}

export function Contact() {
  const [state, formAction] = useActionState(sendMessage, initialContactState);

  const links = [
    { icon: Mail, label: profile.email, href: `mailto:${profile.email}` },
    { icon: Phone, label: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}` },
    {
      icon: LinkedinIcon,
      label: "www.linkedin.com/in/vyshnavkkumar",
      href: profile.linkedin,
    },
  ];

  return (
    <section id="contact" className="mx-auto max-w-5xl px-5 py-24 sm:px-6 sm:py-32">
      <SectionHeading
        index="06"
        label="Contact"
        title={
          <>
            Have something you&apos;d like{" "}
            <span className="text-gradient">built</span>?
          </>
        }
      >
        Open to full stack and AI engineering roles, plus consulting on RAG and
        LLM integration. I read everything that lands here.
      </SectionHeading>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.25fr]">
        {/* direct links */}
        <div className="space-y-3">
          {links.map(({ icon: Icon, label, href }, i) => (
            <Reveal key={label} delay={i * 0.06}>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                className="group flex items-center gap-3 rounded-2xl border border-line bg-elev/40 px-4 py-3.5 transition-colors hover:border-accent/45"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-fg/[0.03] text-muted transition-colors group-hover:text-accent">
                  <Icon size={14} />
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-muted transition-colors group-hover:text-fg">
                  {label}
                </span>
                <ArrowUpRight
                  size={14}
                  className="shrink-0 text-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                />
              </a>
            </Reveal>
          ))}
        </div>

        {/* form */}
        <Reveal3D delay={0.1} axis="y" origin="right" angle={13}>
          <form action={formAction} className="glass relative rounded-3xl p-6 sm:p-7">
            {/* honeypot */}
            <div className="absolute -left-[9999px]" aria-hidden>
              <label htmlFor="company">Company</label>
              <input id="company" name="company" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mono-label mb-2 block">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  placeholder="Your name"
                  aria-invalid={!!state.errors?.name}
                  className={fieldBase}
                />
                {state.errors?.name && (
                  <p className="mt-1.5 text-[12px] text-red-400">{state.errors.name}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="mono-label mb-2 block">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  aria-invalid={!!state.errors?.email}
                  className={fieldBase}
                />
                {state.errors?.email && (
                  <p className="mt-1.5 text-[12px] text-red-400">{state.errors.email}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="message" className="mono-label mb-2 block">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                placeholder="What are you working on?"
                aria-invalid={!!state.errors?.message}
                className={`${fieldBase} resize-none`}
              />
              {state.errors?.message && (
                <p className="mt-1.5 text-[12px] text-red-400">{state.errors.message}</p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <SubmitButton />
              <AnimatePresence mode="wait">
                {state.status !== "idle" && state.message && (
                  <motion.p
                    key={state.message}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    role="status"
                    className={`flex items-center gap-1.5 text-[12.5px] ${
                      state.status === "success" ? "text-accent-4" : "text-red-400"
                    }`}
                  >
                    {state.status === "success" ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <AlertCircle size={13} />
                    )}
                    {state.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </form>
        </Reveal3D>
      </div>
    </section>
  );
}
