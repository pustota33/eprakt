// Generate unique 8-character codes for each facilitator
// This mapping is consistent so the same facilitator always gets the same code

const CODE_MAP: Record<string, string> = {
  "1": "A7K2M9X1",
  "2": "B4N6P8Y3",
  "3": "C5Q1R7Z2",
  "4": "D8S3T4W5",
};

export function getCodeForFacilitator(facilitatorId: string): string {
  if (!CODE_MAP[facilitatorId]) {
    // Generate a random code if not in the map (for new facilitators)
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    CODE_MAP[facilitatorId] = code;
    return code;
  }
  return CODE_MAP[facilitatorId];
}

export function getFacilitatorIdFromCode(code: string): string | null {
  for (const [facilitatorId, facilitatorCode] of Object.entries(CODE_MAP)) {
    if (facilitatorCode === code) {
      return facilitatorId;
    }
  }
  return null;
}

export function getAllFacilitatorCodes(): Record<string, string> {
  return { ...CODE_MAP };
}
