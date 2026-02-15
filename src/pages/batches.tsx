import { CONFIG } from 'src/config-global';

import { BatchesView } from 'src/sections/batches/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Users - ${CONFIG.appName}`}</title>

      <BatchesView />
    </>
  );
}
