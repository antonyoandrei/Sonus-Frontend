export const getProfileInitials = (displayName: string): string => {
  const words = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  const initials = words.map((word) => word[0]?.toUpperCase() ?? "").join("");
  return initials || "S";
};

const profileTones = ["coral", "blue", "lime", "sand", "violet", "ink"] as const;

export type ProfileTone = (typeof profileTones)[number];

export const getProfileTone = (value: string): ProfileTone => {
  const source = value.trim().toLowerCase();
  if (!source) return "coral";

  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash + source.charCodeAt(index) * (index + 17)) % 240;
  }

  return profileTones[hash % profileTones.length];
};
