import { useEffect } from "react";
import { BackHandler } from "react-native";

/**
 * @param shouldDisable callback that should return true if (Android) hardware
 *                      back button should be disabled from triggering a
 *                      navigation action
 */
export default (shouldDisable: () => boolean) => {
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', shouldDisable)
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', shouldDisable)
    }
  }, [shouldDisable])
}
