# DSF Compiler Review - Issues and Improvements

## Critical Issues Found

### 1. **SECTION ORDER MISMATCH**
**Problem:** Our generator uses the wrong section order compared to working DSF files.

**Current Order (WRONG):**
```
/CTL → /VOC → /STX → /MTX → /OTX → /LTX → /CON → /OBJ → /PRO → /END
```

**Correct Order (from working test_minimal.dsf):**
```
/CTL → /VOC → /STX → /LTX → /CON → /MTX → /OBJ → /OTX → /PRO → /END
```

**Impact:** HIGH - DRF compiler may reject files with incorrect section order.

**Location:** `src-tauri/src/codegen.rs:16-60`

---

### 2. **Missing Section Spacing**
**Problem:** Working DSF files have specific blank line patterns between sections.

**Working format:**
```
/VOC

NORTH        0       verb
N            0       verb

/STX
```

**Our format:** May have inconsistent spacing.

**Impact:** MEDIUM - Could cause parser issues.

---

### 3. **Vocabulary Format Issues**

**Working format:**
```
NORTH        0       verb
N            0       verb
RULER        0       noun
```

**Potential issues:**
- Spacing needs to be exact (12 chars for word, 3 for ID)
- Words MUST be truncated to 5 characters
- Multiple words can share the same ID (synonyms)

**Location:** `src-tauri/src/codegen.rs:579-612`

---

### 4. **Location Text Format**

**Working format:**
```
/LTX

/0 "Test Room^^You are in a test room. You can go NORTH."
/1 "North Room^^You are in the north room."
```

**Issues to check:**
- Are we using `^^` for newlines correctly?
- Are location names being included before descriptions?
- Is the format `/ID "text"` exact?

---

### 5. **Connections Format**

**Working format:**
```
/CON

/0
N  1

/1
S  0
```

**Issues:**
- Each location starts with `/LOCID` on its own line
- Connections are: `DIRECTION  TARGET_ID`
- Empty lines between location blocks

**Location:** `src-tauri/src/codegen.rs:371-391`

---

### 6. **Messages Section Order**

**Problem:** Messages (/MTX) should come AFTER locations and connections, not before.

**Current:** Before /LTX
**Correct:** After /CON

---

### 7. **Object Sections**

The test_minimal.dsf doesn't have /OBJ or /OTX sections at all!

**Questions:**
- Are these optional?
- Should they only be included if objects exist?
- What's the exact format required?

---

### 8. **Process Tables**

**Working minimal format:**
```
/PRO 0 ; Process Table 0

/PRO 1 ; Process Table 1

/PRO 2 ; Process Table 2

/PRO 3 ; Process Table 3 (first turn)

> _ _
GOTO 0
DONE
```

**Issues to check:**
- Are we generating proper process separators?
- Is the `> _ _` format correct?
- Are condacts properly formatted?

---

## Recommended Fixes (Priority Order)

### Priority 1: Fix Section Order
```rust
// Correct order in generate():
1. /CTL
2. /VOC
3. /STX
4. /LTX    // MOVED UP
5. /CON    // MOVED UP
6. /MTX    // MOVED DOWN
7. /OBJ    // Check if optional
8. /OTX    // Check if optional
9. /PRO
10. /END
```

### Priority 2: Add Section Validation
- Verify no empty required sections
- Check vocabulary IDs are consecutive starting from 0
- Validate location/object numbering

### Priority 3: Format Fixes
- Ensure consistent blank lines
- Verify column alignment in /VOC
- Test with/without objects

### Priority 4: Add Debug Output
- Log generated DSF to file for manual inspection
- Compare byte-for-byte with working examples
- Add verbose mode showing each section

---

## Testing Strategy

1. **Start with minimal game:**
   - 2 locations
   - 2 verbs (N, S)
   - 0 objects
   - Minimal process tables

2. **Compare output:**
   - Generate DSF
   - Compare with test_minimal.dsf
   - Run through DRF manually

3. **Gradually add complexity:**
   - Add objects
   - Add more vocabulary
   - Add custom messages

4. **Test each platform:**
   - PC
   - Spectrum
   - C64

---

## Files to Review/Modify

1. `src-tauri/src/codegen.rs` - Main DSF generator
2. `src-tauri/src/commands.rs` - DRF integration
3. Test files in `/d/daadah/*.dsf` - Reference examples

---

## DRF Error Handling Improvements

**Added in latest build:**
- Show stdout AND stderr from DRF
- Show exact command run
- Show working directory
- Show exit code

**Next steps:**
- Capture and parse DRF error messages
- Map to specific DSF issues
- Provide helpful fix suggestions
