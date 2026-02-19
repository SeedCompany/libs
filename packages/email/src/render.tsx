import { Component, type ReactNode, Suspense } from 'react';
import { readStream } from './read-stream.js';

export const render = async (node: ReactNode) => {
  const reactDOMServer = await import('react-dom/server').then((m) => {
    if ('default' in m) {
      return m.default;
    }
    return m;
  });

  let html!: string;
  await new Promise<void>((resolve, reject) => {
    const ErrorBoundary = createErrorBoundary(reject);
    if (
      Object.hasOwn(reactDOMServer, 'renderToReadableStream') &&
      typeof WritableStream !== 'undefined'
    ) {
      reactDOMServer
        .renderToReadableStream(
          <ErrorBoundary>
            <Suspense>{node}</Suspense>
          </ErrorBoundary>,
          {
            progressiveChunkSize: Number.POSITIVE_INFINITY,
            onError(error) {
              // Carson replaced this line
              // Throwing just triggered React to resolve the rendering with the error, and the error never bubbled out.
              // https://github.com/resend/react-email/pull/2852
              reject(error);
              // Throw immediately when an error occurs to prevent CSR fallback
              // throw error;
            },
          },
        )
        .then((stream) => readStream(stream))
        .then((result) => {
          html = result;
          resolve();
        })
        .catch(reject);
    } else {
      const stream = reactDOMServer.renderToPipeableStream(
        <ErrorBoundary>
          <Suspense>{node}</Suspense>
        </ErrorBoundary>,
        {
          async onAllReady() {
            html = await readStream(stream);
            resolve();
          },
          onError(error) {
            reject(error);
          },
          progressiveChunkSize: Number.POSITIVE_INFINITY,
        },
      );
    }
  });

  const doctype =
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';

  const document = `${doctype}${html.replace(/<!DOCTYPE.*?>/, '')}`;

  return document;
};

function createErrorBoundary(reject: (error: Error) => void) {
  return class ErrorBoundary extends Component<{ children: ReactNode }> {
    componentDidCatch(error: Error) {
      reject(error);
    }

    render() {
      return this.props.children;
    }
  };
}
