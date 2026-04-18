"""
Phase 3a: OCR-only baseline extraction for all scanned PDFs (concurrent).
Each PDF -> one xlsx in temp/extracted_scanned/, each page as a sheet.

This script does NOT call any vision model. It produces baseline OCR results
and records quality assessments in classify_results.json for Phase 3b to decide
which files need vision supplement.

Run: python scripts/extract_scanned_ocr.py [--force] [--limit N] [--workers N]
"""
import json, os, re, sys, time
from concurrent.futures import ProcessPoolExecutor, as_completed

os.chdir(r'D:\Research\202603-自动化债务报告')

TEMP = 'data/celma-major-events-attachments/temp'
CLASSIFY = os.path.join(TEMP, 'classify_results.json')
OUT_DIR = os.path.join(TEMP, 'extracted_scanned')
LOG_FILE = os.path.join(TEMP, 'extract_scanned_ocr_log.txt')
TIMEOUT_PER_PAGE = 90
DPI = 300

os.makedirs(OUT_DIR, exist_ok=True)

# ---------- helpers ----------

def clean(v):
    if v is None: return ''
    return str(v).strip().replace('\n', ' ').replace('\r', '')

def safe_sheet_name(name, existing):
    name = re.sub(r'[\[\]:*?/\\]', '_', name)[:28]
    if name in existing:
        for i in range(2, 100):
            n2 = f'{name}_{i}'
            if n2 not in existing: return n2
    return name

# ---------- OCR (runs in worker process) ----------

def ocr_page_to_table(image):
    """OCR one page image -> (rows, quality)."""
    import pytesseract
    tsv = pytesseract.image_to_data(image, lang='chi_sim+eng',
                                     output_type=pytesseract.Output.DATAFRAME)
    text = pytesseract.image_to_string(image, lang='chi_sim+eng')

    has_header = any(kw in text for kw in ['债券编码', '债券简称', '项目名称', '用途调整', '发行金额'])
    has_numbers = bool(re.search(r'\d{7,}', text))

    if not has_header and not has_numbers:
        return [[text[:500]]], 'poor'

    rows = []
    if tsv is not None and len(tsv) > 0:
        tsv = tsv.dropna(subset=['text'])
        tsv = tsv[tsv['text'].str.strip() != '']
        if len(tsv) > 0:
            for (block, par, line), group in tsv.groupby(['block_num', 'par_num', 'line_num']):
                cells = group.sort_values('left')['text'].tolist()
                row_text = [clean(c) for c in cells]
                if row_text:
                    rows.append(row_text)

    if len(rows) < 2:
        for line in text.strip().split('\n'):
            line = line.strip()
            if line:
                cells = re.split(r'\s{2,}|\t', line)
                rows.append([clean(c) for c in cells])

    if not rows:
        return [], 'poor'

    col_counts = [len(r) for r in rows]
    modal_cols = max(set(col_counts), key=col_counts.count) if col_counts else 0

    if modal_cols >= 10 and has_header:
        quality = 'good'
    elif modal_cols >= 5 or has_header:
        quality = 'partial'
    else:
        quality = 'poor'
    return rows, quality

# ---------- worker function (top-level for pickling) ----------

def process_one_entry(args):
    """Process one scanned PDF entry. Runs in a worker process.
    Returns a dict with results.
    """
    path, name, folder, out_path, out_name = args
    t0 = time.time()

    # Count pages
    try:
        import fitz
        doc = fitz.open(path); n_pages = len(doc); doc.close()
    except:
        n_pages = 1

    try:
        from pdf2image import convert_from_path
        images = convert_from_path(path, dpi=DPI)
    except Exception as e:
        elapsed = round(time.time() - t0, 1)
        return {'file': name, 'folder': folder, 'status': 'error',
                'out': '', 'pages': n_pages, 'ocr_quality': '',
                'page_qualities': [], 'total_rows': 0,
                'issue': f'pdf2image: {str(e)[:200]}', 'elapsed': elapsed,
                'needs_vision': True}

    pages_data = []
    for pi, img in enumerate(images):
        page_num = pi + 1
        try:
            rows, quality = ocr_page_to_table(img)
            pages_data.append((page_num, rows, quality))
        except Exception as e:
            pages_data.append((page_num, [[str(e)[:200]]], 'poor'))

    if not pages_data:
        elapsed = round(time.time() - t0, 1)
        return {'file': name, 'folder': folder, 'status': 'empty',
                'out': '', 'pages': n_pages, 'ocr_quality': 'poor',
                'page_qualities': [], 'total_rows': 0,
                'issue': 'no data', 'elapsed': elapsed,
                'needs_vision': True}

    qualities = [q for _, _, q in pages_data]
    total_rows = sum(len(rows) for _, rows, _ in pages_data)
    worst_q = 'poor' if 'poor' in qualities else ('partial' if 'partial' in qualities else 'good')
    needs_vision = worst_q in ('poor', 'partial')

    # Save xlsx
    try:
        from openpyxl import Workbook
        wb = Workbook(); wb.remove(wb.active)
        sheet_names = set()
        for page_num, rows, quality in pages_data:
            sn = safe_sheet_name(f'p{page_num}_ocr_{quality}', sheet_names)
            sheet_names.add(sn)
            ws = wb.create_sheet(title=sn)
            ws.append([f'# page={page_num}, method=ocr, quality={quality}'])
            for row in rows:
                ws.append(row)
        wb.save(out_path)
    except Exception as e:
        elapsed = round(time.time() - t0, 1)
        return {'file': name, 'folder': folder, 'status': 'save_error',
                'out': '', 'pages': n_pages, 'ocr_quality': '',
                'page_qualities': [], 'total_rows': 0,
                'issue': str(e)[:120], 'elapsed': elapsed,
                'needs_vision': True}

    elapsed = round(time.time() - t0, 1)
    return {'file': name, 'folder': folder, 'status': 'ok',
            'out': out_name, 'pages': n_pages,
            'ocr_quality': worst_q,
            'page_qualities': [{'page': p, 'quality': q, 'rows': len(r)}
                               for p, r, q in pages_data],
            'total_rows': total_rows,
            'issue': '', 'elapsed': elapsed,
            'needs_vision': needs_vision}

