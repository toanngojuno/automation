import json
import os

import openpyxl

BASE_DIR = os.getcwd()
EXCEL_FILE = BASE_DIR + '/file/psi.xlsx'
PSI_CSV_FILE = BASE_DIR + '/file/psi.json'

COLLECTION_URL_MAP = {
    # Web
    'Túi xách': 'https://juno-1.myharavan.com/admin/collection#/edit/1000199518',
    'Giày boots': 'https://juno-1.myharavan.com/admin/collection#/edit/1000199525',
    'Giày xăng đan': 'https://juno-1.myharavan.com/admin/collection#/edit/1000199529',
    'Giày búp bê': 'https://juno-1.myharavan.com/admin/collection#/edit/1000199528',
    'Dép guốc': 'https://juno-1.myharavan.com/admin/collection#/edit/1000772835',
    'Giày cao gót': 'https://juno-1.myharavan.com/admin/collection#/edit/1000199526',
    'Giày sneaker': 'https://juno-1.myharavan.com/admin/collection#/edit/1000990498',
    # PSI
    'PSI - Túi Xách': 'https://juno-1.myharavan.com/admin/collection#/edit/1001437531',
    'PSI - Kệ Sneakers': 'https://juno-1.myharavan.com/admin/collection#/edit/1001437529',
    'PSI - Kệ Xăng Đan': 'https://juno-1.myharavan.com/admin/collection#/edit/1001437526',
    'PSI - Kệ Cao Gót': 'https://juno-1.myharavan.com/admin/collection#/edit/1001437528',
    'PSI - Ụ Sau': 'https://juno-1.myharavan.com/admin/collection#/edit/1001439995',
    'PSI - Ụ Mẫu Mới': 'https://juno-1.myharavan.com/admin/collection#/edit/1001437522',
    'PSI - Kệ Búp Bê': 'https://juno-1.myharavan.com/admin/collection#/edit/1001437527',
    'PSI - Kệ Dép Lào': 'https://juno-1.myharavan.com/admin/collection#/edit/1001439996',
    'PSI - Kệ Clear': 'https://juno-1.myharavan.com/admin/collection#/edit/1001437530',
    # Mẫu mới
    'Top sản phẩm mới': 'https://juno-1.myharavan.com/admin/collection#/edit/1001322199',
    # Bán chạy
    'Top sản phẩm bán chạy': 'https://juno-1.myharavan.com/admin/collection#/edit/1000470749',
}

WEBSITE_PSI_SHEET = 'Website Juno'
WEBSITE_PSI_RANGE = 'A3:D500'

STORE_PSI_SHEET = 'Website PSI'
STORE_PSI_RANGE = 'A2:D500'

NEW_PRODUCTS_SHEET = 'Sản phẩm mới nhất'
NEW_PRODUCTS_RANGE = 'A2:E11'

HOT_PRODUCTS_SHEET = 'Sản phẩm bán chạy nhất'
HOT_PRODUCTS_RANGE = 'A2:E11'

wb = openpyxl.load_workbook(EXCEL_FILE)
product_map = {}


def sheet_lookup(name):
    for sheet_name in wb.sheetnames:
        if name.lower() in sheet_name.lower():
            return wb[sheet_name]


def category_to_url_web(category):
    category = category.lower()
    # Web
    if 'dép guốc' in category:
        return COLLECTION_URL_MAP['Dép guốc']
    if 'boot' in category:
        return COLLECTION_URL_MAP['Giày boots']
    if 'búp bê' in category:
        return COLLECTION_URL_MAP['Giày búp bê']
    if 'cao gót' in category:
        return COLLECTION_URL_MAP['Giày cao gót']
    if 'xăng đan' in category:
        return COLLECTION_URL_MAP['Giày xăng đan']
    if 'thể thao' in category or 'sneaker' in category:
        return COLLECTION_URL_MAP['Giày sneaker']
    if 'túi xách' in category:
        return COLLECTION_URL_MAP['Túi xách']


def category_to_url_psi(category):
    category = category.lower()
    # PSI
    if 'kệ dép lào' in category:
        return COLLECTION_URL_MAP['PSI - Kệ Dép Lào']
    if 'kệ búp bế ' in category:
        return COLLECTION_URL_MAP['PSI - Kệ Búp Bê']
    if 'ụ mẫu mới' in category:
        return COLLECTION_URL_MAP['PSI - Ụ Mẫu Mới']
    if 'ụ sau' in category:
        return COLLECTION_URL_MAP['PSI - Ụ Sau']
    if 'kệ cao gót' in category:
        return COLLECTION_URL_MAP['PSI - Kệ Cao Gót']
    if 'kệ xăng đan' in category:
        return COLLECTION_URL_MAP['PSI - Kệ Xăng Đan']
    if 'kệ sneaker' in category:
        return COLLECTION_URL_MAP['PSI - Kệ Sneakers']
    if 'túi xách' in category:
        return COLLECTION_URL_MAP['PSI - Túi Xách']


# SP mới
sheet = sheet_lookup(NEW_PRODUCTS_SHEET)
current_category = None
product_map[COLLECTION_URL_MAP['Top sản phẩm mới']] = []
for row in sheet[NEW_PRODUCTS_RANGE]:
    product_map[COLLECTION_URL_MAP['Top sản phẩm mới']].append(row[2].value.strip())

# SP hot
sheet = sheet_lookup(HOT_PRODUCTS_SHEET)
current_category = None
product_map[COLLECTION_URL_MAP['Top sản phẩm bán chạy']] = []
for row in sheet[HOT_PRODUCTS_RANGE]:
    print(row)
    product_map[COLLECTION_URL_MAP['Top sản phẩm bán chạy']].append(row[2].value.strip())

# Website Juno
sheet = sheet_lookup(WEBSITE_PSI_SHEET)
current_category = None
for row in sheet[WEBSITE_PSI_RANGE]:
    if not row[0].value and row[1].value:
        if 'cm' not in row[1].value:
            current_category = category_to_url_web(row[1].value.strip())
            product_map[current_category] = []
            continue
    if current_category and row[2].value:
        product_map[current_category].append(row[2].value.strip())

# PSI Juno
sheet = sheet_lookup(STORE_PSI_SHEET)
current_category = None
for row in sheet[STORE_PSI_RANGE]:
    if row[0].value and not row[1].value and not row[2].value and not row[3].value:
        current_category = category_to_url_psi(row[0].value.strip())
        product_map[current_category] = []
        continue
    if current_category and row[0].value:
        product_map[current_category].append(row[2].value.strip())

f = open(PSI_CSV_FILE, "w")
f.write(json.dumps(product_map))