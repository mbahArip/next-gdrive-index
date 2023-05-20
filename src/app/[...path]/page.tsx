import { cookies } from "next/headers";
import axios from "axios";
import { ValidatePathResponse } from "types/googleapis";

async function _validatePath(path: string) {
  const { data } = await axios.get<ValidatePathResponse>(
    `/api/validate-path?path=${path}`,
  );
  return data;
}

type Props = {
  params: {
    path: string[];
  };
};
async function ListIdPage({ params }: Props) {
  const validatePath = await _validatePath(
    params.path.join("/"),
  );
  const c = cookies();
  const token = c.has("token") ? c.get("token")?.name : "";
  return <div>lorem - {token}</div>;
}

export default ListIdPage;
