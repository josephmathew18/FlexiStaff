import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8080"
results = []

def record_result(test_id, name, endpoint, method, status_code, expected_status, success, details):
    res = {
        "test_id": test_id,
        "name": name,
        "endpoint": endpoint,
        "method": method,
        "status_code": status_code,
        "expected_status": expected_status,
        "success": success,
        "details": details,
        "timestamp": datetime.now().isoformat()
    }
    results.append(res)
    mark = "PASS" if success else "FAIL"
    print(f"[{mark}] {test_id}: {name} ({method} {endpoint}) -> Status {status_code}")
    if not success:
        print(f"       Error details: {details}")

def run_all_api_tests():
    print("=" * 70)
    print("STARTING FLEXISTAFF BACKEND REST API TEST SUITE")
    print("=" * 70)
    
    # Test 1: Admin Authentication
    token = None
    try:
        url = f"{BASE_URL}/api/v1/auth/login"
        payload = {"email": "admin@flexistaff.com", "password": "admin123"}
        r = requests.post(url, json=payload, timeout=10)
        data = r.json()
        token = data.get("data", {}).get("accessToken")
        is_success = r.status_code == 200 and token is not None and data.get("success") is True
        record_result(
            "API-01",
            "Admin Authentication & JWT Generation",
            "/api/v1/auth/login",
            "POST",
            r.status_code,
            200,
            is_success,
            f"Token length: {len(token) if token else 0}, Message: {data.get('message')}"
        )
    except Exception as e:
        record_result("API-01", "Admin Authentication & JWT Generation", "/api/v1/auth/login", "POST", 500, 200, False, str(e))

    if not token:
        print("Fatal: Could not obtain JWT token. Aborting dependent tests.")
        return results

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # Test 2: Current User Profile
    try:
        url = f"{BASE_URL}/api/v1/auth/me"
        r = requests.get(url, headers=headers, timeout=10)
        data = r.json()
        user = data.get("data", {})
        is_success = r.status_code == 200 and user.get("email") == "admin@flexistaff.com" and user.get("role") == "ROLE_ADMIN"
        record_result(
            "API-02",
            "Get Current Authenticated User Profile",
            "/api/v1/auth/me",
            "GET",
            r.status_code,
            200,
            is_success,
            f"User: {user.get('fullName')}, Role: {user.get('role')}, Active: {user.get('active')}"
        )
    except Exception as e:
        record_result("API-02", "Get Current Authenticated User Profile", "/api/v1/auth/me", "GET", 500, 200, False, str(e))

    # Test 3: Admin Dashboard Statistics
    try:
        url = f"{BASE_URL}/api/v1/dashboard/admin"
        r = requests.get(url, headers=headers, timeout=10)
        data = r.json()
        metrics = data.get("data", {})
        is_success = r.status_code == 200 and data.get("success") is True and metrics is not None
        record_result(
            "API-03",
            "Admin Dashboard Analytics & System Metrics",
            "/api/v1/dashboard/admin",
            "GET",
            r.status_code,
            200,
            is_success,
            f"Metrics retrieved: {list(metrics.keys()) if isinstance(metrics, dict) else metrics}"
        )
    except Exception as e:
        record_result("API-03", "Admin Dashboard Analytics & System Metrics", "/api/v1/dashboard/admin", "GET", 500, 200, False, str(e))

    # Test 4: Project Creation and Retrieval
    created_project_id = None
    try:
        url = f"{BASE_URL}/api/v1/projects"
        project_payload = {
            "title": f"Enterprise Cloud AI Modernization - Batch {int(time.time())}",
            "description": "Cross-functional staffing project for containerized AI pipelines.",
            "requiredSkills": "Kubernetes, Spring Boot, PyTorch, React",
            "workforceRequired": 5,
            "clientId": 8,
            "budget": 125000.00,
            "startDate": "2026-11-01",
            "endDate": "2027-04-30"
        }
        r = requests.post(url, headers=headers, json=project_payload, timeout=10)
        data = r.json()
        proj = data.get("data", {})
        created_project_id = proj.get("id")
        is_success = r.status_code == 201 and created_project_id is not None
        record_result(
            "API-04",
            "Create New Enterprise Client Project",
            "/api/v1/projects",
            "POST",
            r.status_code,
            201,
            is_success,
            f"Created Project ID: {created_project_id}, Title: {proj.get('title')}"
        )
    except Exception as e:
        record_result("API-04", "Create New Enterprise Client Project", "/api/v1/projects", "POST", 500, 201, False, str(e))

    # Test 5: Get All Projects Listing
    try:
        url = f"{BASE_URL}/api/v1/projects"
        r = requests.get(url, headers=headers, timeout=10)
        data = r.json()
        proj_list = data.get("data", [])
        is_success = r.status_code == 200 and isinstance(proj_list, list) and len(proj_list) > 0
        record_result(
            "API-05",
            "Retrieve All Projects Catalog",
            "/api/v1/projects",
            "GET",
            r.status_code,
            200,
            is_success,
            f"Total Projects in Database: {len(proj_list)}"
        )
    except Exception as e:
        record_result("API-05", "Retrieve All Projects Catalog", "/api/v1/projects", "GET", 500, 200, False, str(e))

    # Test 6: Talent / Freelancer Roster Retrieval
    try:
        url = f"{BASE_URL}/api/v1/freelancers"
        r = requests.get(url, headers=headers, timeout=10)
        data = r.json()
        freelancers = data.get("data", [])
        is_success = r.status_code == 200 and isinstance(freelancers, list) and len(freelancers) > 0
        record_result(
            "API-06",
            "Workforce & Freelancer Roster Retrieval",
            "/api/v1/freelancers",
            "GET",
            r.status_code,
            200,
            is_success,
            f"Total Active Freelancers: {len(freelancers)}"
        )
    except Exception as e:
        record_result("API-06", "Workforce & Freelancer Roster Retrieval", "/api/v1/freelancers", "GET", 500, 200, False, str(e))

    # Test 7: Support Ticket Submission & Retrieval
    try:
        url = f"{BASE_URL}/api/v1/support/tickets"
        ticket_payload = {
            "category": "Quality Assurance",
            "subject": f"Automated Suite Health Check - {int(time.time())}",
            "message": "Automated regression and smoke test run completed with 100% verification.",
            "priority": "Medium",
            "senderRole": "Admin",
            "senderName": "System Administrator",
            "senderEmail": "admin@flexistaff.com"
        }
        r = requests.post(url, headers=headers, json=ticket_payload, timeout=10)
        data = r.json()
        ticket = data.get("data", {})
        is_success = r.status_code == 201 and ticket.get("id") is not None
        record_result(
            "API-07",
            "Submit Enterprise Support Ticket",
            "/api/v1/support/tickets",
            "POST",
            r.status_code,
            201,
            is_success,
            f"Created Ticket ID: {ticket.get('id')}, Status: {ticket.get('status')}"
        )
    except Exception as e:
        record_result("API-07", "Submit Enterprise Support Ticket", "/api/v1/support/tickets", "POST", 500, 201, False, str(e))

    # Test 8: Client Directory Retrieval
    try:
        url = f"{BASE_URL}/api/v1/clients"
        r = requests.get(url, headers=headers, timeout=10)
        data = r.json()
        clients = data.get("data", [])
        is_success = r.status_code == 200 and isinstance(clients, list) and len(clients) > 0
        record_result(
            "API-08",
            "Enterprise Client Directory Retrieval",
            "/api/v1/clients",
            "GET",
            r.status_code,
            200,
            is_success,
            f"Total Enterprise Clients: {len(clients)}"
        )
    except Exception as e:
        record_result("API-08", "Enterprise Client Directory Retrieval", "/api/v1/clients", "GET", 500, 200, False, str(e))

    # Save Results to JSON
    with open("c:/Users/mathu/OneDrive/Desktop/Flexistaff/test_reports/api_test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    print("\nAPI test results saved to c:/Users/mathu/OneDrive/Desktop/Flexistaff/test_reports/api_test_results.json")
    return results

if __name__ == "__main__":
    run_all_api_tests()
