import { CONFIG } from 'src/config-global';

import { RegisterView } from 'src/sections/register/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Sign in - ${CONFIG.appName}`} </title>

      <RegisterView />
    </>
  );
}
