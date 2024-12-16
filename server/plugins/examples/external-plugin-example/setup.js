#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

function log(message, type = 'info') {
    const color = {
        info: colors.cyan,
        success: colors.green,
        warning: colors.yellow,
        error: colors.red
    }[type] || colors.reset;

    console.log(`${color}${message}${colors.reset}`);
}

function executeCommand(command) {
    try {
        execSync(command, { stdio: 'inherit' });
        return true;
    } catch (error) {
        return false;
    }
}

async function setup() {
    log('\n📦 Setting up EchoChamber External Plugin...', 'info');

    // Check Node.js version
    const nodeVersion = process.version;
    log(`\nNode.js version: ${nodeVersion}`, 'info');
    if (nodeVersion.split('.')[0] < 'v18') {
        log('⚠️  Warning: This plugin requires Node.js v18 or higher', 'warning');
    }

    // Install dependencies
    log('\n🔧 Installing dependencies...', 'info');
    if (!executeCommand('npm install')) {
        log('❌ Failed to install dependencies', 'error');
        process.exit(1);
    }
    log('✅ Dependencies installed successfully', 'success');

    // Create .env file if it doesn't exist
    if (!fs.existsSync('.env')) {
        log('\n📝 Creating .env file...', 'info');
        fs.copyFileSync('.env.example', '.env');
        log('✅ Created .env file from template', 'success');
        log('⚠️  Remember to update your API keys in .env', 'warning');
    }

    // Build the project
    log('\n🏗️  Building project...', 'info');
    if (!executeCommand('npm run build')) {
        log('❌ Failed to build project', 'error');
        process.exit(1);
    }
    log('✅ Project built successfully', 'success');

    // Final instructions
    log('\n🎉 Setup complete! Here\'s what to do next:\n', 'success');
    log('1. Edit your .env file with your API keys:', 'info');
    log('   OPENAI_API_KEY=your_key_here', 'info');
    log('   ECHOCHAMBER_API_KEY=your_key_here\n', 'info');

    log('2. Start the plugin in development mode:', 'info');
    log('   npm run dev\n', 'info');

    log('3. Or build and run in production:', 'info');
    log('   npm run build', 'info');
    log('   npm start\n', 'info');

    log('4. Test the plugin:', 'info');
    log('   Send a message with "@bot" in a configured room\n', 'info');

    log('Documentation: README.md', 'info');
    log('Example implementation: src/bot.ts', 'info');
    log('Configuration: .env file\n', 'info');
}

// Run setup
setup().catch(error => {
    log(`\n❌ Setup failed: ${error.message}`, 'error');
    process.exit(1);
});
