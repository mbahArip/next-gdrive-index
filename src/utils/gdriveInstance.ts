import { drive_v3, google } from "googleapis";

const base64Decode = (data: string) => {
  const buff = Buffer.from(data, "base64");
  return buff.toString("ascii");
};

const serviceB64: {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
} = JSON.parse(base64Decode(process.env.GD_SERVICE_B64 as string));
// const serviceAccount = {
//   email: process.env.GD_SERVICE_EMAIL,
//   key: (process.env.GD_SERVICE_PVKEY as string).replace(
//     /\\n/g,
//     "\n",
//   ),
//   projectId: process.env.GD_SERVICE_PROJECT_ID,
//   clientId: process.env.GD_SERVICE_CLIENT_ID,
//   scopes: ["https://www.googleapis.com/auth/drive"],
// };
const serviceAccount = {
  email: serviceB64.client_email,
  key: serviceB64.private_key,
  projectId: serviceB64.project_id,
  clientId: serviceB64.client_id,
  scopes: ["https://www.googleapis.com/auth/drive"],
};

let gdrive: drive_v3.Drive | undefined;

const serviceAccountAuth = new google.auth.GoogleAuth({
  credentials: {
    type: "service_account",
    private_key: serviceAccount.key,
    client_email: serviceAccount.email,
    client_id: serviceAccount.clientId,
  },
  projectId: serviceAccount.projectId,
  scopes: serviceAccount.scopes,
});

if (!gdrive) {
  gdrive = google.drive({
    version: "v3",
    auth: serviceAccountAuth,
    fetchImplementation: (url, init) =>
      fetch(url, {
        ...init,
        next: {
          revalidate: 3600,
        },
      }),
  });
}
export const gdriveNoCache = google.drive({
  version: "v3",
  auth: serviceAccountAuth,
});

export default gdrive as drive_v3.Drive;
