# Security policy

## Reporting a vulnerability

Please report security issues privately through GitHub's
[private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
on this repository, rather than opening a public issue.

Expect an acknowledgement within a week. This is a hobby project maintained in
spare time, so please be patient with fixes.

## What this project handles

Worth knowing before you look for a vulnerability class that does not exist here:

- There is **no backend, no server, no database and no accounts**. The whole
  project is static files served to the browser.
- The only data stored is exploration progress, kept in the visitor's own
  `localStorage` under `kerala-passport` and `kerala-world-journey`. It never
  leaves the browser.
- No analytics, telemetry, cookies or third-party scripts are loaded.
- The app makes outbound requests only for Google Fonts, and for photographs
  from `images.unsplash.com` and `upload.wikimedia.org`.
- There are no secrets, API keys or credentials in this repository, and the
  build takes no environment variables.

Reports about the security of the sites we link to, or about the absence of a
CSP on a deployment we do not control, are out of scope.
