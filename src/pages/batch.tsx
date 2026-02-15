import { CONFIG } from 'src/config-global';

import { BatchView } from 'src/sections/batch/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Users - ${CONFIG.appName}`}</title>

      <BatchView />
    </>
  );
}
