export type FilePath = {
  name: string;
  encryptedId: string;
  mimeType: string;
};

export type ValidateFilePathResponse = FilePath[];
