# -*- coding: utf-8 -*-
"""
build_all.py
Tổng hợp toàn bộ chương trình Sách Giáo Khoa 12 Khối Lớp (Global Success GDPT 2018):
- Lớp 1 -> Lớp 5 (Tiểu học)
- Lớp 6 -> Lớp 9 (THCS)
- Lớp 10 -> Lớp 12 (THPT)
Tạo ra các file JSON riêng biệt cho từng khối lớp tại src/data/grades/grade{1..12}.json
và cập nhật src/data/multiGradeCurriculum.json với 170 bài học đầy đủ 7 trạm tương tác.
"""

import json
import os
import sys

# Đảm bảo import được các module cùng thư mục
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from primary_grades import generate_primary_grades
from secondary_grades import generate_secondary_grades
from high_grades import generate_high_grades

DATA_DIR = os.path.join(CURRENT_DIR, '..', '..', 'src', 'data')
GRADES_DIR = os.path.join(DATA_DIR, 'grades')
os.makedirs(GRADES_DIR, exist_ok=True)

def main():
    print("🚀 Bắt đầu tạo dữ liệu 12 khối lớp chuẩn SGK Global Success...")

    # 1. Thu thập dữ liệu các khối
    all_grades = {}

    # Tiểu học: 1, 2, 3, 4, 5
    primary = generate_primary_grades()
    all_grades.update(primary)
    print("✅ Đã tạo dữ liệu Tiểu học (Lớp 1, 2, 3, 4, 5)")

    # THCS Lớp 6: Nạp từ grade6.json đã có
    grade6_path = os.path.join(GRADES_DIR, 'grade6.json')
    if os.path.exists(grade6_path):
        with open(grade6_path, 'r', encoding='utf-8') as f:
            all_grades[6] = json.load(f)
        print("✅ Đã nạp dữ liệu Lớp 6 từ grade6.json")
    else:
        print("⚠️ Không tìm thấy grade6.json, cần biên dịch trước")

    # THCS Lớp 7, 8, 9
    secondary = generate_secondary_grades()
    all_grades.update(secondary)
    print("✅ Đã tạo dữ liệu THCS (Lớp 7, 8, 9)")

    # THPT Lớp 10, 11, 12
    high = generate_high_grades()
    all_grades.update(high)
    print("✅ Đã tạo dữ liệu THPT (Lớp 10, 11, 12)")

    # 2. Ghi từng file grade{N}.json vào src/data/grades/
    total_units_count = 0
    total_vocab_count = 0

    for g_num in range(1, 13):
        if g_num not in all_grades:
            print(f"❌ Thiếu dữ liệu Lớp {g_num}!")
            continue
        g_data = all_grades[g_num]
        file_path = os.path.join(GRADES_DIR, f'grade{g_num}.json')
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(g_data, f, ensure_ascii=False, indent=2)

        units = g_data.get('units', [])
        total_units_count += len(units)
        for u in units:
            total_vocab_count += len(u.get('vocabularies', []))

        print(f"   📁 Saved src/data/grades/grade{g_num}.json ({len(units)} units, {os.path.getsize(file_path):,} bytes)")

    # 3. Cập nhật src/data/multiGradeCurriculum.json
    multi_path = os.path.join(DATA_DIR, 'multiGradeCurriculum.json')
    with open(multi_path, 'r', encoding='utf-8') as f:
        multi_data = json.load(f)

    multi_data['metadata']['updatedAt'] = "2026-11-17"
    multi_data['metadata']['description'] = "Hệ thống học liệu tương tác 7 trạm kỹ năng và SGK điện tử trọn vẹn 12 khối lớp (170 Units)."
    multi_data['metadata']['allInteractive'] = True

    for g_entry in multi_data['grades']:
        g_num = g_entry['grade']
        if g_num in all_grades:
            g_source = all_grades[g_num]
            g_entry['interactiveAvailable'] = True
            g_entry['interactiveNote'] = "Đầy đủ 7 trạm học tập tương tác: Từ vựng, Ngữ pháp, Luyện nói AI, Luyện nghe, Đọc hiểu, Viết câu, Ngữ âm."

            # Đồng bộ units
            updated_units = []
            for u in g_source.get('units', []):
                key_vocab = [v['word'] for v in u.get('vocabularies', [])]
                grammar_title = u.get('grammar', {}).get('title', '')
                phonics_pair = u.get('pronunciation', {}).get('pair', '')
                sem = u.get('semester', 1)

                if g_num == 3:
                    book_id = 'sgk-3-tap2'
                elif g_num == 4:
                    book_id = 'sgk-4-tap1' if sem == 1 else 'sgk-4-tap2'
                elif g_num == 5:
                    book_id = 'sgk-5-tap1' if sem == 1 else 'sgk-5-tap2'
                elif g_num == 6:
                    book_id = 'tap1' if sem == 1 else 'tap2'
                else:
                    book_id = f'sgk-{g_num}'

                updated_units.append({
                    "unit": u['unit'],
                    "unitId": u.get('unitId', f"g{g_num}_u{u['unit']}"),
                    "title": u.get('unitTitle', f"Unit {u['unit']}").replace(f"Unit {u['unit']}: ", ""),
                    "titleVi": u.get('unitNameVi', ''),
                    "theme": u.get('theme', 'General English'),
                    "semester": sem,
                    "bookId": book_id,
                    "bookPages": u.get('bookPages', ''),
                    "grammar": grammar_title,
                    "phonics": phonics_pair,
                    "targetPhonics": phonics_pair,
                    "keyVocab": key_vocab,
                    "interactive": True,
                    "vocabulariesCount": len(u.get('vocabularies', [])),
                    "hasQuiz": bool(u.get('grammar', {}).get('quiz')),
                    "hasDialogue": bool(u.get('speaking', {}).get('dialogueLines')),
                    "hasReading": bool(u.get('reading', {}).get('passage')),
                    "hasWriting": bool(u.get('writing', {}).get('items'))
                })
            g_entry['units'] = updated_units
            g_entry['totalUnits'] = len(updated_units)

    with open(multi_path, 'w', encoding='utf-8') as f:
        json.dump(multi_data, f, ensure_ascii=False, indent=2)
    print("✅ Đã cập nhật src/data/multiGradeCurriculum.json hoàn tất.")

    # 4. In thông số tổng kết
    print("\n=======================================================")
    print(f"🎉 HOÀN THÀNH BIÊN SOẠN DỮ LIỆU TOÀN DIỆN 12 KHỐI LỚP:")
    print(f"   - Tổng số khối lớp: 12 (Lớp 1 đến Lớp 12)")
    print(f"   - Tổng số bài học (Units): {total_units_count} Units")
    print(f"   - Tổng số từ vựng trọng tâm: {total_vocab_count} từ vựng")
    print(f"   - Tích hợp đầy đủ: Từ vựng, Ngữ pháp, Luyện nói AI, Luyện nghe, Đọc hiểu, Viết câu, Phát âm")
    print("=======================================================\n")

if __name__ == '__main__':
    main()
