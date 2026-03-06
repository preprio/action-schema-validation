import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import JSON5 from 'json5';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

function getArg(flag, fallback = undefined) {
  const index = process.argv.indexOf(flag);
  if (index === -1 || index + 1 >= process.argv.length) {
    return fallback;
  }
  return process.argv[index + 1];
}

async function listJsonFiles(directory) {
  const result = [];

  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        result.push(fullPath);
      }
    }
  }

  await walk(directory);
  return result.sort((a, b) => a.localeCompare(b));
}

function formatAjvError(error) {
  if (!error) {
    return 'Unknown validation error';
  }

  if (error.keyword === 'required' && error.params?.missingProperty) {
    return `${error.instancePath || '/'} missing required property \"${error.params.missingProperty}\"`;
  }

  if (error.keyword === 'additionalProperties' && error.params?.additionalProperty) {
    return `${error.instancePath || '/'} has unknown property \"${error.params.additionalProperty}\"`;
  }

  return `${error.instancePath || '/'} ${error.message || 'is invalid'}`;
}

async function main() {
  const schemaPath = getArg('--schema');
  const targetPath = getArg('--target', 'prepr/schema');
  const reportFile = getArg('--report-file');
  async function writeReportAndExit(code, message, extra = {}) {
    if (reportFile) {
      const report = {
        targetPath,
        filesChecked: 0,
        invalidFiles: [{ file: targetPath, errors: [message] }],
        isValid: false,
        ...extra
      };
      await fs.writeFile(reportFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    }
    console.error(message);
    process.exit(code);
  }

  if (!schemaPath) {
    await writeReportAndExit(2, 'Missing required argument: --schema <path-to-schema-file>');
  }

  let schemaText;
  try {
    schemaText = await fs.readFile(schemaPath, 'utf8');
  } catch (error) {
    await writeReportAndExit(2, `Unable to read schema file at ${schemaPath}: ${error.message}`);
  }

  let schema;
  try {
    schema = JSON5.parse(schemaText);
  } catch (error) {
    await writeReportAndExit(2, `Schema file is not valid JSON5: ${error.message}`);
  }

  try {
    const stat = await fs.stat(targetPath);
    if (!stat.isDirectory()) {
      await writeReportAndExit(2, `Repository path exists but is not a directory: ${targetPath}`);
    }
  } catch {
    await writeReportAndExit(2, `Repository is missing required schema directory: ${targetPath}`);
  }

  const files = await listJsonFiles(targetPath);

  if (files.length === 0) {
    await writeReportAndExit(1, `Repository contains no JSON schema files under ${targetPath}`);
  }

  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  let invalidCount = 0;
  const report = {
    targetPath,
    filesChecked: files.length,
    invalidFiles: [],
    isValid: true
  };

  for (const file of files) {
    const relativeFile = path.relative(process.cwd(), file);

    let payload;
    try {
      const text = await fs.readFile(file, 'utf8');
      payload = JSON.parse(text);
    } catch (error) {
      invalidCount += 1;
      report.invalidFiles.push({
        file: relativeFile,
        errors: [`Invalid JSON: ${error.message}`]
      });
      console.error(`\n${relativeFile}`);
      console.error(`  - Invalid JSON: ${error.message}`);
      continue;
    }

    const valid = validate(payload);
    if (!valid) {
      invalidCount += 1;
      console.error(`\n${relativeFile}`);
      const fileErrors = [];
      for (const error of validate.errors || []) {
        const message = formatAjvError(error);
        fileErrors.push(message);
        console.error(`  - ${message}`);
      }
      report.invalidFiles.push({
        file: relativeFile,
        errors: fileErrors
      });
    }
  }

  report.isValid = invalidCount === 0;
  if (reportFile) {
    await fs.writeFile(reportFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }

  if (invalidCount > 0) {
    console.error(`\nValidation failed for ${invalidCount} file(s).`);
    process.exit(1);
  }

  console.log(`Validated ${files.length} file(s) successfully.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
