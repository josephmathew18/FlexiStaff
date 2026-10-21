# FlexiStaff AI — Test Case Specifications

**Project Name:** FlexiStaff AI – AI-Powered Smart Staffing and Temporary Workforce Management System  
**Document Version:** 1.0  
**Status:** Approved / Executed  

---

## Test Case: UI_TC_02 — Executive Dashboard & Analytics

| Attribute | Details | Attribute | Details |
| :--- | :--- | :--- | :--- |
| **Test Case ID** | `UI_TC_02` | **Test Designed By** | QA Engineering Lead |
| **Test Priority** | High | **Test Designed Date** | 19/10/2026 |
| **Module Name** | Executive Dashboard | **Test Executed By** | Automation Suite (Selenium) |
| **Test Title** | Executive Dashboard & Analytics | **Test Execution Date** | 19/10/2026 |

**Description:** Verify the admin dashboard renders KPI cards, the active talent pool banner, and HR Manager telemetry without errors.  
**Pre-Condition:** User is authenticated as Admin and has been routed to `/admin/dashboard`.

| Step | Test Step | Test Data | Expected Result | Actual Result | Status (Pass/Fail) |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | Open the admin dashboard | Route = `/admin/dashboard` | Dashboard workspace loads without error boundary | Dashboard loaded successfully | **Pass** |
| 2 | Verify KPI cards | Cards = Total Projects, Active Projects, Freelancers, Workforce | All four KPI cards are displayed with live values | KPI cards rendered with live counts | **Pass** |
| 3 | Verify active talent pool banner | Banner section on dashboard | Active talent pool banner is visible | Talent pool banner displayed | **Pass** |
| 4 | Verify HR Manager telemetry | HR Manager section (`thomas@flexistaff.com`) | HR Manager metrics and status are rendered | Telemetry section rendered | **Pass** |
| 5 | Capture dashboard screenshot | File = `02_admin_dashboard_analytics.png` | Screenshot saved to `test_reports/screenshots` | Screenshot captured | **Pass** |

**Post-Condition:** Dashboard data is loaded from the backend and displayed correctly.

---

## Test Case: UI_TC_01 — Authentication & Access Control

| Attribute | Details | Attribute | Details |
| :--- | :--- | :--- | :--- |
| **Test Case ID** | `UI_TC_01` | **Test Designed By** | QA Engineering Lead |
| **Test Priority** | Critical | **Test Designed Date** | 19/10/2026 |
| **Module Name** | Authentication & Security | **Test Executed By** | Automation Suite (Selenium) |
| **Test Title** | Admin Login & Session Authorization | **Test Execution Date** | 19/10/2026 |

**Description:** Verify valid administrator credentials authenticate successfully, receive JWT tokens, and route to dashboard.  
**Pre-Condition:** Application backend and frontend are live; admin user exists in database.

| Step | Test Step | Test Data | Expected Result | Actual Result | Status (Pass/Fail) |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | Navigate to login page | URL = `/login` | Login page rendered with email & password fields | Login form rendered | **Pass** |
| 2 | Enter admin credentials | `admin@flexistaff.com` / `admin123` | Fields accept input securely | Inputs populated | **Pass** |
| 3 | Submit authentication form | Click "Sign In" | JWT token stored, user routed to `/admin/dashboard` | Routed to `/admin/dashboard` | **Pass** |
| 4 | Capture screenshot | File = `01_authentication_login_success.png` | Screenshot saved | Screenshot captured | **Pass** |

**Post-Condition:** Admin user session is active with valid Bearer JWT.
