import { CONFIG } from 'src/config-global';

import { BatchStageReportView } from 'src/sections/batch-stage-report/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Informe de Etapa - ${CONFIG.appName}`}</title>

      <BatchStageReportView />
    </>
  );
}
