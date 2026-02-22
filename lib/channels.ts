export type ChannelKey = "home" | "about" | "projects" | "contact";

// Channels order

export const CHANNEL_ORDER: ChannelKey[] = [
  "home",
  "about",
  "projects",
  "contact",
];

export const CHANNELS: Record<
  ChannelKey,
  { label: string; ch: string; version: string }
> = {
  home: { label: "HOME", ch: "01", version: "v1.25" },
  about: { label: "ABOUT", ch: "02", version: "v1.25" },
  projects: { label: "PROJECTS", ch: "03", version: "v1.35" },
  contact: { label: "CONTACT", ch: "04", version: "v1.35" },
};