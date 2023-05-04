import axios from "axios";
import { FilesResponse } from "types/googleapis";

const fetcher = async <T>(url: string, headers: Record<string, string> = {}) =>
  axios.get<T>(url, { headers }).then((res) => res.data);

export function buildNextKey(apiURL: string) {
  return (pageIndex: number, previousPageData: FilesResponse) => {
    if (previousPageData && !previousPageData.nextPageToken) {
      return null;
    }
    const pageToken = previousPageData ? previousPageData.nextPageToken : "";
    return `${apiURL}?pageToken=${pageToken}`;
  };
}

export default fetcher;
