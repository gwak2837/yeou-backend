import esbuild from 'esbuild'

const NODE_ENV = process.env.NODE_ENV

esbuild
  .build({
    bundle: true,
    entryPoints: ['src/index.ts'],
    loader: {
      '.sql': 'text',
    },
    metafile: true,
    minify: NODE_ENV === 'production',
    outfile: 'out/index.cjs',
    platform: 'node',
    target: ['node18'],
    treeShaking: true,
    watch: NODE_ENV === 'development' && {
      onRebuild: (error, result) => {
        if (error) {
          console.error('watch build failed:', error)
        } else {
          showOutfilesSize(result)
        }
      },
    },
  })
  .then((result) => showOutfilesSize(result))
  .catch((error) => {
    throw new Error(error)
  })

function showOutfilesSize(result) {
  const outputs = result.metafile.outputs
  for (const output in outputs) {
    console.log(`${output}: ${(outputs[output].bytes / 1_000_000).toFixed(2)} MB`)
  }
}
