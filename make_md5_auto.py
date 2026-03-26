import hashlib
import os

def create_md5_file(bin_file_path):
    if not os.path.exists(bin_file_path):
        print(f"Fehler: Die Datei '{bin_file_path}' wurde nicht gefunden!")
        return
        
    with open(bin_file_path, "rb") as f:
        file_hash = hashlib.md5()
        while chunk := f.read(4096):
            file_hash.update(chunk)
            
    md5_hex = file_hash.hexdigest().upper()
    
    md5_file_path = "cyd_solar_display.md5"
    with open(md5_file_path, "w") as f:
        f.write(md5_hex)
        
    print(f"Erfolg! MD5-Datei wurde erstellt:")
    print(f"-> Code: {md5_hex}")
    print(f"-> In Datei: {md5_file_path}")

if __name__ == "__main__":
    create_md5_file("cyd_solar_display.bin")
