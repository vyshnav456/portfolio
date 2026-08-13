/**
 * Shared shape for the contact form's action state.
 *
 * This deliberately lives outside `app/actions.ts`: a `"use server"` module
 * only exports server-function references across the network boundary, so a
 * plain object exported from there arrives on the client as `{}`.
 */
export type ContactState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Partial<Record<"name" | "email" | "message", string>>;
};

export const initialContactState: ContactState = {
  status: "idle",
  message: "",
};
