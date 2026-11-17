# The demo runs in the browser, with no backend

The TEKGUYZ demo standard expects a Supabase anonymous sign-in per Demo Visitor. Team Performance uses a browser-only demo instead, like Quote to Paid and FancyFam: the sample business (Coral Line Support) ships with the app, and everything the visitor does lives in their own browser. Every visitor is walled off by design, nothing costs money, nothing is sent, and there is no sign-in, visit cap or cleanup job to build. All demo data goes through the demo state modules in `lib/demo/`, and a real backend can replace them later.

State is kept in browser storage, with an in-memory fallback when storage is blocked or corrupt, so the demo never shows a blank screen.

## Consequences

- The standard's server rules (POST-only sign-in, RLS walls, visit cap, 7-day cleanup) have nothing to guard. Do not "fix" the demo by adding them.
- "Try the demo" is a plain link: opening the demo writes nothing on a server.
- There is no sign-in page, because there is no product to sign in to yet.
- No text, phone system or CRM call leaves the browser. Every simulated text is marked "Not sent: demo".
