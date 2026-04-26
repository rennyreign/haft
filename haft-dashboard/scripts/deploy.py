#!/usr/bin/env python3
"""
FTP Deployment Script
Env vars from .env.deploy:
- FTP_HOST=82.29.157.61
- FTP_USER=u212019412.adxengine.net
- FTP_PASSWORD=***
- FTP_REMOTE_PATH=/home/u212019412/domains/adxengine.net/public_html/haft
"""

import os
import sys
from pathlib import Path
from ftplib import FTP, all_errors
from dotenv import load_dotenv

# Load .env.deploy
load_dotenv('.env.deploy')

FTP_HOST = os.getenv('FTP_HOST')
FTP_PORT = int(os.getenv('FTP_PORT', 21))
FTP_USER = os.getenv('FTP_USER')
FTP_PASSWORD = os.getenv('FTP_PASSWORD')
FTP_REMOTE_PATH = os.getenv('FTP_REMOTE_PATH')

def upload_dir(ftp, local_dir, remote_dir):
    """Recursively upload directory"""
    for item in Path(local_dir).rglob('*'):
        if item.is_file():
            rel_path = item.relative_to(local_dir)
            remote_file = f"{remote_dir}/{rel_path}".replace('\\', '/')
            
            # Create remote dirs
            remote_parent = '/'.join(remote_file.split('/')[:-1])
            try:
                ftp.cwd(remote_parent)
                ftp.cwd(FTP_REMOTE_PATH)
            except:
                pass
            
            print(f"  📤 {remote_file}")
            with open(item, 'rb') as f:
                ftp.storbinary(f'STOR {remote_file.split("/")[-1]}', f)

def deploy():
    print(f"🚀 Deploying to {FTP_HOST}:{FTP_PORT}")
    print(f"📁 Remote: {FTP_REMOTE_PATH}")
    
    try:
        ftp = FTP()
        ftp.connect(FTP_HOST, FTP_PORT, timeout=30)
        ftp.login(FTP_USER, FTP_PASSWORD.strip("'"))
        print("✅ Connected")
        
        # Ensure remote dir exists
        try:
            ftp.cwd(FTP_REMOTE_PATH)
        except:
            # Create path if needed
            ftp.cwd('/')
            for part in FTP_REMOTE_PATH.strip('/').split('/'):
                try:
                    ftp.cwd(part)
                except:
                    ftp.mkd(part)
                    ftp.cwd(part)
        
        # Upload .next
        print("📤 Uploading .next...")
        next_dir = Path('.next')
        if next_dir.exists():
            for file in next_dir.rglob('*'):
                if file.is_file():
                    rel_path = file.relative_to('.')
                    try:
                        ftp.storbinary(f'STOR {rel_path}', open(file, 'rb'))
                    except Exception as e:
                        print(f"  ⚠️  {rel_path}: {e}")
        
        # Upload public
        print("📤 Uploading public...")
        public_dir = Path('public')
        if public_dir.exists():
            for file in public_dir.rglob('*'):
                if file.is_file():
                    rel_path = file.relative_to('.')
                    try:
                        ftp.storbinary(f'STOR {rel_path}', open(file, 'rb'))
                    except:
                        pass
        
        # Upload key files
        for f in ['package.json', 'next.config.ts', '.env.local']:
            if Path(f).exists():
                print(f"📤 {f}")
                try:
                    with open(f, 'rb') as file:
                        ftp.storbinary(f'STOR {f}', file)
                except:
                    pass
        
        ftp.quit()
        print("✨ Deploy complete! Visit https://haft.adxengine.net")
        
    except all_errors as e:
        print(f"❌ FTP Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    deploy()
