# Comparison Example - Simple Visual

## Your Reports Timeline

```
Jan 1        Feb 1        Mar 1        Apr 1
  |            |            |            |
  A            B            C            D
(CBC)        (CBC)        (CBC)        (CBC)
```

## Comparisons

### Compare Report D (April):
```
D (Apr 1) ←→ C (Mar 1)
   ↑            ↑
Current      Latest Previous
```
**Shows:** Changes from March to April

---

### Compare Report C (March):
```
C (Mar 1) ←→ B (Feb 1)
   ↑            ↑
Current      Latest Previous
```
**Shows:** Changes from February to March

---

### Compare Report B (February):
```
B (Feb 1) ←→ A (Jan 1)
   ↑            ↑
Current      Latest Previous
```
**Shows:** Changes from January to February

---

### Compare Report A (January):
```
A (Jan 1) ←→ ❌ None
   ↑
Current
```
**Shows:** "No previous report found"

---

## With Multiple Report Types

```
Timeline:
Jan 1    Jan 15    Feb 1    Feb 15    Mar 1
  |        |         |         |         |
CBC-A   Sugar-1   CBC-B   Sugar-2    CBC-C
```

### Compare CBC-C (March):
```
CBC-C (Mar 1) ←→ CBC-B (Feb 1)
                 ↑
              Latest CBC before March
              (Ignores Sugar reports)
```

### Compare Sugar-2 (Feb 15):
```
Sugar-2 (Feb 15) ←→ Sugar-1 (Jan 15)
                     ↑
                  Latest Sugar before Feb 15
                  (Ignores CBC reports)
```

---

## Key Point

✅ **Always compares with the IMMEDIATELY PREVIOUS report**
- Same type only (CBC with CBC, Sugar with Sugar)
- Based on date
- Most recent one before current

❌ **Never skips reports**
- If you have Jan, Feb, Mar
- March compares with Feb (not Jan)
- Feb compares with Jan
