// Script to call TestSprite MCP server tools in sequence
import { spawn } from 'child_process';
import { createInterface } from 'readline';

const API_KEY = process.env.API_KEY;
const PROJECT_PATH = process.cwd().replace(/\\/g, '/');

// Start MCP server as child process
const server = spawn('node', [
    'C:/Users/Christian/AppData/Local/npm-cache/_npx/d9346830dbd0a8a4/node_modules/@testsprite/testsprite-mcp/dist/index.js',
    'server'
], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, API_KEY }
});

let responseBuffer = '';
let messageId = 1;

function sendRequest(method, params = {}) {
    const id = messageId++;
    const msg = JSON.stringify({ jsonrpc: '2.0', id, method, params });
    console.log(`\n>>> Sending: ${method}`);
    server.stdin.write(msg + '\n');
    return id;
}

server.stdout.on('data', (data) => {
    responseBuffer += data.toString();
    // Try to parse complete JSON messages
    const lines = responseBuffer.split('\n');
    responseBuffer = lines.pop(); // Keep incomplete line
    for (const line of lines) {
        if (line.trim()) {
            try {
                const parsed = JSON.parse(line.trim());
                console.log(`\n<<< Response:`, JSON.stringify(parsed, null, 2).substring(0, 2000));

                // Progress through the workflow
                if (parsed.result?.tools) {
                    console.log('\n=== Available tools:', parsed.result.tools.map(t => t.name).join(', '));
                    // Step 1: Bootstrap
                    sendRequest('tools/call', {
                        name: 'testsprite_bootstrap',
                        arguments: {
                            localPort: 5173,
                            type: 'frontend',
                            projectPath: PROJECT_PATH,
                            testScope: 'full'
                        }
                    });
                }
            } catch (e) {
                // Not complete JSON yet
            }
        }
    }
});

server.stderr.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg) console.log(`[stderr] ${msg}`);
});

// Initialize MCP
sendRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test-runner', version: '1.0.0' }
});

// After init response, list tools
setTimeout(() => sendRequest('tools/list'), 3000);

// Keep alive
setTimeout(() => {
    console.log('\nTimeout - shutting down');
    server.kill();
    process.exit(0);
}, 120000);

server.on('close', (code) => {
    console.log(`\nMCP server exited with code ${code}`);
});
