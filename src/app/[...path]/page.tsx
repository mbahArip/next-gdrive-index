import { ValidatePathResponse } from "types/googleapis";
import fetch from "utils/generalHelper/fetch";
import { cookies } from "next/headers";

async function _validatePath(
  path: string,
  cookies?: string,
) {
  const { data } = await fetch.get<ValidatePathResponse>(
    `/api/validate/${path}`,
    {
      headers: {
        Cookie: `${cookies}`,
      },
    },
  );
  return data;
}

type Props = {
  params: {
    path: string[];
  };
};
async function FilePage({ params }: Props) {
  const cookieStore = cookies();

  const password = cookieStore.get("next-gdrive-password");
  const validatePath = await _validatePath(
    params.path.join("/"),
    `${password?.name}=${password?.value}`,
  );
  return (
    <div>
      {validatePath.data.map((item) => (
        <div key={item.id}>
          <h1>{item.name}</h1>
          <p>{item.id}</p>
        </div>
      ))}
    </div>
  );
}

export default FilePage;
