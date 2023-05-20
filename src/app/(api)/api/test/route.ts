import { NextResponse } from "next/server";
import { ErrorResponse } from "types/googleapis";
import driveClient from "utils/driveClient";

export async function GET() {
  const _start = Date.now();
  try {
    const ids = [
      "18h88Fit0MgIrHTGBEtpIbcHIZ_GEgpuP",
      "1KgPV6QB1GYT8fmn2uTfbtr9rDXqcRR0j",
      "1pctigJQKaF7GbDU1t8s0gT-0fPfNhl0B",
      "16p09HGtImeuuvn06W6hDlDzSPqF4e80g",
    ];
    const fields = "id, name, mimeType, parents";
    const startFetch0 = Date.now();
    const id0 = driveClient.files
      .get({
        fileId: ids[0],
        fields,
      })
      .then((res) => res.data);
    const startFetch1 = Date.now();
    const id1 = driveClient.files.get({
      fileId: ids[1],
      fields,
    });
    const startFetch2 = Date.now();
    const id2 = driveClient.files
      .get({
        fileId: ids[2],
        fields,
      })
      .then((res) => res.data);
    const startFetch3 = Date.now();
    const id3 = driveClient.files.get({
      fileId: ids[3],
      fields,
    });
    const fetchStarted = Date.now();
    const files = await Promise.all([id0, id1, id2, id3]);
    const fetchFinished = Date.now();
    // const files = await Promise.all(
    //   ids.map(async (id) => {
    //     const file = await driveClient.files.get({
    //       fileId: id,
    //       fields: "id, name, mimeType, parents",
    //     });
    //     return file.data;
    //   }),
    // );

    const payload = {
      success: true,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - _start,
      code: 200,
      timing: {
        fetch0: startFetch0,
        fetch1: startFetch1,
        fetch2: startFetch2,
        fetch3: startFetch3,
        fetchStarted,
        fetchFinished,
        duration: fetchFinished - startFetch0,
      },
      files,
    };

    return NextResponse.json(payload, {
      status: 200,
    });
  } catch (error: any) {
    const payload: ErrorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - _start,
      code: error.code || 500,
      errors: {
        message:
          error.errors?.[0].message ||
          error.message ||
          "Unknown error",
        reason:
          error.errors?.[0].reason ||
          error.cause ||
          "internalError",
      },
    };

    return NextResponse.json(payload, {
      status: payload.code || 500,
    });
  }
}
