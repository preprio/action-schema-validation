# Prepr Schema Validation

GitHub Actions workflow that validates JSON files in `/prepr/schema` against the Prepr schema spec.

## Why use this GitHub Action

- Validate schema changes early in pull requests and before merges.
- Enforce consistent schema quality with one workflow across repositories.
- Get file-level error output that is easy to review and fix.
- Prevent invalid schema updates from reaching `main`.

## Install in your repository

Create `.github/workflows/prepr-schema-validation.yml` in your repository:

```yaml
name: Validate Prepr schema

on:
  workflow_dispatch:
  pull_request:
    paths:
      - 'prepr/schema/*.json'
  push:
    branches:
      - main
    paths:
      - 'prepr/schema/*.json'

jobs:
  validate-prepr-schema:
    uses: preprio/action-schema-validation/.github/workflows/prepr-schema-validation.yml@v1
```

## Scope of this workflow

- Every JSON file under `/prepr/schema` is validated.
- Validation errors are listed per file.
- Any validation error fails the job.
- Missing `/prepr/schema` fails the job.
- Empty `/prepr/schema` (no `.json` files) fails the job.
- GraphQL typenames must be unique across `Model`, `Enum`, `RemoteSource`, and `Component` files:
  - `Model`: `body_singular`, `body_plural`
  - `Enum`: `body_singular`
  - `RemoteSource`: `body_singular`
  - `Component`: `api_id`

## Workflow outputs

This workflow exposes outputs for downstream jobs:

- `validation_result` (`success` or `failure`)
- `files_checked`
- `invalid_files`
- `report_json` (JSON string with file-level errors)

Example forwarding to Slack (or any notifier):

```yaml
name: Validate and notify

on:
  pull_request:
    paths:
      - 'prepr/schema/*.json'

jobs:
  validate:
    uses: preprio/action-schema-validation/.github/workflows/prepr-schema-validation.yml@v1

  notify:
    runs-on: ubuntu-latest
    needs: validate
    if: always()
    steps:
      - name: Print report
        run: |
          echo "result=${{ needs.validate.outputs.validation_result }}"
          echo "files=${{ needs.validate.outputs.files_checked }}"
          echo "invalid=${{ needs.validate.outputs.invalid_files }}"
          echo '${{ needs.validate.outputs.report_json }}'
```

## Support

Questions or issues: use [GitHub Issues](../../issues)

## Versioning

Use a version tag when referencing the workflow (`@v1`, `@v1.x.y`), not a branch name.
