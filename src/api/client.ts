import type { Api } from './types';

let cached: Promise<Api> | undefined;

/** The mock sits behind a dynamic import in a branch Vite folds away when VITE_API_MODE=http. */
export const getApi = (): Promise<Api> =>
  (cached ??=
    import.meta.env.VITE_API_MODE === 'http'
      ? import('./httpApi').then((m) => m.httpApi)
      : import('./mock').then((m) => m.mockApi));
