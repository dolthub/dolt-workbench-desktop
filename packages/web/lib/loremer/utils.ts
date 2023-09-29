export const validResourceSegmentPattern = "[-a-zA-Z_]{3,32}";
const validClientCredentialIdPattern = "[0-9a-v]{45}";
const validCommitIdResourceSegmentPattern = "[-a-zA-Z0-9_]{3,32}";
export const validEmailPattern = `[a-z0-9!#$%&'*+/=?^_\`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_\`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?`;
const validInvitationNamePattern = `(${validEmailPattern}|${validResourceSegmentPattern})`;
export const vrs = validResourceSegmentPattern;
export const vcci = validClientCredentialIdPattern;
export const vcid = validCommitIdResourceSegmentPattern;
export const ve = validEmailPattern;
export const vin = validInvitationNamePattern;

export function initialUppercase(s: string) {
  const [first, ...rest] = s;
  return [first.toLocaleUpperCase(), ...rest].join("");
}
