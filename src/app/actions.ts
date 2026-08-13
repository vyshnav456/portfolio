"use server";

import { z } from "zod";
import { profile } from "@/lib/data";
import type { ContactState } from "@/lib/contact-state";

const ContactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80),
  email: z.string().trim().email("That email doesn't look right."),
  message: z
    .string()
    .trim()
    .min(10, "A little more detail, please (10+ characters).")
    .max(4000),
  // honeypot — real users never fill this
  company: z.string().max(0).optional().or(z.literal("")),
});

export async function sendMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = ContactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    company: formData.get("company") ?? "",
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      errors: {
        name: flat.name?.[0],
        email: flat.email?.[0],
        message: flat.message?.[0],
      },
    };
  }

  const { name, email, message, company } = parsed.data;

  // Silently accept bot submissions so they don't retry.
  if (company) return { status: "success", message: "Thanks — message sent." };

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL ?? profile.email;
  const from = process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";

  // No provider configured (local dev): log and succeed so the UI is testable.
  if (!apiKey) {
    console.info("[contact] no RESEND_API_KEY set — message not delivered:", {
      name,
      email,
      message,
    });
    return {
      status: "success",
      message: "Thanks — message received. I'll get back to you shortly.",
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Portfolio enquiry from ${name}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      }),
    });

    if (!res.ok) {
      console.error("[contact] resend error:", res.status, await res.text());
      return {
        status: "error",
        message: `Couldn't send that. Email me directly at ${to}.`,
      };
    }

    return {
      status: "success",
      message: "Thanks — message sent. I'll get back to you shortly.",
    };
  } catch (err) {
    console.error("[contact] request failed:", err);
    return {
      status: "error",
      message: `Something went wrong. Email me directly at ${to}.`,
    };
  }
}
