"""Classify all 用途调整表 files into text-PDF, scanned-PDF, Excel, zip.
Writes results to data/celma-major-events-attachments/temp/classify_results.json
"""
import json, re, os, sys, warnings, ctypes
warnings.filterwarnings('ignore')

# Suppress pdfminer C-level CropBox warnings by redirecting C stderr
import logging
logging.getLogger('pdfplumber').setLevel(logging.CRITICAL)
logging.getLogger('pdfminer').setLevel(logging.CRITICAL)

# Redirect C-level stderr to devnull while importing/running pdfplumber
_old_stderr_fd = os.dup(2)
_devnull = os.open(os.devnull, os.O_WRONLY)
os.dup2(_devnull, 2)

import pdfplumber

j = json.load(open('data/celma-policy-dynamics.json', encoding='utf8'))
items = [it for it in j['items'] if it.get('topic') == '资金用途调整' and it.get('attachments')]
TABLE_RE = re.compile(r'用途调整表|调整明细表|调整情况表|用途情况表|资金用途表|用途表|调整公示表|调整表|项目调整情况|用途调整')
EXCLUDE_RE = re.compile(r'评级|评估|信用等级|法律意见|经济财政|一案两书|实施方案|融资平衡|财评报告|跟踪评级|披露材料')

scanned = []; textual = []; excel_files = []; other = []
for it in items:
    for a in it['attachments']:
        if a['download_status'] != 'success': continue
        if not TABLE_RE.search(a['display_name']) or EXCLUDE_RE.search(a['display_name']): continue
        ext = a['display_name'].rsplit('.', 1)[-1].lower()
        path = a.get('local_file_path', '')
        if ext in ('xls', 'xlsx'):
            excel_files.append({'path': path, 'folder': it['local_attachment_folder'], 'name': a['display_name']})
        elif ext == 'pdf' and path and os.path.exists(path):
            try:
                with pdfplumber.open(path) as pdf:
                    p = pdf.pages[0]
                    text = p.extract_text() or ''
                    tables = p.extract_tables()
                    if tables and len(tables) > 0:
                        textual.append({'path': path, 'folder': it['local_attachment_folder'], 'name': a['display_name']})
                    elif len(text.strip()) > 50:
                        textual.append({'path': path, 'folder': it['local_attachment_folder'], 'name': a['display_name']})
                    else:
                        scanned.append({'path': path, 'folder': it['local_attachment_folder'], 'name': a['display_name']})
            except:
                scanned.append({'path': path, 'folder': it['local_attachment_folder'], 'name': a['display_name']})
        elif ext in ('zip', 'rar'):
            other.append({'path': path, 'folder': it['local_attachment_folder'], 'name': a['display_name']})

# Restore stderr
os.dup2(_old_stderr_fd, 2)
os.close(_devnull)
os.close(_old_stderr_fd)

result = {
    'textual': textual,
    'scanned': scanned,
    'excel': excel_files,
    'other': other,
    'counts': {
        'textual': len(textual),
        'scanned': len(scanned),
        'excel': len(excel_files),
        'other': len(other),
        'total': len(textual) + len(scanned) + len(excel_files) + len(other)
    }
}
out_path = 'data/celma-major-events-attachments/temp/classify_results.json'
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, 'w', encoding='utf8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(json.dumps(result['counts'], indent=2))
print()
for s in scanned:
    print(f"  SCAN: {os.path.basename(s['folder'])} / {s['name']}")
for o in other:
    print(f"  ZIP:  {os.path.basename(o['folder'])} / {o['name']}")
