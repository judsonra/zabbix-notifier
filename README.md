# Zabbix Notifier

**English** · [Português (Brasil)](README.pt-BR.md) · [Español](README.es.md)

Extension for Zabbix 7.0 on Chrome, Firefox, Opera, Vivaldi and Brave. The URL starts blank; you provide an API token and a polling interval of 30, 45 or 60 seconds. It needs no intermediate backend and never changes data in Zabbix. The interface is available in English, Brazilian Portuguese and Spanish.

📖 **Documentation:** [project wiki](https://github.com/judsonra/zabbix-notifier/wiki) (English, Português, Español).

## Install on Chrome

1. Open `chrome://extensions` and enable Developer mode.
2. Click **Load unpacked** and select the `chrome` folder of this project.
3. Open the extension icon, enter an HTTPS URL, a token and an interval, then click **Test and save connection**.
4. Allow access to the server you entered and allow notifications in your operating system.

## Install on Opera, Vivaldi or Brave

The packages use Manifest V3 with the same code as the Chrome version. Use an up-to-date desktop browser based on Chromium 120 or later.

| Browser | Extensions page | Project folder | ZIP package |
| --- | --- | --- | --- |
| Opera | `opera://extensions` | `opera` | `zabbix-notifier-opera.zip` |
| Vivaldi | `vivaldi://extensions` | `vivaldi` | `zabbix-notifier-vivaldi.zip` |
| Brave | `brave://extensions` | `brave` | `zabbix-notifier-brave.zip` |

1. Open the browser's extensions page and turn on **Developer mode**.
2. Click **Load unpacked** and select the matching folder.
3. If you use the ZIP, extract it first and select the folder that contains `manifest.json`.
4. Open the extension, enter an HTTPS URL, a token and an interval, then click **Test and save connection**.
5. Allow access to the server and allow notifications in your operating system.

The connection and permissions must be configured separately in each browser. The packages still need manual validation in these browsers against a real Zabbix server.

References: [Opera](https://help.opera.com/en/extensions/testing/), [Vivaldi](https://help.vivaldi.com/desktop/appearance-customization/extensions/) and [Brave](https://support.brave.app/hc/en-us/articles/360017909112-How-can-I-add-extensions-to-Brave).

## Install on Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on** and select `firefox/manifest.json`.
3. Configure the connection from the extension icon.

A temporary Firefox installation ends when the browser restarts. Permanent installation and normal distribution require signing by Mozilla; the included ZIP is not signed yet. Chrome requires version 120 or later; Firefox requires 140 or later. The ZIPs are distribution packages for review/publishing and contain no credentials.

## Usage

Under **Settings → Problem severities**, choose which levels are included in the query, list, counter and notifications. All six severities are selected by default, including on older connections. At least one must stay selected. Filters are saved automatically when you check or uncheck an option, without retyping the token. The panel confirms the save or reports any failure. If you try to uncheck the last severity, it stays selected. When the filter changes, problems that already exist do not trigger retroactive notifications.

The icon bar contains, in this order:

- **Start/stop automatic checks:** the square stops periodic queries; the triangle starts them again. The previous list stays visible while paused. When started, the extension queries the current list without generating retroactive notifications.
- **Refresh now:** runs a manual query, even while automatic checks are paused, without re-enabling them.
- **Do Not Disturb:** keeps queries, the list and the counter up to date but blocks new notifications. Events queried during silence are recorded so they are not notified again when the mode is turned off. It does not remove notifications already shown by the system.
- **Settings:** opens or closes the connection form and the suppressed-problems filter.

The pause and Do Not Disturb states are saved locally and respected when the panel is reopened or the browser restarts. Controls start with checks active and Do Not Disturb off. Icons have hover descriptions and accessible names.

- Enter the URL of the web interface, including the subdirectory when there is one, such as `https://server.example/zabbix/`. No server is pre-filled.
- Use a token tied to a user with read access to the hosts and to the `problem.get` and `trigger.get` APIs. Monitoring respects that user's permissions.
- Under **Settings**, **Show suppressed problems** is unchecked by default, including on connections created before version 1.0.1. With this default the API excludes suppressed problems; they do not appear in the list, the counter or new notifications. When checked, the query includes suppressed problems and the list marks them as **Suppressed**.
- This preference is saved automatically when changed, without retyping the token. **Test and save connection** also saves the option. When the filter is saved, the query sets a new baseline without notifying about existing problems. If a query fails, the previous list stays marked as possibly outdated until the next successful query.
- The first query shows existing problems without notifying about them. Later ones notify about new problems. When several arrive together, one notification summarizes the batch; the list contains all of them.
- Click a notification or a list item to open the event details. The web interface may require your normal login: the extension's token does not authenticate the web session.
- The counter shows active problems. `!` indicates a failure; the previous list stays and is marked as possibly outdated.
- The browser must be running. The interval is a requested schedule with no punctuality guarantee: suspend, power saving and browser throttling may delay queries.
- Events that appear and are resolved between queries are not detected, because this version queries only active problems.
- The token is kept in the extension's local storage, without syncing and without extra encryption. **Disconnect and delete token** removes the local connection; it does not revoke the token on the server. Permissions already granted can be revoked on the extension management page.
- HTTPS with a trusted certificate is required. The token goes only to the configured API; redirects are blocked. There is no telemetry and no external libraries.
- When editing the connection, enter the token again. An invalid connection does not replace the previous one.

## Languages

The extension uses `chrome.i18n` (also available in Firefox as `browser.i18n`) and follows the browser's language. Available languages: **English** (`en`), **Brazilian Portuguese** (`pt_BR`, the default) and **Spanish** (`es`). If the browser is set to another language, the interface appears in Brazilian Portuguese. This applies to the panel, notifications, error messages, and the extension's name and description on the extensions page. Error messages returned by the Zabbix API itself stay in the server's language.

Translations live in `_locales/<language>/messages.json`. To add a language, copy `_locales/en` to a new folder named after the language code (for example `fr`), translate the `message` field of each key, and add the code to the `LOCALES` list in `build-extension.py`. Fixed panel text lives in `popup.html` using the `data-i18n`, `data-i18n-title` and `data-i18n-aria-label` attributes, and dynamic text uses `t('key')` from `src/i18n.ts`. When adding a key, add it to all three languages.

## Update 1.0.6

Version 1.0.6 adds multi-language support (English, Brazilian Portuguese and Spanish). Its folders and ZIPs are in `releases/1.0.6/`, in the `chrome`, `firefox`, `opera`, `vivaldi` and `brave` subfolders. To update an unpacked installation, select your browser's folder inside `releases/1.0.6/` or, if it already points to that path, click **Reload** on the extensions page. The saved connection and preferences are kept.

The `chrome`, `firefox`, `opera`, `vivaldi` and `brave` folders at the project root and the ZIPs at the root remain at earlier versions, and earlier releases under `releases/` were preserved.

## Icons

Interface icons follow the **Lucide** style, with imports centralized in `src/icons.ts`, 20 px size and stroke width 2. The library is included locally at build time; only the icons in use go into the package. The license is in `LICENSE-lucide.txt`. The convention is also recorded in the personal `lucide-icons` skill.

## Development and validation

The TypeScript sources live in `src/`: `types.ts` defines data and messages, `platform.ts` centralizes the extension API and storage, `i18n.ts` provides translated text, `core.ts` validates settings and links, `background.ts` runs the monitoring and `popup.ts` controls the panel. The `core.js`, `background.js` and `popup.js` files at the root are generated automatically; edit the TypeScript files.

Install development dependencies with `npm ci`. Run `npm run build` to check types in strict mode and compile the scripts for the browsers. Run `npm test` to compile and run the TypeScript tests in `tests/notifier.test.ts`. The build script is in `scripts/build.ts`; exact dependencies and versions are in `package-lock.json`.

`npm run package:extensions` compiles and generates the five packages in a new directory `releases/1.0.6`. Browsers run only the compiled JavaScript, with no external runtime dependencies. `python3 build-extension.py` generates the `chrome` and `firefox` folders and their ZIPs, including `_locales`. To pick the browsers, use:

```sh
python3 build-extension.py --browsers opera vivaldi brave
```

To generate all five in a new copy of the project, use `python3 build-extension.py --browsers chrome firefox opera vivaldi brave`. To preserve files, the generator refuses existing destinations; for another run, use a new copy of the sources in an empty directory.

To generate into a new directory without replacing existing packages, use `python3 build-extension.py --browsers chrome firefox opera vivaldi brave --output-dir releases/1.0.6`.

Run `npm test` to test configuration, links, polling, the suppressed filter, pause, Do Not Disturb, deduplication and network failures with simulated APIs. The old command `node test-notifier.cjs` also forwards to that suite. These tests do not replace validation in a real browser and against a real server.

Documentation: [Zabbix 7.0 API](https://www.zabbix.com/documentation/7.0/en/manual/api), [Chrome alarms](https://developer.chrome.com/docs/extensions/reference/api/alarms), [Chrome/Firefox background](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background).

## License

Released under the [MIT License](LICENSE). The Lucide icons are distributed under their own licenses (ISC and MIT), in [LICENSE-lucide.txt](LICENSE-lucide.txt).

Zabbix Notifier is an independent project, not affiliated with or endorsed by Zabbix SIA. Zabbix is a registered trademark of Zabbix SIA.
