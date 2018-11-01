#!/ave/bin/python

import argparse
import os
import shlex
import signal
import subprocess
from datetime import datetime
from subprocess import Popen

from dateutil import parser as time_parser

exit_code = 1  # init to error, that way if nothing runs it is an error.

UPDATE_HOURS = [12, 0]

BASE_DIR = os.getcwd()

LAST_SYNC_TIME = BASE_DIR + '/src/lazada/last_sync.txt'

ACCESS_TOKEN_FILE = BASE_DIR + '/src/lazada/lazada_auth_access_token.txt'
AUTH_CODE_FILE = BASE_DIR + '/src/lazada/lazada_auth_auth_code.txt'
LAST_AUTH_CODE_DATE = BASE_DIR + '/src/lazada/lazada_auth_last_auth_code_date.txt'

RETRIEVE_STOCK_DONE_FILE = BASE_DIR + '/src/lazada/oss_stock_done.txt'
BARCODE_FILE = BASE_DIR + '/src/lazada/oss_barcodes.csv'
LAST_RETRIEVE_SKU_GROUP = BASE_DIR + '/src/lazada/oss_last_retrieved_sku_group.txt'

files_to_clean = [RETRIEVE_STOCK_DONE_FILE, BARCODE_FILE, LAST_RETRIEVE_SKU_GROUP]
files_to_reset = [ACCESS_TOKEN_FILE, AUTH_CODE_FILE, LAST_AUTH_CODE_DATE, LAST_SYNC_TIME]

parser = argparse.ArgumentParser()

parser.add_argument("--cont",
                    help="Continue previous runs", action="store_true", default=False)

parser.add_argument("--reset",
                    help="Reset everything", action="store_true", default=False)

parser.add_argument("--force",
                    help="Sync regardless of hours", action="store_true", default=False)

parser.add_argument("--once",
                    help="Update once then exit", action="store_true", default=False)

args = parser.parse_args()

if not args.cont:
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
        line = str(line)
        # this is to ensure we only kill the ones that are spawned by nightwatch
        if 'node_modules/chromedriver' in line or '--test-type=webdriver' in line:
            pid = int(line.split(None, 1)[0])
            os.kill(pid, signal.SIGKILL)
    chrome_killer.wait()


def run_process(cmd):
    process = Popen(shlex.split(cmd), shell=False, bufsize=0, stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT)  # Use shlex to preserve quotes.
    while True:
        output = str(process.stdout.readline())
        if output == '' and process.poll() is not None:
            break
        if output:
            print(output.strip())
    process.poll()
    process.communicate()
    process.wait()


while True:
    current_time = datetime.now()
    last_sync_date_str = ''
    with open(LAST_SYNC_TIME, 'r') as file:
        for line in file:
            last_sync_date_str = line.strip()
    if last_sync_date_str and not args.force:
        # making sure we don't update too frequently
        diff = current_time - time_parser.parse(last_sync_date_str)
        hours_passed = diff.days * 24 + diff.seconds / 3600
        if hours_passed <= 6:
            continue

    # making sure we're only updating at the right hours
    if current_time.hour not in UPDATE_HOURS and not args.force:
        continue

    # Step 1
    print("Updating Lazada Stock...")
    print("Starting time:")
    print(current_time)
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
        run_process(cmd)
        kill_chrome()

    # Step 2
    print("STEP 2...")
    cmd = "node_modules/.bin/nightwatch --test src/lazada/step_2_retrieve_auth_code.js"
    run_process(cmd)
    kill_chrome()

    # Step 3
    print("STEP 3...")
    cmd = "python /Users/toanngo/juno/automation/src/lazada/step_3_get_access_code.py"
    run_process(cmd)

    # Step 4
    print("STEP 4...")
    cmd = "python /Users/toanngo/juno/automation/src/lazada/step_4_update_stock.py"
    run_process(cmd)

    print("DONE")
    print("Ending time:")
    print(datetime.now())

    if args.once or args.force:
        break
