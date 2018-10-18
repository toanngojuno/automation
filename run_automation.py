#!/ave/bin/python

import argparse
import os
import shlex
import signal
import subprocess
import sys
from subprocess import Popen

TIMEOUT = 90  # seconds. If the terminal does not provide any output for this amount of time, we kill it.

parser = argparse.ArgumentParser()

parser.add_argument("--nightwatchEnv",
                    help="Nightwatch Env, optionally specify a different testing environment in nightwatch.json",
                    default="default")

parser.add_argument("--test",
                    help="Test file, e.g.: functional_tests/tests/login.js")

parser.add_argument("--testcase",
                    help="Testcase name to run, e.g.: 'verifies allocation changes'")

parser.add_argument("--repeat",
                    help="Number of times to repeat the entire test run, useful for debugging",
                    type=int,
                    default=0)

parser.add_argument("--debug",
                    help="Enable debug mode in global_module.js",
                    action="store_true",
                    default=False)

parser.add_argument("--verbose",
                    help="Run Nightwatch in verbose mode",
                    action="store_true",
                    default=False)

parser.add_argument("--retries",
                    help="Number of times Nightwatch will retry failed or errored testcase",
                    type=int,
                    default=0)

parser.add_argument("--suiteRetries",
                    help="Number of times Nightwatch will retry failed or errored testsuites",
                    type=int,
                    default=0)

parser.add_argument("--logDirectory",
                    help="Directory to store logs and screenshots to, default: the current directory",
                    default="")

args = parser.parse_args()

args.repeat = args.repeat + 1  # always run once, repeat is the number of times to repeat (not run)
exit_code = 1  # init to error, that way if nothing runs it is an error.
test_failure_detected = False

for x in range(0, args.repeat):
    if args.repeat > 1:
        print("Running iteration {} of {}....".format(x + 1, args.repeat))

    cmd = "node_modules/.bin/nightwatch --env {}".format(args.nightwatchEnv)
    if args.test is not None:
        cmd = "{} --test {}".format(cmd, args.test)
    if args.testcase is not None:
        cmd = "{} --testcase \"{}\"".format(cmd, args.testcase)
    if args.debug:
        cmd = "{} --debug".format(cmd)
    if args.verbose:
        cmd = "{} --verbose".format(cmd)
    if args.retries > 0:
        cmd = "{} --retries {}".format(cmd, args.retries)
    if args.suiteRetries > 0:
        cmd = "{} --suiteRetries {}".format(cmd, args.suiteRetries)
    cmd = os.path.join(os.curdir, cmd)
    print(cmd)

    process = Popen(shlex.split(cmd), shell=False, bufsize=0, stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT)  # Use shlex to preserve quotes.


    def _handler(signum, frame):
        error = 'Timeout of {} seconds reached, stopping execution'.format(TIMEOUT)
        print(error)
        process.kill()
        if (not test_failure_detected):
            print("No failure, but tests hang on completion.")
        raise RuntimeError(error)


    signal.signal(signal.SIGALRM, _handler)

    try:
        while True:
            signal.alarm(TIMEOUT)
            inline = process.stdout.readline()
            sys.stdout.write(inline)
            if not inline:
                break
            if 'FAILED' in inline or 'Error' in inline:
                test_failure_detected = True
            signal.alarm(0)
    except RuntimeError:
        exit_code = 1

    process.communicate()
    exit_code = process.wait()

    # guard against the case where there is no failed test, but the process
    # didn't quit and was terminated by the timer.
    if exit_code != 0 and not test_failure_detected:
        exit_code = 0

    # before exiting, we'd like to kill all the zombie chromedriver processes
    chrome_killer = subprocess.Popen(['ps', '-A'], stdout=subprocess.PIPE)
    out, err = chrome_killer.communicate()

    for line in out.splitlines():
        # this is to ensure we only kill the ones that are spawned by nightwatch
        if 'node_modules/chromedriver' in line or '--test-type=webdriver' in line:
            pid = int(line.split(None, 1)[0])
            os.kill(pid, signal.SIGKILL)

    chrome_killer.wait()

sys.exit(exit_code)
