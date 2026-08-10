# Deployment Security

The application is public and calls Mapbox, GeoServer, TiTiler, and the raster-data origin
directly from the browser. Every `PUBLIC_*` environment variable is visible to visitors and
must never be treated as a credential or access-control mechanism.

## Release requirements

- Run the complete CI workflow, including secret scanning, build, type checks, linting, tests,
  and a production dependency audit.
- Do not publish when critical or high production vulnerabilities are unresolved unless a
  documented security review confirms that the affected code is unreachable.
- Protect the public `main` branch and require successful checks before changes from public
  contributors are merged.
- Enable GitHub secret scanning, push protection, Dependabot alerts, and private vulnerability
  reporting.
- Enable GitHub code scanning with CodeQL default setup.
- Keep GitHub Actions and container images pinned to immutable commit hashes or digests.

Before changing the repository visibility:

- scan the complete target-repository history, including every branch and tag;
- delete obsolete `sync/*` branches and other references that are not intended to be public;
- rotate every credential found in current files or history before publishing;
- confirm that the default branch contains only the sanitized snapshot; and
- review repository members, deploy keys, webhooks, environments, Actions secrets, and installed
  GitHub Apps.

## Vercel

- Keep the application fully prerendered while no server-side functionality is required. Any
  future server route must have explicit input limits, timeouts, abuse controls, and rate
  limiting before it is exposed.
- Keep Vercel's automatic DDoS protection enabled.
- Keep Build Logs and Source Protection and Git Fork Protection enabled.
- Monitor the Firewall view and configure alerts before publication.
- Use Attack Challenge Mode during an active attack.
- Add WAF challenge or deny rules for abusive traffic patterns. Add rate limiting if expensive
  server routes are introduced in the future.
- Configure spend and usage alerts.
- Do not add an unauthenticated proxy route for GeoServer or TiTiler. Such a route would turn
  the Vercel deployment into an amplification target.

The repository supplies a Content Security Policy and additional response headers. Verify the
deployed headers after every platform or adapter change.

## TiTiler and API Gateway

- Attach AWS WAF to the public API entry point and use rate-based rules. Start new rules in
  count mode, validate them against normal traffic, and then change them to block mode.
- Set explicit API Gateway stage and route throttling limits for steady request rate and burst
  capacity.
- Allow only the HTTP methods and paths required by the application.
- Validate raster URLs against an allowlist of approved origins and object prefixes. Do not
  allow TiTiler to retrieve arbitrary URLs supplied by callers.
- Cache identical responses where appropriate and set finite upstream, processing, and response
  timeouts.
- Enable access metrics, throttling metrics, error alarms, AWS Budget alerts, and log retention.
- Protect the origin so it cannot be reached while bypassing WAF or the intended API entry point.

## S3 and raster delivery

Prefer CloudFront with Origin Access Control in front of a private S3 bucket. In that design,
`PUBLIC_S3_BUCKET_URL` should point to the CloudFront distribution.

If direct public S3 access is unavoidable:

- allow only `s3:GetObject` for the exact public object prefix;
- do not grant anonymous write, delete, ACL, or `s3:ListBucket` permissions;
- disable public ACLs and use a narrowly scoped bucket policy;
- deny requests that do not use TLS;
- enable request metrics, access logging where appropriate, and billing alerts.

## GeoServer

- Put GeoServer behind a reverse proxy or WAF and prevent direct access to the origin.
- Keep the administration console and `/rest` API off the public internet or restrict them to
  an administrative network and authenticated administrator role.
- Change all default credentials and enable brute-force protection.
- Configure WFS as read-only unless transactions are explicitly required.
- Restrict anonymous service operations and layers to the exact set required by the application.
- Set global and per-layer WFS feature limits.
- Set WMS maximum rendering time, request memory, and rendering-error limits.
- Serve tiles through GeoWebCache and enforce cache and disk quotas.
- Allow CORS only for the production application origins; do not use a wildcard origin.
- Disable unused services, output formats, demo endpoints, and extensions.
- Keep GeoServer, its servlet container, Java runtime, and plugins on supported security releases.

## Mapbox

- Use a public token with only the scopes required by the application.
- Apply URL restrictions for the production and approved preview domains.
- Use a separate token for local development.
- Configure usage notifications and rotate the token if it is exposed outside its intended
  restrictions.

## Monitoring and incident response

- Monitor request rate, latency, error rate, throttling, cache hit rate, and cost for every
  public service.
- Alert on unusual geographic distribution, repeated expensive queries, large response sizes,
  and authentication failures.
- Maintain a tested procedure to enable challenge mode, tighten rate limits, block abusive
  sources, disable a vulnerable route, and rotate credentials.
- Treat a publicly committed secret as compromised even after deleting it. Rotate it and remove
  it from public Git history.
