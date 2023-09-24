"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useIsMounted = void 0;
var _react = require("react");
const useIsMounted = () => {
  const mountedRef = (0, _react.useRef)(false);
  const isMounted = (0, _react.useCallback)(() => mountedRef.current, []);
  (0, _react.useEffect)(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  return isMounted;
};
exports.useIsMounted = useIsMounted;
//# sourceMappingURL=hooks.js.map