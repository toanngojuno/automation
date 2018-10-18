#!/ave/bin/python

import argparse
import os
import shlex
import signal
import subprocess
import sys
from subprocess import Popen

exit_code = 1  # init to error, that way if nothing runs it is an error.

BASE_DIR = os.getcwd()

ACCESS_TOKEN_FILE = BASE_DIR + '/src/lazada/access_token.txt'
AUTH_CODE_FILE = BASE_DIR + '/src/lazada/auth_code.txt'
LAST_AUTH_CODE_DATE = BASE_DIR + '/src/lazada/last_auth_code_date.txt'

RETRIEVE_STOCK_DONE_FILE = BASE_DIR + '/src/lazada/retrieve-stock-done.txt'
BARCODE_FILE = BASE_DIR + '/automation/src/lazada/barcode-generated.csv'
LAST_RETRIEVE_SKU_GROUP = BASE_DIR + '/automation/src/lazada/last_retrieve_sku_group.txt'

files_to_clean = [RETRIEVE_STOCK_DONE_FILE, BARCODE_FILE, LAST_RETRIEVE_SKU_GROUP]
files_to_reset = [ACCESS_TOKEN_FILE, AUTH_CODE_FILE, LAST_AUTH_CODE_DATE]

parser = argparse.ArgumentParser()

parser.add_argument("--clean",
                    help="Updating with new stock data", action="store_true", default=False)

parser.add_argument("--reset",
                    help="Reset everything", action="store_true", default=False)

args = parser.parse_args()

if args.clean:
    for file in files_to_clean:
        f = open(file, "w")
        f.write('')

if args.reset:
    for file in files_to_reset + files_to_clean:
        f = open(file, "w")
        f.write('')


def kill_chrome():
    # before exiting, we'd like to kill all the zombie chromedriver processes
    chrome_killer = subprocess.Popen(['ps', '-A'], stdout=subprocess.PIPE)
    out, err = chrome_killer.communicate()
    for line in out.splitlines():
        # this is to ensure we only kill the ones that are spawned by nightwatch
        if 'node_modules/chromedriver' in line or '--test-type=webdriver' in line:
            pid = int(line.split(None, 1)[0])
            os.kill(pid, signal.SIGKILL)
    chrome_killer.wait()


# Step 1
print("STEP 1...")
while True:
    BREAK = False
    try:
        with open(RETRIEVE_STOCK_DONE_FILE, 'r') as file:
            for line in file:
                if line.strip() == 'DONE':
                    BREAK = True
    except Exception:
        pass
    if BREAK:
        break

    cmd = "node_modules/.bin/nightwatch --test src/lazada/step_1_retrieve_stock.js"
    process = Popen(shlex.split(cmd), shell=False, bufsize=0, stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT)  # Use shlex to preserve quotes.
    process.communicate()
    exit_code = process.wait()
    kill_chrome()

# Step 2
print("STEP 2...")
cmd = "node_modules/.bin/nightwatch --test src/lazada/step_2_retrieve_auth_code.js"
process = Popen(shlex.split(cmd), shell=False, bufsize=0, stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT)  # Use shlex to preserve quotes.
process.communicate()
exit_code = process.wait()
kill_chrome()

# Step 3
print("STEP 3...")
cmd = "python /Users/toanngo/juno/automation/src/lazada/step_3_get_access_code.py"
process = Popen(shlex.split(cmd), shell=False, bufsize=0, stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT)  # Use shlex to preserve quotes.
process.communicate()
process.wait()

# Step 4
print("STEP 4...")
cmd = "python /Users/toanngo/juno/automation/src/lazada/step_4_update_stock.py"
process = Popen(shlex.split(cmd), shell=False, bufsize=0, stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT)  # Use shlex to preserve quotes.
process.communicate()
process.wait()

sys.exit(exit_code)
