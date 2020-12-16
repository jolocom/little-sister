import { getStorybookUI, configure } from '@storybook/react-native'

configure(() => {
  require('./stories')
}, module)

export const StorybookUIRoot = getStorybookUI({})
