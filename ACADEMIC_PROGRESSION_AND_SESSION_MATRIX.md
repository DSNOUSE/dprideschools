# Academic Progression and Session Matrix

This matrix serves as the operational reference for IDs, sessions, terms, classes, and student progression across academic years.

---

## 1. Academic Sessions Reference

| Session ID | Session Name | Status | Role in System |
| :--- | :--- | :--- | :--- |
| **`4`** | `2024/2025` | Inactive | Historical Session (2 years ago) |
| **`1`** | `2025/2026` | Inactive | Previous Session (Last academic year) |
| **`2`** | `2026/2027` | **Active** | **Current Academic Year** |

---

## 2. Academic Terms Reference

### Session 2025/2026 (`sessionId: 1`)
| Term ID | Name | Order | Status |
| :--- | :--- | :--- | :--- |
| **`2`** | First Term | 1 | Inactive |
| **`3`** | Second Term | 2 | Inactive |
| **`4`** | Third Term | 3 | Inactive |

### Session 2026/2027 (`sessionId: 2` - Current)
| Term ID | Name | Order | Status |
| :--- | :--- | :--- | :--- |
| **`8`** | First Term | 1 | Active / Current |
| **`9`** | Second Term | 2 | Inactive |
| **`10`** | Third Term | 3 | Inactive |

### Session 2024/2025 (`sessionId: 4` - Historical)
| Term ID | Name | Order | Status |
| :--- | :--- | :--- | :--- |
| **`5`** | First Term | 1 | Inactive |
| **`6`** | Second Term | 2 | Inactive |
| **`7`** | Third Term | 3 | Inactive |

---

## 3. Class Hierarchy & ID Mapping

| Class ID | Class Name | Level ID | Level Category |
| :--- | :--- | :--- | :--- |
| **`2`** | DISCOVERY CLASS (Pre-Nursery) | 1 | Pre-Nursery |
| **`3`** | EXPLORERS (Nursery 1) | 2 | Nursery |
| **`4`** | PREPARATORY (Nursery 2) | 3 | Nursery |
| **`5`** | YEAR 1 | 4 | Primary |
| **`6`** | YEAR 2 | 5 | Primary |
| **`7`** | YEAR 3 | 6 | Primary |
| **`8`** | YEAR 4 | 7 | Primary |
| **`9`** | YEAR 5 | 8 | Primary |
| **`10`** | YEAR 6 | 9 | Primary |
| **`11`** | **YEAR 7** | 10 | Secondary (JSS 1) |
| **`12`** | **YEAR 8** | 11 | Secondary (JSS 2) |
| **`13`** | **YEAR 9** | 12 | Secondary (JSS 3) |
| **`1`** | Primary 1 (Legacy) | 4 | Primary |

---

## 4. Promotion & Academic Progression Trajectory

When a student advances from one session to the next, their progression must follow this deterministic mapping:

```
Session 2024/2025 (ID: 4)  -->  Session 2025/2026 (ID: 1)  -->  Session 2026/2027 (ID: 2 - CURRENT)
-----------------------        -----------------------        ------------------------------
DISCOVERY CLASS (ID: 2)   -->  EXPLORERS (ID: 3)         -->  PREPARATORY (ID: 4)
EXPLORERS (ID: 3)         -->  PREPARATORY (ID: 4)       -->  YEAR 1 (ID: 5)
PREPARATORY (ID: 4)       -->  YEAR 1 (ID: 5)            -->  YEAR 2 (ID: 6)
YEAR 1 (ID: 5)            -->  YEAR 2 (ID: 6)            -->  YEAR 3 (ID: 7)
YEAR 2 (ID: 6)            -->  YEAR 3 (ID: 7)            -->  YEAR 4 (ID: 8)
YEAR 3 (ID: 7)            -->  YEAR 4 (ID: 8)            -->  YEAR 5 (ID: 9)
YEAR 4 (ID: 8)            -->  YEAR 5 (ID: 9)            -->  YEAR 6 (ID: 10)
YEAR 5 (ID: 9)            -->  YEAR 6 (ID: 10)           -->  YEAR 7 (ID: 11)
YEAR 6 (ID: 10)           -->  YEAR 7 (ID: 11)           -->  YEAR 8 (ID: 12)
YEAR 7 (ID: 11)           -->  YEAR 8 (ID: 12)           -->  YEAR 9 (ID: 13)
```

### Critical Rules for Operations & Prompts:
1. **Never overwrite past enrollments**: When promoting a student to Year 8 for session `2026/2027` (`sessionId: 2`), the enrollment record for Year 7 in `2025/2026` (`sessionId: 1`) must remain intact.
2. **Subject & Term Results Linkage**:
   - `SubjectResult` and `TermResult` records for `sessionId: 1` (`2025/2026`) must have `classId: 11` (Year 7).
   - If queried for `2025/2026` with `classId: 12` (Year 8), the system returns `CLASS_MISMATCH` because the student was not in Year 8 in that session.
3. **Multi-Session Student History**:
   - The student portal (`/student-results`) resolves historical results by querying available sessions and populating the terms for each session dynamically.
