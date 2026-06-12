export interface OnboardingProfile {
  role?: string;
  country?: string | null;
  interests?: string[] | null;
  location?: string | null;
}

export function getOnboardingRoute(profile?: OnboardingProfile | null) {
  if (!profile) {
    return "SignIn";
  }

  if (profile.role === "admin") {
    return "Admin";
  }

  const hasCountry = !!profile.country?.trim();
  const hasLocation = !!profile.location?.trim();
  const hasInterests = Array.isArray(profile.interests) && profile.interests.length > 0;

  if (!hasCountry) {
    return "SelectCountry";
  }

  if (!hasLocation) {
    return "SelectLocation";
  }

  if (!hasInterests) {
    return "SelectInterest";
  }

  return "Drawer";
}