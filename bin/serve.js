#!/usr/bin/env node

import bin from 'commander'
import chalk from 'chalk'
import { log, isSite, exists } from '../lib/utils'
import { exec, spawn } from 'child_process'

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

let server = spawn('node', ['index.js'], {
  stdio: 'inherit'
})

process.on('SIGINT', () => {
  server.kill('SIGINT')
  process.exit(0)
})

process.stdin.resume()
process.stdin.setEncoding('utf8')

process.stdin.on('data', data => {
  data = (data + '').trim().toLowerCase()

  if (data === 'rs') {
    server.kill('SIGINT')

    server = spawn('node', ['index.js'], {
      stdio: 'inherit'
    })
  }
})
