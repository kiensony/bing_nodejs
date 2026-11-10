import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import projectFiles from '../lib/projectFiles.cjs'
import { cloudDashboard, grafanaCloudSettings, installCloudDashboard } from '../lib/grafanaCloud.js'

const projectRoot = projectFiles.getProjectRoot(path.dirname(fileURLToPath(import.meta.url)))
projectFiles.loadEnvFile(projectRoot)

try {
    const args = process.argv.slice(2)
    if (args.some(arg => arg !== '--dry-run')) throw new Error('Only --dry-run is supported.')
    const settings = grafanaCloudSettings()
    const dashboard = JSON.parse(
        fs.readFileSync(path.join(projectRoot, 'monitoring/grafana/dashboards/accounts.json'), 'utf8')
    )
    if (args.includes('--dry-run')) {
        console.log(JSON.stringify({ dashboard: cloudDashboard(dashboard, settings), overwrite: true }, null, 4))
    } else {
        await installCloudDashboard({ settings, dashboard })
        console.log(`Grafana Cloud dashboard ready: ${settings.url}/d/${dashboard.uid}`)
    }
} catch (error) {
    console.error(error instanceof Error ? error.message : 'Grafana Cloud dashboard setup failed.')
    process.exitCode = 1
}
