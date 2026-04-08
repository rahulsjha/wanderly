import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

export function JaliPattern({ opacity = 0.08 }: { opacity?: number }) {
  return (
    <Svg width="100%" height="100%" style={{ opacity }}>
      <Defs>
        <Pattern id="jali" patternUnits="userSpaceOnUse" width={28} height={28}>
          <Circle cx={6} cy={6} r={1.2} fill="white" />
          <Circle cx={20} cy={6} r={1.2} fill="white" />
          <Circle cx={13} cy={13} r={1.2} fill="white" />
          <Circle cx={6} cy={20} r={1.2} fill="white" />
          <Circle cx={20} cy={20} r={1.2} fill="white" />
          <Circle cx={13} cy={27} r={1.2} fill="white" />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width="100%" height="100%" fill="url(#jali)" />
    </Svg>
  );
}
