import path from 'path'

import slash from 'slash'

const getActiveDir = slash(path.dirname(require.main!.filename))

export default getActiveDir