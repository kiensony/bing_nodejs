# Account Monitoring

The monitoring stack runs Prometheus and Grafana alongside the Control API. The provisioned **Microsoft Rewards Accounts** dashboard includes an account filter, health and status, observed balances, verified points, activity attribution, remaining quotas, streaks and time since the last completed run.

## Search Views

Select an **Account** and **Search device** (`mobile`, `desktop` or All) to compare regular search points. The search table lists each account/device pair with its latest activity status, verified points and available search points at the start of the run. The account and device charts show the same selected results grouped for comparison, followed by a history chart. These views work in local Grafana and Grafana Cloud; re-run `npm run monitoring:cloud:dashboard` to update an existing Cloud dashboard.

Search points use the current run's device summary when available and otherwise verified regular-search activity results. While a device has no verified result, its points remain Unknown. A known zero is shown as zero. During a new run, earlier search results are not reused for an account already active in that run. Bonus searches and experimental API reports are excluded from regular mobile/desktop search totals and remain visible in activity attribution. Available points are the initial quota observation, not a live remaining quota or search count.

## Start With Docker

Configure accounts in `.env` using [env.example](../env.example), then add:

```dotenv
API_TOKEN=replace-with-a-generated-token
GRAFANA_ADMIN_PASSWORD=replace-with-a-strong-password
# GRAFANA_ADMIN_USER=admin
# GRAFANA_PORT=3000
```

Generate a token with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Start the application and monitoring services from the repository root:

```bash
docker compose -f compose.yaml -f compose.monitoring.yaml up -d --build
```

