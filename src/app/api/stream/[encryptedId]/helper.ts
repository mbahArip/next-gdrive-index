import { Readable } from "stream";

async function* nodeStreamToIterator(stream: any) {
  for await (const chunk of stream) {
    yield chunk;
  }
}

function iteratorToStream(iterator: AsyncGenerator<any>) {
  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}
export function streamFile(body: Readable): ReadableStream {
  const data: ReadableStream = iteratorToStream(nodeStreamToIterator(body));
  return data;
}
