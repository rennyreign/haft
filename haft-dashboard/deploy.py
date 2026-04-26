#!/usr/bin/env python3
"""
Deploy HAFT dashboard to Hostinger via FTP.
Uploads all files from ./.next to /haft/ subdirectory.
"""

import ftplib
import os
from pathlib import Path

# FTP Configuration
FTP_HOST = "82.29.157.61"
FTP_USER = "u212019412.adxengine.net"
FTP_PASS = "Btbmedia5!"
FTP_REMOTE_DIR = "haft"  # Subdirectory on server

# Local build output (static export)
LOCAL_DIR = Path("./out")

def upload_to_hostinger():
    """Upload build files to Hostinger via FTP."""
    
    if not LOCAL_DIR.exists():
        print(f"❌ Error: {LOCAL_DIR} does not exist. Run 'npm run build' first.")
        return False
    
    try:
        print(f"🔗 Connecting to {FTP_HOST}...")
        ftp = ftplib.FTP(FTP_HOST, FTP_USER, FTP_PASS)
        print(f"✓ Logged in as {FTP_USER}")
        
        # Change to remote directory, create if it doesn't exist
        try:
            ftp.cwd(FTP_REMOTE_DIR)
            print(f"✓ Changed to remote directory: /{FTP_REMOTE_DIR}/")
        except ftplib.error_perm:
            # Directory doesn't exist, create it
            print(f"Directory {FTP_REMOTE_DIR} doesn't exist, creating...")
            try:
                ftp.mkd(FTP_REMOTE_DIR)
                ftp.cwd(FTP_REMOTE_DIR)
                print(f"✓ Created and changed to remote directory: /{FTP_REMOTE_DIR}/")
            except ftplib.all_errors as e:
                print(f"❌ Error creating/changing to {FTP_REMOTE_DIR}: {e}")
                ftp.quit()
                return False
        except ftplib.all_errors as e:
            print(f"❌ Error changing to {FTP_REMOTE_DIR}: {e}")
            ftp.quit()
            return False
        
        # Collect files to upload (only if changed or new)
        files_to_upload = []
        skipped_files = []
        
        for fpath in sorted(LOCAL_DIR.rglob("*")):
            if fpath.is_file():
                rel_path = fpath.relative_to(LOCAL_DIR)
                remote_path = str(rel_path).replace(os.sep, "/")
                local_size = fpath.stat().st_size
                
                try:
                    # Check if remote file exists and has same size
                    remote_size = ftp.size(remote_path)
                    if remote_size == local_size:
                        skipped_files.append(remote_path)
                        continue
                except ftplib.error_perm:
                    # File doesn't exist, upload it
                    pass
                
                files_to_upload.append((fpath, rel_path))
        
        print(f"\n📦 Found {len(files_to_upload)} files to upload")
        print("─" * 60)
        
        # Upload each file
        uploaded = 0
        for local_path, rel_path in files_to_upload:
            remote_path = str(rel_path).replace(os.sep, "/")
            
            # Create remote directories if needed
            remote_dir = remote_path.rsplit("/", 1)[0] if "/" in remote_path else ""
            if remote_dir:
                # Create each directory level (Fix for nested directories)
                current_path = ""
                for dir_part in remote_dir.split("/"):
                    current_path = f"{current_path}/{dir_part}" if current_path else dir_part
                    try:
                        ftp.mkd(current_path)
                    except ftplib.all_errors:
                        pass  # Directory likely already exists
            
            # Upload file
            try:
                with open(local_path, "rb") as f:
                    ftp.storbinary(f"STOR {remote_path}", f)
                print(f"✓ {remote_path}")
                uploaded += 1
            except ftplib.all_errors as e:
                print(f"❌ {remote_path} — {e}")
        
        print("─" * 60)
        print(f"\n✨ Deployed: {uploaded}/{len(files_to_upload)} files")
        if skipped_files:
            print(f"⏭ Skipped: {len(skipped_files)} unchanged files")
        
        ftp.quit()
        print(f"\n🚀 Live at: https://haft.adxengine.net\n")
        return True
        
    except ftplib.all_errors as e:
        print(f"❌ FTP Error: {e}")
        return False

if __name__ == "__main__":
    success = upload_to_hostinger()
    exit(0 if success else 1)
