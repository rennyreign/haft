#!/usr/bin/env node
/**
 * Fast FTP Deployment - uploads only changed files
 * Env vars from .env.deploy:
 * - FTP_HOST=82.29.157.61
 * - FTP_USER=u212019412.adxengine.net
 * - FTP_PASSWORD=***
 * - FTP_REMOTE_PATH=/home/u212019412/domains/adxengine.net/public_html/haft
 */

const FTP = require('basic-ftp');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.deploy' });

async function uploadDir(client, localDir, remoteDir, exclude = []) {
  const files = fs.readdirSync(localDir);
  
  for (const file of files) {
    if (exclude.includes(file)) continue;
    
    const localPath = path.join(localDir, file);
    const remotePath = `${remoteDir}/${file}`;
    const stat = fs.statSync(localPath);
    
    if (stat.isDirectory()) {
      try {
        await client.ensureDir(remotePath);
      } catch (e) {}
      await uploadDir(client, localPath, remotePath, exclude);
    } else {
      console.log(`  📤 ${remotePath}`);
      await client.uploadFile(localPath, remotePath);
    }
  }
}

async function deploy() {
  const client = new FTP.Client();
  client.timeout = 0; // No timeout
  
  try {
    const required = ['FTP_HOST', 'FTP_USER', 'FTP_PASSWORD', 'FTP_REMOTE_PATH'];
    for (const env of required) {
      if (!process.env[env]) throw new Error(`Missing: ${env}`);
    }

    console.log(`🚀 Fast deploy to ${process.env.FTP_HOST}`);
    
    await client.access({
      host: process.env.FTP_HOST,
      port: parseInt(process.env.FTP_PORT || 21),
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
    });

    console.log('✅ Connected');
    
    // Ensure remote dir exists
    try {
      await client.cd(process.env.FTP_REMOTE_PATH);
    } catch (e) {
      await client.ensureDir(process.env.FTP_REMOTE_PATH);
      await client.cd(process.env.FTP_REMOTE_PATH);
    }

    // Upload .next/static (critical for app to work)
    const staticDir = path.join(__dirname, '../.next/static');
    if (fs.existsSync(staticDir)) {
      console.log('📤 Uploading .next/static (app files)...');
      await uploadDir(client, staticDir, '.next/static');
      console.log('✅ .next/static done');
    }

    // Upload .next/server
    const serverDir = path.join(__dirname, '../.next/server');
    if (fs.existsSync(serverDir)) {
      console.log('📤 Uploading .next/server...');
      await uploadDir(client, serverDir, '.next/server');
      console.log('✅ .next/server done');
    }

    // Upload key files
    const files = ['package.json', 'next.config.ts', '.env.local', 'public'];
    for (const file of files) {
      const src = path.join(__dirname, '../', file);
      if (!fs.existsSync(src)) continue;
      
      const stat = fs.statSync(src);
      console.log(`📤 Uploading ${file}...`);
      
      if (stat.isDirectory()) {
        await uploadDir(client, src, file);
      } else {
        await client.uploadFile(src, file);
      }
    }

    await client.close();
    console.log('✨ Deploy complete! Visit https://haft.adxengine.net');
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
}

deploy();
