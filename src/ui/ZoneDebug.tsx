import { useState } from 'react';
import { Button } from './Button';

export function ZoneDebug() {
  const [on, setOn] = useState(() => 'zones' in document.documentElement.dataset);
  const toggle = () => {
    const d = document.documentElement.dataset;
    if ('zones' in d) delete d.zones;
    else d.zones = '';
    setOn(!on);
  };
  return (
    <Button aria-pressed={on} onClick={toggle}>
      Zones: {on ? 'on' : 'off'}
    </Button>
  );
}
