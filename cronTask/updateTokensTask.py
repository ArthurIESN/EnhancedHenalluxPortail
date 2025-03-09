# This task as for job to keep alive and update data request
# Avoiding the server to loss access to henallux portail
# The script must at least be call once per hour (two is recommended)

import os
import requests
import time

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir, '.env'))

def load_env(file_path):
    with open(file_path) as f:
        for line in f:
            if line.strip() and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                os.environ[key] = value

load_env(env_path)

url = os.getenv('URL') + "/api/updaterequestdata"
key = os.getenv('KEY')

web = requests.get(os.getenv('URL'))
response = requests.post(url, json={'key': key})

if response.status_code == 200:
    print("Task completed successfully")
else:
    print("Task failed with status code: " + str(response.status_code))
    print("re trying once after 10 seconds")
    time.sleep(10)

    response = requests.post(url, json={'key': key})

    if response.status_code == 200:
        print("Task completed successfully on second try")
    else:
        print("Second try failed with status code: " + str(response.status_code))