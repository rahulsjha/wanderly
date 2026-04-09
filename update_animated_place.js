const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/(tabs)/index.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /function AnimatedPlace\([^]*?return <Animated\.View style=\{style\}>\{children\}<\/Animated\.View>;\n\}/m;

const newFunc = `function AnimatedPlace({ children, index, scrollX, itemWidth }: any) {
  const style = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * itemWidth, index * itemWidth, (index + 1) * itemWidth];
    const scale = interpolate(scrollX.value, inputRange, [0.85, 1, 0.85], Extrapolation.CLAMP);         
    
    return {
      width: itemWidth,
      alignItems: 'center',
      justifyContent: 'center',
      transform: [{ scale }],
    };
  });

  return <Animated.View style={style}>{children}</Animated.View>;
}`;

content = content.replace(regex, newFunc);
fs.writeFileSync(filePath, content, 'utf8');
