/**
 * @format
 */

import {AppRegistry} from "react-native";
// eslint-disable-next-line import/extensions, import/no-unresolved
import Root from "./src";
import {name as appName} from "./app.json";

AppRegistry.registerComponent(appName, () => Root);
