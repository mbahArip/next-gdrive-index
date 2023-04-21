import drive from "@utils/driveClient";
import config from "@config/site.config";

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

export async function checkProtected(id: string) {
  try {
    const files = await drive.files.list({
      q: id ? buildQuery({ id }) : buildQuery({}),
      fields: "files(id)",
    });

    return {
      protected: files.data.files?.length,
      id: files.data.files?.[0].id || null,
    };
  } catch (error: any) {
    return {
      protected: false,
      id: null,
    };
  }
}

export async function validateFolderPassword(
  passwordFileId: string,
  password: string,
) {
  try {
    const folderPassword = await drive.files.get(
      {
        fileId: passwordFileId,
        alt: "media",
      },
      { responseType: "text" },
    );

    return folderPassword.data === password;
  } catch (error: any) {
    return false;
  }
}
