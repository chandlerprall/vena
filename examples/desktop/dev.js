import { spawn } from 'child_process';

spawn('node', ['../../livereload.js'], { stdio: 'inherit' });
