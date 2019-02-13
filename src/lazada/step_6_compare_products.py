import os
from lazop.base import LazopClient, LazopRequest

BASE_DIR = os.getcwd()

BARCODE_FILE = BASE_DIR + '/src/lazada/oss_barcodes.csv'
EXISTING_PRODUCT_FILE = BASE_DIR + '/src/lazada/existing_barcodes_on_lazada.txt'
LAZADA_CREDENTIALS_FILE = BASE_DIR + '/lazada_credentials.csv'
ACCESS_TOKEN_FILE = BASE_DIR + '/src/lazada/lazada_auth_access_token.txt'

existing = []
oss = []

# SD07024,1104000003591,91
with open(BARCODE_FILE) as file:
    for line in file:
        oss.append(int(line.strip().split(',')[1]))

with open(EXISTING_PRODUCT_FILE) as file:
    for line in file:
        existing.append(int(line.strip()))

result = []
for barcode in existing:
    if barcode not in oss:
        result.append(barcode)

PAYLOAD_BUCKET = 20


def create_payload(data, limit, offset):
    payload = '<Request><Product><Skus>'
    for i in range(offset, offset + limit):
        item = data[i]
        payload += '<Sku>'
        payload += '<SellerSku>' + str(item) + '</SellerSku>'
        payload += '<Quantity>' + str(0) + '</Quantity>'
        payload += '</Sku>'
    payload += '</Skus></Product></Request>'
    return payload


with open(LAZADA_CREDENTIALS_FILE) as file:
    for line in file:
        [username, password, app_key, secret] = line.strip().split(',')

with open(ACCESS_TOKEN_FILE) as file:
    for line in file:
        access_token = line.strip()

payloads = []
for i, value in enumerate(result):
    if i % PAYLOAD_BUCKET == PAYLOAD_BUCKET - 1:
        payloads.append(create_payload(result, PAYLOAD_BUCKET, i - PAYLOAD_BUCKET + 1))
    if i % PAYLOAD_BUCKET != PAYLOAD_BUCKET - 1 and i == len(result) - 1:
        leftover = len(result) % PAYLOAD_BUCKET
        payloads.append(create_payload(result, leftover, len(result) - leftover))

client = LazopClient('https://api.lazada.vn/rest', app_key, secret)
request = LazopRequest('/product/price_quantity/update')

result = list(set(result))

for payload in payloads:
    request.add_api_param('payload', payload)
    response = client.execute(request, access_token)
    print(response)
