import { CONFIG } from 'src/config-global';

import { BatcheStagesView } from 'src/sections/batch-stages/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Users - ${CONFIG.appName}`}</title>

      <BatcheStagesView />
    </>
  );
}
