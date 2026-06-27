import { CONFIG } from 'src/config-global';

import { FinalReportView } from 'src/sections/final-report/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Reporte final - ${CONFIG.appName}`}</title>

      <FinalReportView />
    </>
  );
}
