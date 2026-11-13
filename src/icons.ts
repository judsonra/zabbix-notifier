import { createElement, Play, Square, RefreshCw, Bell, BellOff, Settings } from 'lucide';
import type { IconNode } from 'lucide';

const icons: Record<string, IconNode> = {
  'play-icon': Play,
  'stop-icon': Square,
  'refresh-icon': RefreshCw,
  'bell-icon': Bell,
  'muted-icon': BellOff,
  'settings-icon': Settings
};

/** Mount only the Lucide icons used by the toolbar, preserving stateful slots. */
export function mountIcons(): void {
  for (const [id, icon] of Object.entries(icons)) {
    const slot = document.getElementById(id);
    if (!slot) throw new Error('Ícone não encontrado: ' + id);
    slot.replaceChildren(createElement(icon, {
      width: '20', height: '20', 'stroke-width': '2',
      'aria-hidden': 'true', focusable: 'false'
    }));
  }
}
