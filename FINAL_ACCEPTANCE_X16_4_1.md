# DeutschWeg X16.4.1 — Final Acceptance Record

Current source baseline: **X16.4.0 Professional Experience Hardening Final Candidate**.

The release must remain `final-candidate` until every mandatory item below has objective evidence. Browser-local manual PASS values alone are not sufficient without device and reviewer notes.

## Automated gates

- [ ] GitHub Actions `DeutschWeg X16 Final Acceptance` passes on the exact release commit.
- [ ] GitHub Pages serves the same `version.json` and `SHA256SUMS.txt` as the release commit.
- [ ] Manifest, icons, Service Worker, offline fallback and repository-relative paths pass.
- [ ] Data migration and Backup/Restore retain the existing localStorage and IndexedDB identifiers.

## Android acceptance

Record device, Android version, browser version and date.

- [ ] German TTS natural and slow playback are audible.
- [ ] Microphone permission grant, denial and retry paths are understandable.
- [ ] MediaRecorder creates a playable recording.
- [ ] German Speech Recognition returns usable text or a clear supported fallback.
- [ ] PWA installs and launches in standalone mode.
- [ ] Offline reload works after one complete online load.
- [ ] Progress survives close/reopen and offline use.

Evidence:

```text
Device:
OS:
Browser:
Tester:
Date:
Notes:
```

## iPhone acceptance

Record device, iOS version, Safari version and date.

- [ ] German TTS playback is audible.
- [ ] Microphone permission and recording work.
- [ ] Unsupported Speech Recognition behavior is communicated accurately.
- [ ] Add to Home Screen produces a usable standalone experience.
- [ ] Offline reload and data persistence work.

Evidence:

```text
Device:
iOS:
Safari:
Tester:
Date:
Notes:
```

## Beginner usability acceptance

Two independent A1/A2 learners must complete one session without external instruction.

- [ ] Learner 1 finds and starts today's lesson.
- [ ] Learner 1 understands listening, speaking and error feedback.
- [ ] Learner 2 finds and starts today's lesson.
- [ ] Learner 2 understands listening, speaking and error feedback.
- [ ] No Critical or High usability defect remains open.

## Human language review

- [ ] A1 sample reviewed.
- [ ] A2 sample reviewed.
- [ ] B1 sample reviewed.
- [ ] B2 sample reviewed.
- [ ] C1 sample reviewed.
- [ ] C2 sample reviewed.
- [ ] Register, grammar, translation, article/plural and CEFR difficulty findings are resolved.

## Final promotion rule

Only after every mandatory item is checked and evidenced:

1. Set `version.json` to `16.4.1` and channel to `stable`.
2. Change the Service Worker cache to `deutschweg-x16-4-1-final-stable`.
3. Update visible version labels and release notes.
4. Regenerate `SHA256SUMS.txt`.
5. Run the final GitHub Actions gate on the exact commit.
6. Create the final release tag only after the published Pages origin is rechecked.
