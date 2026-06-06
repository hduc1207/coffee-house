import { PayOS } from "@payos/node";

const clientId = process.env.PAYOS_CLIENT_ID;
const apiKey = process.env.PAYOS_API_KEY;
const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

export const hasPayOSEnv = !!clientId && !!apiKey && !!checksumKey;

export const payos = hasPayOSEnv
    ? new PayOS({
          clientId: clientId!,
          apiKey: apiKey!,
          checksumKey: checksumKey!,
      })
    : null;
