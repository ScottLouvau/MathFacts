# Testcases

- [x] Page loads without errors; problem is not 0+0.
  - [x] Focus on answer box immediately.
  - [x] Popup keyboard is a number keyboard, if supported (GBoard)
- [x] Solve a Problem
  - [x] Does bar draw longer?
  - [x] Correct problem sound?
  - [x] Green checkmark animation?
- [x] Get a Problem wrong (write down what problem)
  - [x] No sound/bar/animation
- [x] Take over six seconds for a problem (write down what problem)
- [x] Solve ten problems correctly.
- [x] Click each toolbar icon
  - [x] Do modals show?
  - [x] Is rendering ok? (Good width, font size ok, no text over edges)
  - [x] Does clicking anywhere outside close the modal?
  - [ ] Does clicking the close X work?
- [x] Speed/Accuracy
  - [x] Confirm values shown for problems answered.
  - [x] Confirm colors correct for time/accuracy ranges.
- [x] Settings
  - [x] When changing sounds, do you hear them immediately?
  - [ ] When operation changes, is a new problem picked?
  - [ ] When goal changes, is goal bar redrawn?
  - [ ] Turn Volume to 0 and confirm respected. Change back.
  - [ ] Select 'None' and confirm no sound played, no errors.
- [ ] Share
  - [ ] Click mail icon; confirm email comes up with text populated.
  - [ ] Click clipboard; confirm text on clipboard and popup notification shown.
  - [ ] Click clipboard; confirm popup re-shows and re-hides.
- [ ] Click operation and confirm toggles through +, -, x, /.
- [ ] Check LocalStorage
  - [ ] Settings, including changes.
  - [ ] Today with problems to do (and redo).
- [ ] Reload page with Network Tools open
  - [ ] Confirm only selected sounds loaded (and nothing for 'None')
  - [ ] Confirm sounds are loaded asynchronously.
  - [ ] Does bar redraw for problem count previously done?
  - [ ] Do problems to goal. Were slow and incorrect problems re-given just before goal reached?



- [ ] Browser Resize
  - [ ] Confirm top bar resizes for space with reasonable minimum.
  - [ ] Confirm top bar icons big enough to touch on Mobile Phones.
  - [ ] Confirm problem stays centered under top bar
  - [ ] Confirm problem is big but never overflows available space.
  - [ ] Click each toolbar icon; confirm popups are big enough but don't overflow screen.



- [ ] In LocalStorage, change "today" entry date back.
  - [ ] Reload, confirm moved to history, fresh "today" started.

- [ ] Delete all LocalStorage

  - [ ] Confirm Page loads; bar empty; setting defaults reasonable.

  - [ ] Get a Problem Wrong; confirm "redo" populated, no error.

    

### Environments

- [ ] Chrome / Windows
- [ ] Edge / Windows
- [X] Edge / MacOS
- [X] Safari / MacOS
- [X] Firefox / MacOS
- [ ] Chrome / Android
- [ ] Edge / Android
- [ ] Safari / iOS
- [ ] Edge / iOS