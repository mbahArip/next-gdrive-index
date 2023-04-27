import drive from "@utils/driveClient";
import config from "@config/site.config";
import { verifyHash } from "@utils/hashHelper";
import { TFileParent } from "@/types/googleapis";

export function buildQuery({
  id,
  extraQuery,
  globalSearch = false,
}: {
  id?: string;
  extraQuery?: string[];
  globalSearch?: boolean;
}) {
  const query = [
    "name != '.password'",
    "'me' in owners",
    "trashed = false",
    // "mimeType != 'application/vnd.google-apps.shortcut'",
  ];

  if (id && !globalSearch) {
    query.unshift(`'${id}' in parents`);
  }
  if (!id && !globalSearch) {
    query.unshift(`'${config.files.rootFolder}' in parents`);
  }

  if (extraQuery) {
    query.unshift(...extraQuery);
  }

  return query.join(" and ");
}

export async function validateProtected(
  fileId: string | TFileParent[],
  passwordHash?: string,
): Promise<{ isProtected: boolean; valid?: boolean; protectedId?: string }> {
  const fetchPassword = await drive.files.list({
    q: `name = '.password' and 'me' in owners and trashed = false`,
    fields: "files(id, name, parents)",
    pageSize: 1000,
  });
  let passwordFile;
  let protectedId;
  if (typeof fileId === "string") {
    passwordFile = fetchPassword.data.files?.find(
      (file) => file.parents?.[0] === fileId,
    );
    protectedId = fileId;
  }
  if (Array.isArray(fileId)) {
    const parentsIdMap = fileId.map((parent) => parent.id);
    passwordFile = fetchPassword.data.files?.find((file) =>
      parentsIdMap.includes(file.parents?.[0] as string),
    );
    protectedId = passwordFile?.parents?.[0];
  }

  if (!passwordFile) return { isProtected: false };

  const getPassword = await drive.files.get(
    {
      fileId: passwordFile.id as string,
      alt: "media",
    },
    { responseType: "text" },
  );

  if (!passwordHash)
    return {
      isProtected: true,
      valid: false,
      protectedId,
    };

  return {
    isProtected: true,
    valid: verifyHash(getPassword.data as string, passwordHash),
    protectedId,
  };
}
