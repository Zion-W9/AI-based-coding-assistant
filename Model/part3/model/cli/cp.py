from pathlib import Path
import shutil

src_root = Path('out')
trg_root = Path('results')
files = src_root.rglob("*.hyp")
for file in files:
    file_name = file.name
    file_path = file.relative_to(src_root).parent
    (trg_root/file_path).mkdir(parents=True, exist_ok=True)
    shutil.copy2(src_root/file_path/file_name, trg_root/file_path/file_name)

files = src_root.rglob("keys.npy")
files = src_root.rglob("checkpoint_last.pt")
for file in files:
    file.unlink()
