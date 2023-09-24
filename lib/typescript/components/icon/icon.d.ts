import React from 'react';
import { ViewStyle, ImageStyle } from 'react-native';
import type { IconTypes } from './icons';
export interface IconProps {
    name: IconTypes;
    style?: ImageStyle | ImageStyle[];
    containerStyle?: ViewStyle;
    onPress?: () => void;
}
export declare function Icon(props: IconProps): React.JSX.Element;
//# sourceMappingURL=icon.d.ts.map