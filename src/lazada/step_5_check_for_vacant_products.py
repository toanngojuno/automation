import os
from datetime import datetime

from lazop.base import LazopClient, LazopRequest

BASE_DIR = os.getcwd()
LAZADA_CREDENTIALS_FILE = BASE_DIR + '/lazada_credentials.csv'
BARCODE_FILE = BASE_DIR + '/src/lazada/oss_barcodes.csv'
ACCESS_TOKEN_FILE = BASE_DIR + '/src/lazada/lazada_auth_access_token.txt'
AUTH_CODE_FILE = BASE_DIR + '/src/lazada/lazada_auth_auth_code.txt'
LAST_SYNC_TIME = BASE_DIR + '/src/lazada/last_sync.txt'
EXISTING_BARCODES = BASE_DIR + '/src/lazada/existing_barcodes_on_lazada.txt'

PAYLOAD_BUCKET = 20

with open(LAZADA_CREDENTIALS_FILE) as file:
    for line in file:
        [username, password, app_key, secret] = line.strip().split(',')

with open(ACCESS_TOKEN_FILE) as file:
    for line in file:
        access_token = line.strip()

client = LazopClient('https://api.lazada.vn/rest', app_key, secret)
request = LazopRequest('/product/price_quantity/update')
f = open(EXISTING_BARCODES, "a")
number_products = 0
while True:
    request = LazopRequest('/products/get', 'GET')
    request.add_api_param('offset', str(number_products))
    response = client.execute(request, access_token)
    products = response.body["data"]["products"]
    if int(response.body["data"]["total_products"]) == 0:
        break
    for product in products:
        for sku in product["skus"]:
            f.write(sku["SellerSku"])
            f.write("\n")
    number_products += int(response.body["data"]["total_products"])
    print(number_products)