Open [Grafana](http://127.0.0.1:3000/d/rewards-accounts) and sign in with `admin` (or `GRAFANA_ADMIN_USER`) and `GRAFANA_ADMIN_PASSWORD`. The data source and dashboard are provisioned automatically. Grafana is bound to host loopback; Prometheus is accessible inside the Compose network. The monitoring override enables the Control API on internal port 3010 and preserves the application's existing schedule and startup-run settings.

Grafana's administrator password is initialized on its first start. Changing `.env` does not reset a password already stored in its persistent volume. Set `GRAFANA_PORT` to a free port if 3000 is occupied.

Prometheus scrapes every 30 seconds and retains samples for 30 days. Named Docker volumes retain both monitoring databases across container recreation. Avoid `docker compose down -v` when retaining monitoring data.

## Grafana Cloud

Use Grafana Alloy to scrape the local Control API and send metrics to Grafana Cloud over HTTPS. This setup runs the application and Alloy; a local Grafana or Prometheus server is not required. No inbound API port is published.

In your Grafana Cloud stack, open **Connections > Add new connection > Hosted Prometheus** and copy its remote-write URL and username. Create a Cloud Access Policy token with `metrics:write` scope for that stack. Add these settings to `.env` alongside your account settings:

```dotenv
API_TOKEN=replace-with-a-generated-local-api-token
GRAFANA_CLOUD_PROMETHEUS_URL=https://prometheus-prod-REGION.grafana.net/api/prom/push
GRAFANA_CLOUD_PROMETHEUS_USERNAME=123456
GRAFANA_CLOUD_METRICS_TOKEN=replace-with-a-metrics-write-token
GRAFANA_CLOUD_DEPLOYMENT=rewards
```

Use the actual URL and username shown by your stack. `API_TOKEN` protects local scraping; `GRAFANA_CLOUD_METRICS_TOKEN` authenticates remote writes. Alloy receives these monitoring settings only, and keeps its remote-write queue in a persistent Docker volume. Its HTTP port is not published.

```bash
docker compose -f compose.yaml -f compose.grafana-cloud.yaml up -d --build
```

This Cloud configuration is an alternative to the local monitoring override. To use both, include both overrides in the same Compose command. Assign a unique `GRAFANA_CLOUD_DEPLOYMENT` value to each server sending to the same Cloud stack. The dashboard selects one deployment at a time to keep each server's account records separate. Cloud metrics include account email labels, balances and activity information.

### Install The Cloud Dashboard

Create a **Grafana service account token** with the Editor role, or equivalent permission to read the selected data source and create/update dashboards. This token is separate from the Cloud Access Policy token used for remote writes. Find the UID of your Cloud Prometheus data source in **Connections > Data sources**, then add:

```dotenv
GRAFANA_CLOUD_URL=https://your-stack.grafana.net
GRAFANA_CLOUD_SERVICE_ACCOUNT_TOKEN=replace-with-a-grafana-service-account-token
GRAFANA_CLOUD_PROMETHEUS_DATASOURCE_UID=grafanacloud-your-stack-prom
```

Run from the repository root:

```bash
npm run monitoring:cloud:dashboard
```

The command loads `.env`, verifies the selected Prometheus data source and creates or updates the dashboard with UID `rewards-accounts`. Re-running it replaces that dashboard, including manual edits made to it in Grafana. It prints the dashboard URL when successful. Your existing shell environment takes precedence over `.env`.

Preview the dashboard payload without contacting Cloud:

```bash
npm run monitoring:cloud:dashboard -- --dry-run
```

Alternatively, import [accounts.json](../monitoring/grafana/dashboards/accounts.json) manually in Grafana Cloud, then select your Cloud Prometheus **Data source** and **Deployment**. Allow a minute for initial samples, and run rewards jobs through the Control API to populate account observations. Query `up{job="microsoft-rewards",deployment="rewards"}` to confirm scraping. `0` indicates an API scrape failure; an absent series may indicate Alloy or Cloud remote-write configuration issues.

## Metrics

`GET /metrics` uses the same `Authorization: Bearer` or `X-API-Key` authentication as the other Control API endpoints. No credentials are included in exported labels; account email addresses and slot numbers identify series. The Prometheus container receives only the API token and writes it to a private runtime credential file for scraping.

```bash
curl http://127.0.0.1:3010/metrics -H "Authorization: Bearer $API_TOKEN"
```

The example above needs a locally running API or a host port mapping for the API. The monitoring Compose override does not publish that port.

| Metric                                                | Meaning                                                                              |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `rewards_accounts_configured`                         | Configured account slots.                                                            |
| `rewards_run_active`                                  | Active rewards run; excludes session regeneration.                                   |
| `rewards_account_status`                              | Numeric state shown below.                                                           |
| `rewards_account_balance_points`                      | Latest verified/observed available balance.                                          |
| `rewards_account_balance_updated_timestamp_seconds`   | Timestamp of the exported balance observation.                                       |
| `rewards_account_points_known`                        | Whether the current or latest run's collected points are verified.                   |
| `rewards_account_collected_points`                    | Verified collected points in the current or latest run.                              |
| `rewards_account_collected_points_by_source`          | Attributed points by activity source.                                                |
| `rewards_account_last_run_timestamp_seconds`          | Latest completed account run.                                                        |
| `rewards_account_last_run_duration_seconds`           | Duration of that completed run.                                                      |
| `rewards_account_last_run_success`                    | `1` for success, `0` otherwise; absent before any run.                               |
| `rewards_account_history_*`                           | Counts and verified points across retained run summaries.                            |
| `rewards_account_remaining_points`                    | Remaining earnable points by `mobile`, `browser` or `app` pool.                      |
| `rewards_account_search_info`                         | Configured account/device pairs (`mobile` and `desktop`).                            |
| `rewards_account_search_collected_points`             | Verified regular-search points by account and device.                                |
| `rewards_account_search_points_known`                 | Whether the selected run has known regular-search points for a device.               |
| `rewards_account_search_available_points`             | Initial available regular-search points by device.                                   |
| `rewards_account_search_status`                       | Latest search result: 0 unobserved, 1 confirmed, 2 unconfirmed, 3 skipped, 4 failed. |
| `rewards_account_streak_length`                       | Last observed streak length in calendar days.                                        |
| `rewards_account_streak_protection_remaining_seconds` | Last observed remaining protection time in seconds.                                  |

Account status codes: `0` never run, `1` running, `2` completed, `3` partial, `4` skipped, `5` failed, `6` cancelled, `7` unknown.

All exported application metrics are **gauges**. History metrics cover the retained `API_RUN_HISTORY` summaries (default 20), and can decrease as older summaries expire. Do not apply `rate()` or `increase()` to these gauges. The points chart shows snapshots of each account's current/latest run, rather than a daily earnings total.

Unknown points, balances and quotas are omitted rather than reported as zero. A verified zero is exported as zero. Failed runs retain the most recent observed balance when available. An observed balance can be known even when collected points are unknown. The table's last-finished timestamp refers to completed history, even while a new run is active. Source attribution can contain a verified subtotal while the overall collected amount is still unknown.

The API restores account observations from `config/run-history.json` after restart. Session-generation jobs do not replace rewards observations. Metrics cover configured accounts, and only work managed through the Control API is tracked. Keep the same account slot/email pairing to retain continuous Prometheus series. No history is synthesized for the period before monitoring starts.

## Existing Grafana Installation

Scrape the Control API's `/metrics` with a bearer token, a job named `microsoft-rewards`, and a 30-second interval. Use [prometheus.yml](../monitoring/prometheus/prometheus.yml) as a template, updating the API address and credential-file location for your environment.

Import [accounts.json](../monitoring/grafana/dashboards/accounts.json), then select your Prometheus data source and deployment. The local provisioned data source uses UID `rewards-prometheus`; use [the data-source definition](../monitoring/grafana/provisioning/datasources/prometheus.yml) as a template, updating its URL if needed. Scrape targets must include a `deployment` label, such as `local`, for the dashboard's deployment filter.

## Verification

```bash
npm ci --include=dev --ignore-scripts
npm run check
```

The focused monitoring tests cover authenticated HTTP scraping, unknown versus zero values, live/historical selection, session-job exclusion, label escaping and Grafana Cloud dashboard provisioning. Run them after building with `npm run test:monitoring`.
