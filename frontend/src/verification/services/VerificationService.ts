// verification/services/verificationService.ts

import type { CredentialItem } from "../types/Verification.types";

export const verificationService = {
  async getCredentials(): Promise<CredentialItem[]> {
    // Simulated API payload matching the design
    return [
      {
        id: "contractor-license",
        title: "Contractor License",
        description:
          "Drag & drop or browse files to upload your valid state or local contractor license",
        status: "pending",
        fileName: null,
      },
      {
        id: "insurance-certificate",
        title: "Insurance Certificate",
        description:
          "Drag & drop or browse files to general liability or workers' compensation certificate",
        status: "approved",
        fileName: "liability_certificate.pdf",
      },
      {
        id: "business-registration",
        title: "Business Registration",
        description:
          "Drag & drop or browse files to proof of business entity (e.g., LLC, Corp) and EIN",
        status: "requires_action",
        fileName: null,
        actionRequired: true,
      },
    ];
  },

  async uploadFile(id: string, file: File): Promise<{ fileName: string }> {
    void id;
    // Simulated upload delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { fileName: file.name };
  },
};
