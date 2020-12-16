import { expect } from 'detox'

export const getNativeType = (typeName: string) =>
  // NOTE: we can only access 'device' after detox.init

  // type names are platform dependent based on:
  // https://github.com/wix/Detox/blob/master/docs/APIRef.Matchers.md#bytypenativeviewtype
  device.getPlatform() == 'android'
    ? `android.widget.${typeName}View`
    : `RCT${typeName}View`

export const getDetoxConfig = async () => {
  const detoxConfig = require('../package.json').detox
  const ADB = require('detox/src/devices/android/ADB')
  const adb = new ADB()
  const configs = detoxConfig.configurations

  // TODO figure out iOS configs
  const newConfigs = (detoxConfig.configurations = {
    'ios.sim.debug': configs['ios.sim.debug'],
  })

  // detox device configurations are generated dynamically here after querying
  // ADB for android devices and emulator, instead of hardcoding in package.json

  try {
    const devices = await adb.devices()
    devices.forEach((device: any) => {
      const key = 'android' + (device.type == 'emulator' ? '.emu' : '')
      const releaseTypes = ['debug', 'release']
      releaseTypes.forEach(releaseType => {
        const configKey = `${key}.${releaseType}`
        newConfigs[configKey] = configs[configKey]
        newConfigs[configKey].name = device.name
      })
    })
  } catch (err) {
    console.error('Could not find android device/emulator')
    throw err
  }

  return detoxConfig
}

/**
 * @async
 * @desc Returns the visible text from the element with testID
 *       initially based on https://github.com/wix/detox/issues/445#issuecomment-514801808
 * @param testID the testID of a <Text> element or a parent of one or more
 *               <Text> elements. If more than one is found the result is
 *               concatted
 * @param index  index of <Text> element value to return, instead of all
 *               concatted children. Leave undefined for default behavior
 * @returns visibleText all text visible inside the element with testID
 */
export const readVisibleText = async (
  testID: string,
  index: number | undefined = undefined,
): Promise<string> => {
  let el = element(by.id(testID).and(by.type(getNativeType('Text'))))
  if (index !== undefined) {
    //console.error('with index', index)
    el = el.atIndex(index)
  }
  try {
    await expect(el).toBeVisible()
  } catch (err) {
    // try looking for a text child
    el = element(by.type(getNativeType('Text')).withAncestor(by.id(testID)))
    if (index !== undefined) {
      //console.error('with index with text child', index)
      el = el.atIndex(index)
    }

    try {
      //console.error('expect with child')
      await expect(el).toBeVisible()
    } catch (err) {
      const msg = err.message.toString()
      if (msg.indexOf('matches multiple views in the hierarchy') == -1) {
        // if it is any other error than matching multiple views, we raise it
        //console.error('expect with child error', err)
        throw err
      }

      // if there are multiple matching Text views, we try to get the
      // concatenated text
      const MAX_TEXT_CHILDREN = 100
      const texts = []
      for (let i = 0; i < MAX_TEXT_CHILDREN; i++) {
        try {
          const text = await readVisibleText(testID, i)
          texts.push(text)
        } catch (err) {
          // TODO how do we know there are no more children vs. some other
          //      error?
          break
        }
      }

      return texts.join('')
    }
  }

  try {
    await expect(el).toHaveText('_you_cant_possible_have_this_text_')
    throw 'are you kidding me?'
  } catch (error) {
    if (device.getPlatform() === 'ios') {
      const start = `accessibilityLabel was "`
      const end = '" on '
      const errorMessage = error.message.toString()
      const [, restMessage] = errorMessage.split(start)
      const [label] = restMessage.split(end)
      return label
    } else {
      const start = 'Got:'
      const end = '}"'
      const errorMessage = error.message.toString()
      const [, restMessage] = errorMessage.split(start)
      const [label] = restMessage.split(end)
      const value = label.split(',')
      let combineText = value.find((i: string) => i.includes('text='))
      if (!combineText) {
        throw new Error(
          `readVisibleText failed! '${testID}' must be a testID of a <Text> element (or a parent of one)`,
        )
      } else {
        combineText = combineText.trim()
      }
      const [, elementText] = combineText.split('=')
      return elementText
    }
  }
}
