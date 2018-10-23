import os
from datetime import datetime

from lazop.base import LazopClient, LazopRequest

BASE_DIR = os.getcwd()
LAZADA_CREDENTIALS_FILE = BASE_DIR + '/lazada_credentials.csv'
BARCODE_FILE = BASE_DIR + '/src/lazada/oss_barcodes.csv'
ACCESS_TOKEN_FILE = BASE_DIR + '/src/lazada/lazada_auth_access_token.txt'
AUTH_CODE_FILE = BASE_DIR + '/src/lazada/lazada_auth_auth_code.txt'
LAST_SYNC_TIME = BASE_DIR + '/src/lazada/last_sync.txt'

PAYLOAD_BUCKET = 20

with open(LAZADA_CREDENTIALS_FILE) as file:
    for line in file:
        [username, password, app_key, secret] = line.strip().split(',')

with open(ACCESS_TOKEN_FILE) as file:
    for line in file:
        access_token = line.strip()


def create_payload(data, limit, offset):
    payload = '<Request><Product><Skus>'
    for i in range(offset, offset + limit):
        item = data[i]
        # availability = str(int(item[2]) > 0).lower()
        payload += '<Sku>'
        payload += '<SellerSku>' + item[1] + '</SellerSku>'
        payload += '<Quantity>' + item[2] + '</Quantity>'
        # payload += '<active>' + availability + '</active>'
        payload += '</Sku>'
    payload += '</Skus></Product></Request>'
    return payload


with open(BARCODE_FILE) as file:
    data = []
    payloads = []
    for line in file:
        data.append(line.strip().split(','))
    for i, value in enumerate(data):
        if i % PAYLOAD_BUCKET == PAYLOAD_BUCKET - 1:
            payloads.append(create_payload(data, PAYLOAD_BUCKET, i - PAYLOAD_BUCKET + 1))
        if i % PAYLOAD_BUCKET != PAYLOAD_BUCKET - 1 and i == len(data) - 1:
            leftover = len(data) % PAYLOAD_BUCKET
            payloads.append(create_payload(data, leftover, len(data) - leftover))

client = LazopClient('https://api.lazada.vn/rest', app_key, secret)
request = LazopRequest('/product/price_quantity/update')

for payload in payloads:
    request.add_api_param('payload', payload)
    response = client.execute(request, access_token)
    print(response)

f = open(LAST_SYNC_TIME, "w")
f.write(str(datetime.now()))
print('DONE')
