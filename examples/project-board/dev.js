import { spawn } from 'child_process';

spawn('node', ['../../livereload.js'], { stdio: 'inherit' });
spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'tsc-dev'], { stdio: 'inherit' });
