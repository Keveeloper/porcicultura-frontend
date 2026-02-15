import { CONFIG } from 'src/config-global';

import { BatchStageDetailsView } from 'src/sections/batch-stage-details/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Users - ${CONFIG.appName}`}</title>

      <BatchStageDetailsView />
    </>
  );
}
