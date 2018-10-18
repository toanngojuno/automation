import sys

print(sys.path)

from lazop import LazopClient, LazopRequest

LAZADA_CREDENTIALS_FILE = '/Users/toanngo/juno/automation/lazada_credentials.csv'
ACCESS_TOKEN_FILE = '/Users/toanngo/juno/automation/src/lazada/access_token.txt'
AUTH_CODE_FILE = '/Users/toanngo/juno/automation/src/lazada/auth_code.txt'

access_token = False
auth_code = False

with open(LAZADA_CREDENTIALS_FILE) as file:
    for line in file:
        [username, password, app_key, secret] = line.strip().split(',')

with open(AUTH_CODE_FILE) as file:
    for line in file:
        auth_code = line.strip()

with open(ACCESS_TOKEN_FILE) as file:
    for line in file:
        access_token = line.strip()


def retrieve_access_token():
    client = LazopClient("https://auth.lazada.com/rest", app_key, secret)
    request = LazopRequest("/auth/token/create")
    request.add_api_param("code", auth_code)
    response = client.execute(request)
    print(response.body)
    return response.body['access_token']


if auth_code and not access_token:
    f = open(ACCESS_TOKEN_FILE, "w")
    f.write(retrieve_access_token())
