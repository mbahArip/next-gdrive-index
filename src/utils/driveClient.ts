import apiConfig from "config/api.config";
import { drive_v3, google } from "googleapis";
import { decrypt } from "utils/encryptionHelper";

const decryptedSecret: string = decrypt(
  apiConfig.client_secret,
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string,
);
const decryptedRefreshToken: string = decrypt(
  apiConfig.refresh_token,
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string,
);

const oauth2Client = new google.auth.OAuth2(
  apiConfig.client_id,
  process.env.DRIVE_CLIENT_SECRET as string,
);
oauth2Client.setCredentials({
  refresh_token: process.env.DRIVE_REFRESH_TOKEN as string,
});

let gdriveInstance;
if (!gdriveInstance) {
  gdriveInstance = google.drive({
    version: "v3",
    auth: oauth2Client,
  });
}

export default gdriveInstance as drive_v3.Drive;
