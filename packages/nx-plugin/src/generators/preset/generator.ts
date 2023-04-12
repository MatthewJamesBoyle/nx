import {
  Tree,
  updateJson,
  updateNxJson,
  readNxJson,
  formatFiles,
  runTasksInSerial,
  GeneratorCallback,
} from '@nrwl/devkit';
import { Linter } from '@nrwl/linter';
import { PackageJson } from 'nx/src/utils/package-json';
import { pluginGenerator } from '../plugin/plugin';
import { PresetGeneratorSchema } from './schema';
import createPackageGenerator from '../create-package/create-package';

export default async function (tree: Tree, options: PresetGeneratorSchema) {
  const tasks: GeneratorCallback[] = [];
  const pluginTask = await pluginGenerator(tree, {
    compiler: 'tsc',
    linter: Linter.EsLint,
    name: options.pluginName.includes('/')
      ? options.pluginName.split('/')[1]
      : options.pluginName,
    skipFormat: true,
    skipLintChecks: false,
    skipTsConfig: false,
    unitTestRunner: 'jest',
    importPath: options.pluginName,
    rootProject: true,
  });
  tasks.push(pluginTask);

  removeNpmScope(tree);
  moveNxPluginToDevDeps(tree);

  if (options.createPackageName) {
    const cliTask = await createPackageGenerator(tree, {
      name: options.createPackageName,
      project: options.pluginName,
      skipFormat: true,
      skipTsConfig: false,
      unitTestRunner: 'jest',
      linter: Linter.EsLint,
      setParserOptionsProject: false,
      compiler: 'tsc',
      rootProject: true,
    });
    tasks.push(cliTask);
  }

  await formatFiles(tree);

  return runTasksInSerial(...tasks);
}

function removeNpmScope(tree: Tree) {
  updateNxJson(tree, { ...readNxJson(tree), npmScope: undefined });
}

function moveNxPluginToDevDeps(tree: Tree) {
  updateJson<PackageJson>(tree, 'package.json', (json) => {
    const nxPluginEntry = json.dependencies['@nrwl/nx-plugin'];
    delete json.dependencies['@nrwl/nx-plugin'];
    json.devDependencies['@nrwl/nx-plugin'] = nxPluginEntry;
    return json;
  });
}
