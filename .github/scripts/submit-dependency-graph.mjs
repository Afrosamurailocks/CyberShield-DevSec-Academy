#!/usr/bin/env node
/**
 * Submete o dependency graph (manifesto npm) a partir da branch `development`
 * para a Dependency Submission API do GitHub, usando a biblioteca oficial
 * @github/dependency-submission-toolkit.
 *
 * Motivo de existir: o branch padrao deste repositorio (`main`) fica vazio
 * de proposito (o codigo vive em `development`), e o Dependabot/"dependency
 * graph" nativo do GitHub so le manifestos do branch padrao. Este script
 * roda via GitHub Actions a cada push em `development` e envia o grafo real.
 *
 * Fonte dos dados: `npm ls --all --json` (arvore de dependencias resolvida
 * pelo proprio npm a partir do package-lock.json).
 */
import { execSync } from 'node:child_process';
import {
  Manifest,
  PackageCache,
  Snapshot,
  submitSnapshot,
} from '@github/dependency-submission-toolkit';

function purlFor(name, version) {
  const m = name.match(/^(@[^/]+)\/(.+)$/);
  const namespace = m ? encodeURIComponent(m[1]) : null;
  const pkgName = m ? m[2] : name;
  return `pkg:npm/${namespace ? namespace + '/' : ''}${pkgName}@${version}`;
}

function npmLsTree(cwd) {
  // npm ls sai com codigo != 0 quando ha "problems" (ex.: peer deps
  // conflitantes ou extraneous packages), mas ainda assim imprime um JSON
  // valido em stdout — por isso capturamos stdout mesmo em caso de erro.
  let raw;
  try {
    raw = execSync('npm ls --all --json --omit=optional', {
      cwd,
      maxBuffer: 1024 * 1024 * 128,
    }).toString();
  } catch (err) {
    raw = err.stdout ? err.stdout.toString() : '{}';
  }
  return JSON.parse(raw);
}

function buildManifest(cwd, manifestName, manifestPath) {
  const tree = npmLsTree(cwd);
  const cache = new PackageCache();
  const manifest = new Manifest(manifestName, manifestPath);
  const visitedEdges = new Set();

  function walk(depsObj, parentPkg, isRoot) {
    if (!depsObj) return;
    for (const [name, info] of Object.entries(depsObj)) {
      if (!info || !info.version) continue; // dependencia nao resolvida/ausente
      const pkg = cache.package(purlFor(name, info.version));
      const scope = info.dev ? 'development' : 'runtime';

      if (isRoot) {
        if (!manifest.hasDependency(pkg)) manifest.addDirectDependency(pkg, scope);
      } else {
        parentPkg.dependsOn(pkg);
        manifest.addIndirectDependency(pkg, scope);
      }

      const edgeKey = `${parentPkg ? parentPkg.packageID() : 'root'}->${pkg.packageID()}`;
      if (!visitedEdges.has(edgeKey)) {
        visitedEdges.add(edgeKey);
        walk(info.dependencies, pkg, false);
      }
    }
  }

  walk(tree.dependencies, null, true);
  return manifest;
}

const manifest = buildManifest(process.cwd(), 'package.json', 'package.json');

const snapshot = new Snapshot({
  name: 'npm-ls-submission (CyberShield DevSec Academy)',
  url: 'https://github.com/Cyber-Opah/CyberShield-DevSec-Academy/blob/development/.github/scripts/submit-dependency-graph.mjs',
  version: '1.0.0',
});
snapshot.addManifest(manifest);

if (process.env.GITHUB_ACTIONS === 'true') {
  await submitSnapshot(snapshot);
} else {
  console.log(`[dry-run local] manifest "${manifest.name}": ${manifest.countDependencies()} dependencias resolvidas.`);
  console.log(snapshot.prettyJSON().slice(0, 500) + ' ...(truncado)');
}
