# Changelog

## 2026-03-05 revision #20

This is a non-breaking revision of the existing `2026-03-05` schema version. Released on 15 October 2026.

- Updated the transitive `fast-uri` dependency from `3.1.7` to `3.1.8` to fix CVE-2026-86472.

## 2026-03-05 revision #19

This is a non-breaking revision of the existing `2026-03-05` schema version. Released on 15 October 2026.

- Restored the validator script required by the GitHub Actions workflow, corrected the npm validation command, and added schema regression tests.

## 2026-03-05 revision #18

This is a revision of the existing `2026-03-05` schema version. Released on 15 October 2026.

- Added optional nullable string-array validation for Enum field `allowed_values` and `disallowed_values`, and documented release instructions in `AGENTS.md`.
- Changelog revision numbers now match the release patch version (`v1.0.18` → revision #18).

## 2026-03-05 revision #15

This is a revision of the existing `2026-03-05` schema version. Released on 15 October 2026.

- Added optional nullable string validation for field AI metadata and Color `default_value`, optional boolean `filterable`, and optional boolean `types[].restrict_to_user_access` for ContentReference and Stack.

## 2026-03-05 revision #14

This is a non-breaking revision of the existing `2026-03-05` schema version. Released on 14 October 2026.

- Added optional boolean word counters for Text and ElementBox, optional ContentIntegration list/grid appearance, and ElementBox support for `text-color` and `highlight-color` formatting.

## 2026-03-05 revision #13

This is a non-breaking revision of the existing `2026-03-05` schema version. Released on 29 September 2026.

- Accept numeric `0` and `1` values for `live_preview` and `ai translate`.

## 2026-03-05 revision #12

This is a non-breaking revision of the existing `2026-03-05` schema version. Released on 4 September 2026.

- Added Text HTML editor support for `text-color` and `highlight-color` formatting.

## 2026-03-05 revision #11

This is a non-breaking revision of the existing `2026-03-05` schema version. Released on 10 August 2026.

- Added optional `allowed_environments` support to type references.


## 2026-03-05 revision #10

This is a non-breaking revision of the existing `2026-03-05` schema version. Released on 24 July 2026.

- Added Text HTML editor support for `subscript` and `superscript` formatting.


## 2026-03-05 revision #9

This is a non-breaking revision of the existing `2026-03-05` schema version. Released on 23 July 2026.

- Removed deprecated `Embed` field type validation.


## 2026-03-05 revision #8

This is a non-breaking revision of the existing `2026-03-05` schema version. Released on 11 June 2026.

- Added `JotformEmbed` as a supported field type and ElementBox accept value.


## 2026-03-05 revision #7

This is a non-breaking revision of the existing `2026-03-05` schema version. Released on 10 June 2026.

- Added `HubSpotEmbed`, `TypeformEmbed`, `PipedriveEmbed`, and `ActiveCampaignEmbed` as supported field types for appearance conditions.


## 2026-03-05 revision #6

This is a non-breaking revision of the existing `2026-03-05` schema version. Released on 5 June 2026.

- Added ElementBox support for `subscript` and `superscript` formatting.


## 2026-03-05 revision #5

This is a non-breaking revision of the existing `2026-03-05` schema version. Released on 5 June 2026.

- Relaxed validation for exports by accepting numeric-string text limits, nullable remote source domains, optional live preview flags
- Deprecated ElementBox accept values added
- Environment ID value-based appearance conditions allowed.


## 2026-03-05 revision #4

This is a non-breaking revision of the existing `2026-03-05` schema version. Released on 20 May 2026.

### Added

- Added the following supported field types for appearance conditions:
  - `Environments`
  - `BusinessHours`


## 2026-03-05 revision #3

This is a non-breaking revision of the existing `2026-03-05` schema version. Released on 20 May 2026.

### Added

- Added `Stack` as a supported field type for appearance conditions.

## 2026-03-05 revision #2

This is a non-breaking revision of the existing `2026-03-05` schema version. Released on 19 May 2026.

### Added

- Added optional AI metadata fields to content model and component schema definitions:
  - `ai_context`
  - `ai_goal`
  - `ai_usage_rules`
  - `ai_examples`


## 2026-03-10 revision #1

### Added
Two new field definitions, `appearance_width` and `appearance_start_new_row` to fields.
