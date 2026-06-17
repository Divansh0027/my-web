# Security Specification: Shiv Saya Properties

This document defines the security boundaries, data invariants, and adversarial test cases for the Shiv Saya Properties Firestore database.

## 1. Data Invariants

- **Properties Collection (`/properties/{propertyId}`)**:
  - Read access is public for properties with status "live". Owners can read their own pending/rejected properties. Admins can read all properties.
  - Write access (create) is allowed for authenticated users, provided the status is strictly set to "pending" and passes schema validations. Alternately, admins can bypass restrictions.
  - Owners can update or delete their own "pending" properties. Admins can update, moderate (live/rejected status transitions), or delete any property.

- **Enquiries Collection (`/enquiries/{enquiryId}`)**:
  - Write access (`create`) is publicly allowed, provided that the payload adheres strictly to the schema structure (validated properties, phone formats, message character limits), passes data validation bounds, and has a valid clean ID.
  - Read access is allowed for direct creators and administrators. Updation and deletion are restricted entirely to administrators.

- **Users Collection (`/users/{userId}`)**:
  - Read access and update access are private, restricted strictly to the matching owner (`request.auth.uid == userId`) or administrators, preventing demographic and contact detail leaks. Banned user flags can only be updated by administrators.

- **Favorites Collection (`/users/{userId}/favorites/{propertyId}`)**:
  - Both read (`get`, `list`) and write (`create`, `delete`) access are strictly restricted to the owner of that user ID (`request.auth.uid == userId`).
  - No user can read, list, update, or delete any other user's favorite list.

---

## 2. The "Dirty Dozen" Adversarial Payloads

Here are 12 specific payloads or operations designed to attempt security breaches ("Identity, Integrity, and State" violations) and how the rules block them.

### Case 1: Unauthorized Property Creation
- **Target**: `/properties/malicious_prop`
- **Payload**: `{ "id": "malicious_prop", "title": "Fake Mansion", "price": 100 }`
- **Expected Outcome**: `PERMISSION_DENIED`
- **Violation**: Identity/Authorization Bypass.

### Case 2: Unauthorized Property Deletion
- **Target**: `/properties/prop_1` (delete)
- **Expected Outcome**: `PERMISSION_DENIED`
- **Violation**: State Damage / Security Bypass.

### Case 3: Empty Name in Enquiry Submission
- **Target**: `/enquiries/enq_1`
- **Payload**: `{ "name": "", "phone": "+919876543210", "propertyId": "prop_1", "propertyName": "DLF Phase 3 Apartment", "type": "enquiry" }`
- **Expected Outcome**: `PERMISSION_DENIED`
- **Violation**: Integrity / Schema Validation Bypass.

### Case 4: Invalid Type in Enquiry Submission
- **Target**: `/enquiries/enq_1`
- **Payload**: `{ "name": "Rajesh Kumar", "phone": "+919876543210", "propertyId": "prop_1", "propertyName": "DLF Phase 3 Apartment", "type": "spam" }`
- **Expected Outcome**: `PERMISSION_DENIED`
- **Violation**: State Shortcutting / Enum Validation Bypass.

### Case 5: Path Variable ID Poisoning (Long ID)
- **Target**: `/enquiries/enq_very_long_poison_string_designed_to_bloat_firestore_database_indexing_and_cause_massiveBillingResourceExhaustionAndBillingFailures_`
- **Payload**: `{ "name": "Rajesh Kumar", "phone": "+919876543210", "propertyId": "prop_1", "propertyName": "DLF Phase 3 Apartment", "type": "enquiry" }`
- **Expected Outcome**: `PERMISSION_DENIED`
- **Violation**: Denial of Wallet / Resource Poisoning.

### Case 6: Extra Field Injection into Enquiry (Ghost Field)
- **Target**: `/enquiries/enq_1`
- **Payload**: `{ "name": "Rajesh Kumar", "phone": "+919876543210", "propertyId": "prop_1", "propertyName": "DLF Phase 3 Apartment", "type": "enquiry", "isSpam": false, "ghost_field": "injected" }`
- **Expected Outcome**: `PERMISSION_DENIED`
- **Violation**: Under-validated Write / Shadow Field Injection.

### Case 7: Unauthenticated Favorite Read
- **Target**: `/users/legit_user_123/favorites/prop_1` (get)
- **Request State**: Unauthenticated
- **Expected Outcome**: `PERMISSION_DENIED`
- **Violation**: Identity/Privacy Breach.

### Case 8: Inter-User Favorite Hijacking (Impersonation)
- **Target**: `/users/victim_user_456/favorites/prop_1`
- **Request State**: Authenticated as `aggressor_user_789`
- **Payload**: `{ "userId": "victim_user_456", "propertyId": "prop_1", "savedAt": "2026-06-10T16:00:00Z" }`
- **Expected Outcome**: `PERMISSION_DENIED`
- **Violation**: Cross-Tenant Identity Spoofing.

### Case 9: List Query Broad Sweep (No Owner Check)
- **Target**: `/users/victim_user_456/favorites` (list)
- **Request State**: Authenticated as `aggressor_user_789`
- **Expected Outcome**: `PERMISSION_DENIED`
- **Violation**: Mass Data Scraping / Query Trust Breach.

### Case 10: Missing Required Field in Enquiry (Integrity Check)
- **Target**: `/enquiries/enq_1`
- **Payload**: `{ "name": "Rajesh Kumar", "propertyId": "prop_1", "propertyName": "DLF Phase 3 Apartment", "type": "enquiry" }` (No phone field)
- **Expected Outcome**: `PERMISSION_DENIED`
- **Violation**: Schema Integrity Violation.

### Case 11: Too Long Message in Enquiry (Data Bloating Attempt)
- **Target**: `/enquiries/enq_1`
- **Payload**: `{ "name": "Rajesh Kumar", "phone": "+919876543210", "propertyId": "prop_1", "propertyName": "DLF", "type": "enquiry", "message": "A".repeat(2500) }`
- **Expected Outcome**: `PERMISSION_DENIED`
- **Violation**: Denial of Wallet / Storage Bloat.

### Case 12: Favorite Operation with Wrong User ID in Payload
- **Target**: `/users/user_foo/favorites/prop_1`
- **Request State**: Authenticated as `user_foo`
- **Payload**: `{ "userId": "user_bar", "propertyId": "prop_1" }`
- **Expected Outcome**: `PERMISSION_DENIED`
- **Violation**: Payload Identity Inconsistency / Data Poisoning.

---

## 3. Test Runner Design (`firestore.rules.test.ts`)

The rules are tested programmatically against the `@firebase/rules-unit-testing` or standard assertion suites. Every adversarial scenario listed above returns a clean, secure `PERMISSION_DENIED` or fails schema validation synchronously before reaching disk storage.
