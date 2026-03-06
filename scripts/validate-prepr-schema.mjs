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

function collectRootGraphqlNames(relativeFile, payload) {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const label = payload.label;
  const rootsByLabel = {
    Model: ['body_singular', 'body_plural'],
    Enum: ['body_singular'],
    RemoteSource: ['body_singular'],
    Component: ['api_id']
  };
  const properties = rootsByLabel[label] || [];
  const names = [];

  for (const property of properties) {
    const value = payload[property];
    if (typeof value === 'string' && value.trim() !== '') {
      names.push({
        file: relativeFile,
        label,
        property,
        value
      });
    }
  }

  return names;
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

  const errorsByFile = new Map();
  const fileOrder = [];
  const rootNameEntries = [];
  const report = {
    targetPath,
    filesChecked: files.length,
    invalidFiles: [],
    isValid: true
  };

  function addFileError(file, message) {
    if (!errorsByFile.has(file)) {
      errorsByFile.set(file, []);
      fileOrder.push(file);
    }
    errorsByFile.get(file).push(message);
  }

  for (const file of files) {
    const relativeFile = path.relative(process.cwd(), file);

    let payload;
    try {
      const text = await fs.readFile(file, 'utf8');
      payload = JSON.parse(text);
    } catch (error) {
      addFileError(relativeFile, `Invalid JSON: ${error.message}`);
      continue;
    }

    rootNameEntries.push(...collectRootGraphqlNames(relativeFile, payload));

    const valid = validate(payload);
    if (!valid) {
      for (const error of validate.errors || []) {
        const message = formatAjvError(error);
        addFileError(relativeFile, message);
      }
    }
  }

  const nameUsage = new Map();
  for (const entry of rootNameEntries) {
    const items = nameUsage.get(entry.value) || [];
    items.push(entry);
    nameUsage.set(entry.value, items);
  }

  for (const [name, entries] of nameUsage.entries()) {
    if (entries.length < 2) {
      continue;
    }

    for (const entry of entries) {
      const conflicts = entries
        .filter((other) => !(other.file === entry.file && other.property === entry.property && other.label === entry.label))
        .map((other) => `${other.file} (${other.label}.${other.property})`);
      if (conflicts.length === 0) {
        continue;
      }
      addFileError(
        entry.file,
        `GraphQL root name conflict for "${name}": also used in ${conflicts.join(', ')}`
      );
    }
  }

  for (const file of fileOrder) {
    console.error(`\n${file}`);
    for (const message of errorsByFile.get(file) || []) {
      console.error(`  - ${message}`);
    }
    console.error('');
  }

  report.invalidFiles = fileOrder.map((file) => ({
    file,
    errors: errorsByFile.get(file) || []
  }));

  const invalidCount = report.invalidFiles.length;
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
