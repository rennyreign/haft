#!/usr/bin/env node
/**
 * FTP Deployment Script for HAFT Dashboard
 * 
 * Environment Variables (from .env.deploy):
 * - FTP_HOST: 82.29.157.61
 * - FTP_PORT: 21
 * - FTP_USER: u212019412.adxengine.net
 * - FTP_PASSWORD: [stored in .env.deploy]
 * - FTP_REMOTE_PATH: /home/u212019412/domains/adxengine.net/public_html/haft
 * 
 * Usage: node scripts/deploy.js
 */

const FTP = require('basic-ftp');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.deploy' });

async function deploy() {
  const client = new FTP.Client();
  
  try {
    // Validate environment variables
    const required = ['FTP_HOST', 'FTP_PORT', 'FTP_USER', 'FTP_PASSWORD', 'FTP_REMOTE_PATH'];
    for (const env of required) {
      if (!process.env[env]) {
        throw new Error(`Missing required env var: ${env} (check .env.deploy)`);
      }
    }

    console.log(`🚀 Deploying to ${process.env.FTP_HOST}:${process.env.FTP_PORT}`);
    console.log(`📁 Remote path: ${process.env.FTP_REMOTE_PATH}`);

    await client.access({
      host: process.env.FTP_HOST,
      port: parseInt(process.env.FTP_PORT),
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secureOptions: { rejectUnauthorized: false },
    });

    console.log('✅ Connected to FTP server');

    // Upload .next directory
    const nextDir = path.join(__dirname, '../.next');
    const publicDir = path.join(__dirname, '../public');

    if (!fs.existsSync(nextDir)) {
      throw new Error('.next directory not found. Run `npm run build` first.');
    }

    // Change to remote directory
    try {
      await client.cd(process.env.FTP_REMOTE_PATH);
    } catch (e) {
      console.log(`⚠️  Remote directory doesn't exist, creating...`);
      await client.ensureDir(process.env.FTP_REMOTE_PATH);
    }

    // Upload .next
    console.log('📤 Uploading .next...');
    await client.uploadDir(nextDir, '.next');
    console.log('✅ .next uploaded');

    // Upload public if it exists
    if (fs.existsSync(publicDir)) {
      console.log('📤 Uploading public...');
      await client.uploadDir(publicDir, 'public');
      console.log('✅ public uploaded');
    }

    // Upload key files
    const filesToUpload = ['package.json', 'next.config.ts', '.env.local'];
    for (const file of filesToUpload) {
      const filePath = path.join(__dirname, '../', file);
      if (fs.existsSync(filePath)) {
        console.log(`📤 Uploading ${file}...`);
        await client.uploadFile(filePath, file);
      }
    }

    console.log('✅ All files uploaded');
    await client.close();
    console.log('✨ Deployment complete!');
  } catch (err) {
    console.error('❌ Deployment failed:', err.message);
    process.exit(1);
  }
}

deploy();
