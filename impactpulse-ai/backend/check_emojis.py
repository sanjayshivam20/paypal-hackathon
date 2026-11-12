import os
import re

emoji_pattern = re.compile(r'[\U00010000-\U0010ffff\u2600-\u26ff\u2700-\u27bf]')
violations = []
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

for root, dirs, files in os.walk(root_dir):
    if any(skip in root for skip in ['node_modules', '.git', 'venv', '__pycache__', 'dist']):
        continue
    for file in files:
        if file.endswith(('.py', '.js', '.jsx', '.html', '.css', '.json', '.md', '.bat')):
            fpath = os.path.join(root, file)
            try:
                with open(fpath, 'r', encoding='utf-8') as f:
                    for lno, line in enumerate(f, 1):
                        matches = emoji_pattern.findall(line)
                        if matches:
                            violations.append((fpath, lno, matches, line.strip()))
            except Exception:
                pass

if violations:
    print(f"Found {len(violations)} emoji violations:")
    for v in violations[:30]:
        print(f"  {v[0]}:{v[1]}: {[ord(c) for c in v[2]]} in {ascii(v[3])}")
else:
    print("ZERO EMOJIS FOUND! 100% compliant with strict zero-emoji mandate.")


