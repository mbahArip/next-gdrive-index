import apiConfig from "@config/api.config";
import { google, drive_v3 } from "googleapis";
import { decrypt } from "@utils/encryptionHelper";

class DriveClient {
  instance: drive_v3.Drive;
  private decryptedSecret: string = decrypt(
    apiConfig.client_secret,
    process.env.ENCRYPTION_KEY as string,
  );
  private decryptedRefreshToken: string = decrypt(
    apiConfig.refresh_token,
    process.env.ENCRYPTION_KEY as string,
  );

  constructor() {
    const oauth2Client = new google.auth.OAuth2(
      apiConfig.client_id,
      this.decryptedSecret,
    );
    oauth2Client.setCredentials({ refresh_token: this.decryptedRefreshToken });
    this.instance = google.drive({ version: "v3", auth: oauth2Client });
    oauth2Client.on("tokens", (tokens) => {
      if (tokens.refresh_token) {
        console.log("Refresh: ", tokens.refresh_token);
      }
      if (tokens.access_token) {
        console.log("Access: ", tokens.access_token);
      }
    });
  }

  getInstance() {
    if (!this.instance) {
      const oauth2Client = new google.auth.OAuth2(
        apiConfig.client_id,
        this.decryptedSecret,
      );
      oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN,
      });
      this.instance = google.drive({ version: "v3", auth: oauth2Client });
      console.log(oauth2Client.credentials.access_token);
    }
    return this.instance;
  }
}

const drive = new DriveClient();

export default drive.getInstance();
