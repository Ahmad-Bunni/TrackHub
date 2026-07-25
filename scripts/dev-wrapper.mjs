#!/usr/bin/env node

/**
 * Dev wrapper that properly handles Ctrl+C on Windows
 * Uses tree-kill to terminate process trees
 */

import { spawn } from 'child_process';
import treeKill from 'tree-kill';

const vite = spawn('vite', ['--host', '0.0.0.0'], { stdio: 'inherit' });
const waitOn = spawn('npx', ['wait-on', 'tcp:5173'], { stdio: 'inherit' });

let electron;
waitOn.on('exit', (code) => {
  if (code === 0) {
    electron = spawn('electron', ['.'], { stdio: 'inherit' });
  }
});

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  if (electron) treeKill(electron.pid, 'SIGTERM');
  treeKill(vite.pid, 'SIGTERM');
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (electron) treeKill(electron.pid, 'SIGTERM');
  treeKill(vite.pid, 'SIGTERM');
  process.exit(0);
});
