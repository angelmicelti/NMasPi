# Security Specification: Planes de Lectura y Razonamiento Matemático IES (Andalucía)

## 1. Data Invariants
- **Read Access**: Any authenticated teacher (whose email ends with `@g.educaand.es`, `@juntadeandalucia.es`, or other authorized domain) can read all registered readings and activities to maintain a centralized and shared repository in real time.
- **Write Access**:
  - **Create**: Any authenticated teacher can register a new reading or activity. The `teacherId` in the created document must exactly match their Firebase Auth UID (`request.auth.uid`), and `teacherEmail` must match their Auth Email.
  - **Update**: Only the teacher who created the reading or activity (`resource.data.teacherId == request.auth.uid`) can edit its fields. They are not allowed to transfer ownership to another teacher (i.e. `teacherId` and `teacherEmail` are immutable).
  - **Delete**: Only the teacher who created the reading or activity (`resource.data.teacherId == request.auth.uid`) can delete it.
- **Data Validation**:
  - Document IDs must be valid alphanumeric strings.
  - Required fields must be present and of correct types.
  - String lengths, numeric boundaries, and timestamps must be strictly validated.
  - Temporal integrity: `createdAt` is immutable and set to `request.time` during creation. `updatedAt` must be set to `request.time` during updates.

---

## 2. The "Dirty Dozen" Payloads (Exploit Scenarios)

These payloads represents unauthorized, malicious or structurally invalid attempts to compromise the Firestore database. Our security rules will block all of them.

### Exploit 1: Anonymous Create
An unauthenticated user attempts to create a reading.
- **Payload**: `{ "title": "Criptografía básica", "author": "Alice", "course": "3º ESO", "teacherId": "attacker", "teacherEmail": "attacker@gmail.com", "term": "1º Trimestre", "date": "2026-07-11" }`
- **Expected Outcome**: `PERMISSION_DENIED`

### Exploit 2: Identity Theft on Create
An authenticated teacher (`uid: "docente_real"`) attempts to create an activity with someone else's `teacherId` or `teacherEmail`.
- **Payload**: `{ "title": "Sudokus lógicos", "topic": "Lógica", "course": "1º ESO", "teacherId": "otro_profesor", "teacherEmail": "otro@g.educaand.es", "term": "2º Trimestre", "date": "2026-07-11" }`
- **Expected Outcome**: `PERMISSION_DENIED` (auth.uid does not match teacherId)

### Exploit 3: Bypass Email Verification
An authenticated user with an unverified email (or spoofed claims) attempts a write.
- **Expected Outcome**: `PERMISSION_DENIED` (all teachers must have email verified or checked securely, though in some environments we allow simple domain verification, we'll mandate `request.auth.token.email_verified == true` if enabled, or email domain match).

### Exploit 4: Malicious Update of Someone Else's Activity
An authenticated teacher (`uid: "profesor_b"`) tries to edit an activity created by `profesor_a` (`teacherId: "profesor_a"`).
- **Target Document**: `/activities/activity_123` (owned by `profesor_a`)
- **Payload**: `{ "title": "Título editado por atacante" }`
- **Expected Outcome**: `PERMISSION_DENIED`

### Exploit 5: Delete Someone Else's Reading
An authenticated teacher (`uid: "profesor_b"`) tries to delete a reading created by `profesor_a`.
- **Target Document**: `/readings/reading_123` (owned by `profesor_a`)
- **Expected Outcome**: `PERMISSION_DENIED`

### Exploit 6: Ownership Escalation during Update
An authenticated teacher (`uid: "profesor_a"`) edits their own activity but tries to change the `teacherId` to another user to dump responsibilities.
- **Payload**: `{ "teacherId": "profesor_b" }`
- **Expected Outcome**: `PERMISSION_DENIED`

### Exploit 7: Creation with Spoofed Timestamps
An attacker sends a future or past timestamp for `createdAt` instead of relying on the secure server time.
- **Payload**: `{ ..., "createdAt": "2030-01-01T00:00:00Z" }` (instead of `request.time`)
- **Expected Outcome**: `PERMISSION_DENIED`

### Exploit 8: Denial of Wallet (Giant Strings in Fields)
An attacker registers an activity with a 5MB text in the title or description to cause storage and reading cost inflation.
- **Payload**: `{ "title": "A".repeat(100000), ... }`
- **Expected Outcome**: `PERMISSION_DENIED` (length limits on strings)

### Exploit 9: Invalid Course Enumeration
An attacker tries to input a courses field like "Universidad" or "Primaria" which is out of range.
- **Payload**: `{ "course": "Primaria", ... }`
- **Expected Outcome**: `PERMISSION_DENIED`

### Exploit 10: Injecting Ghost Fields (Shadow Update)
An attacker updates their reading adding a hidden field like `isAdmin: true` or `verifiedTeacher: true`.
- **Payload**: `{ "title": "Nueva Lectura", "isAdmin": true }`
- **Expected Outcome**: `PERMISSION_DENIED` (strictly checked affected keys)

### Exploit 11: Invalid Topic Enumeration in Activities
An attacker registers an activity with a topic like "Deportes" instead of math reasoning blocks.
- **Payload**: `{ "topic": "Deportes", ... }`
- **Expected Outcome**: `PERMISSION_DENIED`

### Exploit 12: Orphaned Data Injection
An attacker registers a document with invalid alphanumeric or non-standard characters in the document ID path (e.g. inject path traversal or SQL injection patterns into ID).
- **Target Document ID**: `readings/../../../some_secret` or highly poisoned document ID
- **Expected Outcome**: `PERMISSION_DENIED`

---

## 3. Test Verification Plan

The secure Firestore rules will be written to `firestore.rules`.
These rules will enforce:
- Authenticated state and email checks.
- Exact validation helper `isValidReading(data)` and `isValidActivity(data)`.
- Restricting update/delete to document owners.
- Blocking all 12 exploit payloads described above.
