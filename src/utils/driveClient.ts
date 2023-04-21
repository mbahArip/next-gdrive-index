import apiConfig from "@config/api.config";
import { google, drive_v3 } from "googleapis";

class DriveClient {
  private instance: drive_v3.Drive;

  constructor() {
    const oauth2Client = new google.auth.OAuth2(
      apiConfig.client_id,
      process.env.CLIENT_SECRET,
      apiConfig.redirect_uri,
    );
    oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
    this.instance = google.drive({ version: "v3", auth: oauth2Client });
  }

  getInstance() {
    if (!this.instance) {
      const oauth2Client = new google.auth.OAuth2(
        apiConfig.client_id,
        process.env.CLIENT_SECRET,
        apiConfig.redirect_uri,
      );
      oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
      this.instance = google.drive({ version: "v3", auth: oauth2Client });
    }
    return this.instance;
  }
}

const drive = new DriveClient();

export default drive.getInstance();
