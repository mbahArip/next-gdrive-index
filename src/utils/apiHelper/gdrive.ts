import { drive_v3, google } from "googleapis";

import apiConfig from "config/api.config";

//TODO: Move client_secret and refresh_token to config after setup page is done
const config = {
  client_id:
    process.env.NODE_ENV === "development"
      ? apiConfig.dev_client_id
      : apiConfig.client_id,
  client_secret:
    process.env.NODE_ENV === "development"
      ? process.env.DEV_DRIVE_CLIENT_SECRET
      : process.env.DRIVE_CLIENT_SECRET,
  refresh_token:
    process.env.NODE_ENV === "development"
      ? process.env.DEV_DRIVE_REFRESH_TOKEN
      : process.env.DRIVE_REFRESH_TOKEN,
};

//TODO: Refetch token if it's become invalid
let gdrive: drive_v3.Drive | undefined;

const oauth2Client = new google.auth.OAuth2({
  clientId: config.client_id,
  clientSecret: config.client_secret as string,
  eagerRefreshThresholdMillis: 10000,
  redirectUri: "http://localhost",
});
oauth2Client.setCredentials({
  refresh_token: config.refresh_token as string,
});
gdrive = google.drive({
  version: "v3",
  auth: oauth2Client,
});
export default gdrive;
