# Release instructions

When preparing a release:

1. For a non-breaking change, increment the patch version (`v1.0.17` → `v1.0.18`). Use the latest release version and README references to determine the next version; the private `package.json` version is not the workflow release version.
2. Update every versioned workflow example in `README.md` to the new version.
3. Prepend an entry to `CHANGELOG.md`, preserving the existing format. Keep the schema date, set the revision number to the release patch version (`v1.0.18` → revision #18), use the release date, and add a short bullet describing the changes. Only describe the release as non-breaking if it is compatible with previously valid schemas.

   ```markdown
   ## 2026-03-05 revision #18

   This is a non-breaking revision of the existing `2026-03-05` schema version. Released on 15 October 2026.

   - Short summary of the changes.
   ```

   The revision number and release date above are examples; derive them for each release.

4. Output a Conventional Commits message describing the changes, such as `feat(schema): validate optional enum value restrictions` or `fix(schema): correct field validation`.
