import React from 'react';
import { VideoAspect, ZoomVideoSdkUser } from '@zoom/react-native-videosdk';
export interface VideoViewInterface {
    user?: ZoomVideoSdkUser;
    sharing?: boolean;
    preview?: boolean;
    fullScreen?: boolean;
    focused?: boolean;
    videoAspect?: VideoAspect;
    hasMultiCamera?: boolean;
    multiCameraIndex?: string;
    onPress?: (user: ZoomVideoSdkUser) => void;
}
export declare function VideoView(props: VideoViewInterface): React.JSX.Element;
//# sourceMappingURL=video-view.d.ts.map