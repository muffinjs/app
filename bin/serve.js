#!/usr/bin/env node

import bin from 'commander'
import { log, isSite } from '../lib/utils'
import { execFile, exec } from 'child_process'

bin
  .option('-w, --watch', 'Rebuild site if files change')
  .option('-p, --port <port>', 'The port on which your site will be available', parseInt)
  .parse(process.argv)

if (!isSite()) {
  log(chalk.red('No site in here!'))
  process.exit(1)
}

// Build before serving if "dist" directory doesn't exist
if (bin.watch || !exists(process.cwd() + '/dist')) {
  const builder = exec('muffin build -w')

  builder.stdout.on('data', data => process.stdout.write(chalk.green(data)))
  builder.stderr.on('data', data => console.error(data))

  builder.on('error', err => {
    throw err
  })
}

execFile('node', ['index.js'], (error, stdout, stderr) => {
  if (error) log(error)
  console.log(stdout)
})
