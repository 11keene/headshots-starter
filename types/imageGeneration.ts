export type PackType = 'starter' | 'themed' | 'custom';

    export interface OrderDetails {
      orderId: string;
      userId: string;
      userEmail: string;
      packType: PackType;
      /** number of extra packs/upsells (0 if none) */
      extras?: number;
      /** for custom packs, the raw intake‐form text */
      intakeForm?: string;
    }
