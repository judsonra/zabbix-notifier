"""Gera pacotes novos; recusa sobrescrever qualquer arquivo existente."""
from pathlib import Path
import json
import zipfile
import struct
import zlib
import argparse

parser = argparse.ArgumentParser(description='Gera pastas e ZIPs sem sobrescrever destinos existentes.')
parser.add_argument(
    '--browsers', nargs='+',
    choices=['chrome', 'firefox', 'opera', 'vivaldi', 'brave'],
    default=['chrome', 'firefox'],
    help='Navegadores a gerar (padrão: chrome firefox).',
)
parser.add_argument('--output-dir', type=Path, help='Diretório de saída (padrão: pasta do projeto).')
args = parser.parse_args()

ROOT = Path(__file__).resolve().parent
OUTPUT = args.output_dir.resolve() if args.output_dir else ROOT
LOCALES = ['pt_BR', 'en', 'es']
FILES = ['core.js', 'background.js', 'popup.html', 'popup.js', 'notifier.css', 'LICENSE-lucide.txt'] + [f'_locales/{loc}/messages.json' for loc in LOCALES]
def chunk(kind, data):
    return struct.pack('!I', len(data)) + kind + data + struct.pack('!I', zlib.crc32(kind + data))
pixels = b''.join(b'\x00' + bytes([190, 32, 48, 255]) * 128 for _ in range(128))
icon = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('!2I5B', 128, 128, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(pixels)) + chunk(b'IEND', b'')
manifests = {}
for browser in dict.fromkeys(args.browsers):
    manifest = {
        'manifest_version': 3, 'name': '__MSG_extName__', 'version': '1.0.6',
        'description': '__MSG_extDescription__', 'default_locale': 'pt_BR',
        'permissions': ['storage', 'alarms', 'notifications'],
        'optional_host_permissions': ['https://*/*'],
        'action': {'default_popup': 'popup.html', 'default_icon': 'icon.png'},
        'icons': {'128': 'icon.png'},
    }
    if browser != 'firefox':
        manifest['minimum_chrome_version'] = '120'
        manifest['background'] = {'service_worker': 'background.js'}
    else:
        manifest['background'] = {'scripts': ['core.js', 'background.js']}
        manifest['browser_specific_settings'] = {'gecko': {
            'id': 'zabbix-notifier@app-plugin-zabbix.local', 'strict_min_version': '140.0',
            'data_collection_permissions': {'required': ['none']}
        }}
    manifests[browser] = manifest
targets = [OUTPUT / browser / name for browser in manifests for name in FILES + ['icon.png', 'manifest.json']]
targets += [OUTPUT / f'zabbix-notifier-{browser}.zip' for browser in manifests]
if any(path.exists() for path in targets):
    raise SystemExit('Destino existente: geração interrompida para preservar os arquivos. Use uma nova cópia do projeto para gerar novamente.')
for browser, manifest in manifests.items():
    folder = OUTPUT / browser
    contents = {name: (ROOT / name).read_bytes() for name in FILES}
    contents['icon.png'] = icon
    contents['manifest.json'] = (json.dumps(manifest, ensure_ascii=False, indent=2) + '\n').encode()
    for name, content in contents.items():
        (folder / name).parent.mkdir(parents=True, exist_ok=True)
        with (folder / name).open('xb') as output:
            output.write(content)
    with zipfile.ZipFile(OUTPUT / f'zabbix-notifier-{browser}.zip', 'x', zipfile.ZIP_DEFLATED) as archive:
        for name, content in contents.items():
            archive.writestr(name, content)
    print(f'Gerado: {folder}')
