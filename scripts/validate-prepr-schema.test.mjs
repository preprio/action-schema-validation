import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import JSON5 from 'json5';

const schema = JSON5.parse(fs.readFileSync(new URL('../spec/2026-03-05.json5', import.meta.url), 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addSchema(schema);
const validateField = ajv.getSchema(`${schema.$id}#/definitions/Field`);
const validateReference = ajv.getSchema(`${schema.$id}#/definitions/TypeReference`);

test('AI properties and Color default_value are optional nullable strings', () => {
  assert.equal(validateField({ type: 'Color' }), true);
  for (const property of ['ai_purpose', 'ai_use_when', 'ai_avoid_when', 'ai_expected_content', 'ai_examples', 'default_value']) {
    for (const value of [null, '', 'example']) {
      assert.equal(validateField({ type: 'Color', [property]: value }), true, property);
    }
    for (const value of [0, false, [], {}]) {
      assert.equal(validateField({ type: 'Color', [property]: value }), false, property);
    }
  }
});

test('filterable is an optional boolean', () => {
  assert.equal(validateField({ type: 'Color' }), true);
  for (const value of [true, false, null, 0, 'true', [], {}]) {
    assert.equal(validateField({ type: 'Color', filterable: value }), typeof value === 'boolean');
  }
});

test('restrict_to_user_access is an optional boolean on type references', () => {
  const reference = { ref: 'example', label: 'Model', position: 1, body_singular: 'Example' };
  assert.equal(validateReference(reference), true);
  for (const value of [true, false, null, 0, 'false', [], {}]) {
    assert.equal(validateReference({ ...reference, restrict_to_user_access: value }), typeof value === 'boolean');
  }
});
