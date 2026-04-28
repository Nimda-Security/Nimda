export interface ProfileDecorationOption {
  key: string;
  label: string;
  src: string;
}

export const PROFILE_DECORATIONS: ProfileDecorationOption[] = [];

const profileDecorationMap = new Map(
  PROFILE_DECORATIONS.map((decoration) => [decoration.key, decoration])
);

export const setProfileDecorationOptions = (
  decorations: ProfileDecorationOption[]
) => {
  profileDecorationMap.clear();
  decorations.forEach((decoration) => {
    profileDecorationMap.set(decoration.key, decoration);
  });
};

export const resolveProfileDecorationSrc = (
  decorationKey?: string | null
): string | null => {
  if (!decorationKey) return null;

  const normalizedKey = decorationKey.trim();
  if (!normalizedKey) return null;

  if (normalizedKey.startsWith('/') || normalizedKey.startsWith('http')) {
    return normalizedKey;
  }

  const preset = profileDecorationMap.get(normalizedKey);
  if (preset) {
    return preset.src;
  }

  return `/api/profile-decorations/${encodeURIComponent(normalizedKey)}/image`;
};
