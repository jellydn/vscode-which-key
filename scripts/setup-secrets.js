#!/usr/bin/env node
/**
 * Setup GitHub Secrets for VSCode Extension Publishing
 *
 * Usage:
 *   node scripts/setup-secrets.js
 *   or
 *   npm run setup-secrets
 */

const { execSync } = require('child_process');
const readline = require('readline');

const REPO = 'jellydn/vscode-whichkey';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question, hidden = false) {
    return new Promise((resolve) => {
        if (hidden) {
            // Hide input for secrets
            const stdin = process.stdin;
            const stdout = process.stdout;

            stdout.write(question);
            stdin.setRawMode(true);
            stdin.resume();
            stdin.setEncoding('utf8');

            let input = '';
            stdin.on('data', (key) => {
                if (key === '\r' || key === '\n') {
                    stdin.setRawMode(false);
                    stdin.pause();
                    stdout.write('\n');
                    resolve(input);
                } else if (key === '\u0003') {
                    process.exit();
                } else if (key === '\u007f') {
                    if (input.length > 0) {
                        input = input.slice(0, -1);
                        stdout.write('\b \b');
                    }
                } else {
                    input += key;
                    stdout.write('*');
                }
            });
        } else {
            rl.question(question, resolve);
        }
    });
}

function run(command) {
    try {
        return execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    } catch {
        return '';
    }
}

function checkGhInstalled() {
    try {
        execSync('gh --version', { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

function checkGhAuth() {
    try {
        execSync('gh auth status', { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

function isSecretSet(name) {
    const list = run(`gh secret list --repo ${REPO}`);
    return list.includes(name);
}

async function setSecret(name, url, docs) {
    console.log(`\n📋 Setting up: ${name}`);
    console.log(`   Purpose: ${docs}`);
    console.log(`   Get token from: ${url}\n`);

    if (isSecretSet(name)) {
        const override = await ask(`   ℹ️  ${name} is already set. Override? (y/N): `);
        if (!override.match(/^[Yy]$/)) {
            console.log('   Skipped.\n');
            return;
        }
    }

    const token = await ask(`   Paste your ${name} token: `, true);
    console.log('');

    if (!token.trim()) {
        console.log('   ❌ Empty token provided. Skipped.\n');
        return;
    }

    try {
        // Use printf to avoid echo interpretation issues
        execSync(`printf '%s' '${token.replace(/'/g, "'\"'\"'")}' | gh secret set ${name} --repo ${REPO}`, {
            stdio: 'inherit'
        });
        console.log(`   ✅ ${name} set successfully!\n`);
    } catch (e) {
        console.log(`   ❌ Failed to set ${name}. Error: ${e.message}\n`);
    }
}

async function main() {
    console.log('🔐 Setup GitHub Secrets for VSCode Extension Publishing');
    console.log('========================================================\n');

    if (!checkGhInstalled()) {
        console.log('❌ GitHub CLI (gh) is not installed.');
        console.log('   Install it from: https://cli.github.com/');
        process.exit(1);
    }

    if (!checkGhAuth()) {
        console.log('❌ Not logged into GitHub CLI.');
        console.log('   Run: gh auth login');
        process.exit(1);
    }

    console.log('✅ GitHub CLI is installed and authenticated\n');
    console.log('This script will help you set up the required secrets for publishing');
    console.log('to the VSCode Marketplace and Open VSX Registry.\n');
    console.log(`Repository: ${REPO}\n`);

    // VSCE_PAT
    await setSecret(
        'VSCE_PAT',
        'https://dev.azure.com/microsoft/',
        'Personal Access Token for VSCode Marketplace (Azure DevOps)'
    );

    console.log('   📖 To create VSCE_PAT:');
    console.log('      1. Go to https://dev.azure.com/microsoft/');
    console.log('      2. Sign in with your Microsoft account');
    console.log('      3. Go to User Settings → Personal Access Tokens');
    console.log('      4. Create a new token with "Marketplace" scope (Publish)');
    console.log('      5. Organization: All accessible organizations');
    console.log('      6. Copy the token and paste it above\n');

    // OVSX_PAT
    await setSecret(
        'OVSX_PAT',
        'https://open-vsx.org/',
        'Personal Access Token for Open VSX Registry'
    );

    console.log('   📖 To create OVSX_PAT:');
    console.log('      1. Go to https://open-vsx.org/');
    console.log('      2. Sign in with your GitHub account');
    console.log('      3. Go to your Profile → Settings');
    console.log('      4. Click "Add New Token" under "Personal Access Tokens"');
    console.log('      5. Give it a name like "vscode-whichkey"');
    console.log('      6. Copy the token and paste it above\n');

    // Verify
    console.log('========================================================');
    console.log('🔍 Verifying secrets in repository:\n');
    try {
        execSync(`gh secret list --repo ${REPO}`, { stdio: 'inherit' });
    } catch {
        // Ignore errors
    }

    console.log('\n✅ Setup complete!\n');
    console.log('To release a new version:');
    console.log('   git tag v0.12.1');
    console.log('   git push origin v0.12.1\n');

    rl.close();
}

main().catch(console.error);
