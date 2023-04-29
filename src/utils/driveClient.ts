import apiConfig from "@config/api.config";
import { google, drive_v3 } from "googleapis";
import { decrypt } from "@utils/encryptionHelper";

const decryptedSecret: string = decrypt(
  apiConfig.client_secret,
  process.env.ENCRYPTION_KEY as string,
);
const decryptedRefreshToken: string = decrypt(
  apiConfig.refresh_token,
  process.env.ENCRYPTION_KEY as string,
);

const oauth2Client = new google.auth.OAuth2(
  apiConfig.client_id,
  decryptedSecret,
);
oauth2Client.setCredentials({ refresh_token: decryptedRefreshToken });
google.options({ auth: oauth2Client });

let gdriveInstance;
if (!gdriveInstance) {
  gdriveInstance = google.drive({
    version: "v3",
    auth: oauth2Client,
    http2: true,
  });
}

export default gdriveInstance as drive_v3.Drive;
