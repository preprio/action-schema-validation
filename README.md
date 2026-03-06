# Prepr Schema Validation Workflow

GitHub workflow that validates JSON files in `/prepr/schema` against the Prepr schema spec.

## Install in your repository

Create `.github/workflows/prepr-schema-validation.yml` in your repository:

```yaml
name: Validate Prepr schema

on:
  pull_request:
    paths:
      - 'prepr/schema/**/*.json'
  push:
    branches:
      - main
    paths:
      - 'prepr/schema/**/*.json'

jobs:
  validate-prepr-schema:
    uses: prepr/workflow_schema_validation/.github/workflows/prepr-schema-validation.yml@main
```

## What happens

- Every JSON file under `/prepr/schema` is validated.
- Validation errors are listed per file.
- Any validation error fails the GitHub job.
- Missing `/prepr/schema` fails the job with a clear error.
- Empty `/prepr/schema` (no `.json` files) fails the job with a clear error.

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
      - 'prepr/schema/**/*.json'

jobs:
  validate:
    uses: prepr/workflow_schema_validation/.github/workflows/prepr-schema-validation.yml@main

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
