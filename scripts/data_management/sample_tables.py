"""Sample PDF table files to understand column structure."""
import pdfplumber, json, re, os

j = json.load(open('data/celma-policy-dynamics.json', encoding='utf8'))
items = [it for it in j['items'] if it.get('topic') == '资金用途调整' and it.get('attachments')]

TABLE_RE = re.compile(r'用途调整表|调整明细表|调整情况表|用途情况表|资金用途表|用途表|调整公示表|调整表|项目调整情况|用途调整')
EXCLUDE_RE = re.compile(r'评级|评估|信用等级|法律意见|经济财政|一案两书|实施方案|融资平衡|财评报告|跟踪评级|披露材料')

count = 0
for it in items:
    for a in it['attachments']:
        if a['download_status'] != 'success' or not TABLE_RE.search(a['display_name']) or EXCLUDE_RE.search(a['display_name']):
            continue
        ext = a['display_name'].rsplit('.', 1)[-1].lower()
        if ext != 'pdf':
            continue
        path = a.get('local_file_path', '')
        if not path or not os.path.exists(path):
            continue
        try:
            with pdfplumber.open(path) as pdf:
                page = pdf.pages[0]
                tables = page.extract_tables()
                text = page.extract_text() or ''
                if tables and len(tables) > 0:
                    t = tables[0]
                    print(f'\n=== {a["display_name"]} ({len(pdf.pages)} pages, {len(tables)} tables on p1) ===')
                    for row in t[:5]:
                        short = [str(c)[:40] if c else '' for c in row]
                        print(short)
                    print(f'... total rows on p1: {len(t)}, cols: {len(t[0]) if t else 0}')
                    count += 1
                else:
                    # Check if text-based (no table extracted but has text)
                    has_text = len(text.strip()) > 100
                    if not has_text:
                        print(f'\n*** SCANNED: {a["display_name"]} (no tables, no text) ***')
                        count += 1
        except Exception as e:
            print(f'ERROR: {a["display_name"]}: {e}')
        if count >= 8:
            break
    if count >= 8:
        break
