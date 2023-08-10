import { drive_v3, google } from "googleapis";

import apiConfig from "config/api.config";

//TODO: Move client_secret and refresh_token to config after setup page is done
const config = {
  client_id: apiConfig.client_id,
  client_secret: process.env.DRIVE_CLIENT_SECRET,
  refresh_token: process.env.DRIVE_REFRESH_TOKEN,
};

const serviceAccountConfig = {
  email: process.env.DRIVE_SERVICE_EMAIL,
  key: (process.env.DRIVE_SERVICE_KEY as string).replace(
    /\\n/g,
    "\n",
  ),
  projectId: process.env.DRIVE_SERVICE_PROJECT_ID,
  clientId: process.env.DRIVE_SERVICE_CLIENT,
  scopes: ["https://www.googleapis.com/auth/drive"],
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

const serviceAccountAuth = new google.auth.GoogleAuth({
  credentials: {
    type: "service_account",
    private_key: serviceAccountConfig.key,
    client_email: serviceAccountConfig.email,
    client_id: serviceAccountConfig.clientId,
  },
  projectId: serviceAccountConfig.projectId,
  scopes: serviceAccountConfig.scopes,
});

gdrive = google.drive({
  version: "v3",
  auth: serviceAccountAuth,
});

export default gdrive as drive_v3.Drive;