# ---------- main ----------

def main():
    from tqdm import tqdm

    force = '--force' in sys.argv
    limit = None
    workers = 3
    for i, arg in enumerate(sys.argv):
        if arg == '--limit' and i + 1 < len(sys.argv):
            try: limit = int(sys.argv[i + 1])
            except: pass
        if arg == '--workers' and i + 1 < len(sys.argv):
            try: workers = int(sys.argv[i + 1])
            except: pass

    with open(CLASSIFY, 'r', encoding='utf8') as f:
        classify = json.load(f)

    entries = classify.get('scanned', [])
    total_all = len(entries)
    if limit:
        entries = entries[:limit]

    lines = [f'=== OCR Baseline Extraction ({len(entries)}/{total_all} scanned, workers={workers}) ===']
    lines.append(f'Force: {force}, DPI: {DPI}')

    # Load existing results for incremental update
    existing_results = {}
    for r in classify.get('scanned_ocr_results', []):
        existing_results[r.get('file', '') + '|' + r.get('folder', '')] = r

    results = list(classify.get('scanned_ocr_results', []))
    ok = skip = err = 0

    # Build task list (skip already-done unless --force)
    tasks = []
    for entry in entries:
        path = entry['path']
        name = entry['name']
        folder = os.path.basename(entry['folder'])
        out_name = re.sub(r'[<>:"|?*]', '_', f'{folder}__{os.path.splitext(name)[0]}.xlsx')
        out_path = os.path.join(OUT_DIR, out_name)

        if not force and os.path.exists(out_path) and os.path.getsize(out_path) > 0:
            skip += 1
            continue

        tasks.append((path, name, folder, out_path, out_name))

    print(f'扫描件 OCR: {len(tasks)} 待处理, {skip} 已跳过 (共 {len(entries)}, {workers} 并发)')

    pbar = tqdm(total=len(tasks), desc='📄 扫描件 OCR', unit='file',
                bar_format='{l_bar}{bar}| {n_fmt}/{total_fmt} [{elapsed}<{remaining}, {rate_fmt}]')

    with ProcessPoolExecutor(max_workers=workers) as executor:
        future_to_task = {}
        for task in tasks:
            f = executor.submit(process_one_entry, task)
            future_to_task[f] = task

        for future in as_completed(future_to_task):
            task = future_to_task[future]
            _, name, folder, _, _ = task
            key = f'{name}|{folder}'

            try:
                rec = future.result(timeout=TIMEOUT_PER_PAGE * 20)
            except Exception as e:
                rec = {'file': name, 'folder': folder, 'status': 'error',
                       'out': '', 'pages': 0, 'ocr_quality': '',
                       'page_qualities': [], 'total_rows': 0,
                       'issue': str(e)[:300], 'elapsed': 0,
                       'needs_vision': True}

            if key in existing_results:
                results = [r if (r.get('file', '') + '|' + r.get('folder', '')) != key
                           else rec for r in results]
            else:
                results.append(rec)
            existing_results[key] = rec

            st = rec.get('status', '')
            if st == 'ok':
                ok += 1
                lines.append(f'  OK   {name[:50]} | {rec.get("pages")}p, {rec.get("total_rows")}rows, q={rec.get("ocr_quality")} ({rec.get("elapsed")}s)')
            else:
                err += 1
                lines.append(f'  ERR  {name[:50]} | {rec.get("issue", "")[:80]} ({rec.get("elapsed")}s)')

            pbar.update(1)
            short = name[:28] + '..' if len(name) > 28 else name
            pbar.set_postfix_str(f'ok={ok} err={err}')

    pbar.close()

    # Summary
    n_good = sum(1 for r in results if r.get('ocr_quality') == 'good')
    n_partial = sum(1 for r in results if r.get('ocr_quality') == 'partial')
    n_poor = sum(1 for r in results if r.get('ocr_quality') == 'poor')
    n_need = sum(1 for r in results if r.get('needs_vision'))

    lines.append(f'\n=== Summary ===')
    lines.append(f'OK: {ok}, Skipped: {skip}, Errors: {err}, Total: {len(entries)}')
    lines.append(f'Quality: good={n_good}, partial={n_partial}, poor={n_poor}')
    lines.append(f'Need vision: {n_need}')

    classify['scanned_ocr_results'] = results
    classify['scanned_ocr_summary'] = {
        'ok': ok, 'skipped': skip, 'errors': err,
        'total_processed': len(entries), 'total_scanned': total_all,
        'quality_good': n_good, 'quality_partial': n_partial, 'quality_poor': n_poor,
        'needs_vision': n_need
    }
    with open(CLASSIFY, 'w', encoding='utf8') as f:
        json.dump(classify, f, ensure_ascii=False, indent=2)
    lines.append('Updated classify_results.json')

    with open(LOG_FILE, 'w', encoding='utf8') as f:
        f.write('\n'.join(lines))
    print(f'\nDone. OK={ok} Skip={skip} Err={err}')
    print(f'Quality: good={n_good} partial={n_partial} poor={n_poor} | Need vision: {n_need}')

if __name__ == '__main__':
    main()
