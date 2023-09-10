import { IGDriveFiles } from "types/api/files";
import { APIFilesResponse } from "types/api/response";

const mockFiles: APIFilesResponse = {
  timestamp: Date.now(),
  responseTime: 0,
  folders: [],
  files: [],
  nextPageToken: "nextpageToken",
  readmeExists: true,
  bannerExists: true,
  passwordExists: false,
};
const mockFilesProtected: APIFilesResponse = {
  timestamp: Date.now(),
  responseTime: 0,
  folders: [],
  files: [],
  nextPageToken: "nextpageToken",
  readmeExists: true,
  bannerExists: true,
  passwordExists: true,
};

for (let i = 0; i < 10; i++) {
  const folder: IGDriveFiles = {
    mimeType: "application/vnd.google-apps.folder",
    encryptedId: `encryptedId${i + 1}`,
    name: `folder${i + 1}`,
    trashed: false,
    modifiedTime: new Date().toISOString(),
  };
  const file: IGDriveFiles = {
    mimeType: "application/vnd.google-apps.file",
    encryptedId: `encryptedId${i + 1}`,
    name: `file${i + 1}`,
    trashed: false,
    modifiedTime: new Date().toISOString(),
    fileExtension: "txt",
    encryptedWebContentLink: "encryptedWebContentLink",
    size: Math.floor(Math.random() * 1000000000),
    thumbnailLink: "/og.png",
    imageMediaMetadata:
      Math.random() > 0.5
        ? {
            width: 1920,
            height: 1080,
            rotation: 0,
          }
        : null,
    videoMediaMetadata:
      Math.random() > 0.5
        ? {
            width: 1920,
            height: 1080,
            durationMillis: 100000,
          }
        : null,
  };

  mockFiles.folders.push(folder);
  mockFiles.files.push(file);

  folder.name = `folder${i + 1}protected`;
  file.name = `file${i + 1}protected`;
  mockFilesProtected.folders.push(folder);
  mockFilesProtected.files.push(file);
}

export { mockFiles, mockFilesProtected };
