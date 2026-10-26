import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('deployment lockfile contains complete registry package versions',()=>{
  const lock=JSON.parse(readFileSync(new URL('../package-lock.json',import.meta.url),'utf8'));
  const manifest=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
  assert.deepEqual(lock.packages[''].dependencies,manifest.dependencies);
  assert.deepEqual(lock.packages[''].devDependencies,manifest.devDependencies);
  for(const [path,entry] of Object.entries(lock.packages)){
    assert.match(entry.version||'',/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/,`${path||'root'} needs a valid version`);
    if(path && !entry.inBundle){assert.match(entry.resolved||'',/^https:\/\/registry\.npmjs\.org\//,`${path} must resolve from npm`);assert.ok(entry.integrity,`${path} needs integrity metadata`);}
  }
});

