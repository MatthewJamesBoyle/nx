import type { Tree } from '@nrwl/devkit';
import { normalizeNameAndPaths } from '../../utils/path';
import type { NormalizedSchema, Schema } from '../schema';

export function normalizeOptions(
  tree: Tree,
  options: Schema
): NormalizedSchema {
  const { directory, fileName, filePath, name, path } = normalizeNameAndPaths(
    tree,
    {
      ...options,
      type: 'directive',
    }
  );

  return {
    ...options,
    export: options.export ?? true,
    flat: options.flat ?? true,
    inlineScam: options.inlineScam ?? true,
    directory,
    fileName,
    filePath,
    path,
    name,
  };
}
