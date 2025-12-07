
import requests
import sys

BASE_URL = "https://nexcycle-production.up.railway.app"

print(f"Testing connectivity to: {BASE_URL}")

# Test 1: Health / Root
try:
    print("\n[1] Check Root Route / ...")
    r = requests.get(f"{BASE_URL}/", timeout=10)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text[:100]}")
except Exception as e:
    print(f"FAIL: {e}")

# Test 2: Docs (Auto-generated)
try:
    print("\n[2] Check Docs /docs ...")
    r = requests.get(f"{BASE_URL}/docs", timeout=10)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print("SUCCESS: Endpoint docs are reachable.")
    else:
        print("FAIL: Docs not found.")
except Exception as e:
    print(f"FAIL: {e}")

# Test 3: Auth Route (Method check)
try:
    print("\n[3] Check Auth Route /auth/login ...")
    # GET should fail (405 Method Not Allowed) but NOT 404 if route exists
    r = requests.get(f"{BASE_URL}/auth/login", timeout=10) 
    print(f"Status: {r.status_code} (Expected 405 for GET)")
except Exception as e:
    print(f"FAIL: {e}")
