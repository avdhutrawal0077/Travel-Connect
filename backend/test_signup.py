import urllib.request
import urllib.error
import json

url = "http://127.0.0.1:5000/api/auth/register"
payload = {
    "email": "test99@example.com",
    "user_id": "test99",
    "password": "pw",
    "full_name": "Test 99",
    "phone": "999999999",
    "gender": "",
    "dob": ""
}
data = json.dumps(payload).encode("utf-8")
req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Response:", response.read().decode("utf-8"))
except urllib.error.HTTPError as e:
    print("Status:", e.code)
    print("Response:", e.read().decode("utf-8"))
except Exception as e:
    print("Error:", e)
