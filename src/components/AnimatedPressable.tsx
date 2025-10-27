import { forwardRef, useRef, type ElementRef } from 'react';
import {
  Animated,
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
} from 'react-native';

export type AnimatedPressableProps = PressableProps;

type PressableRef = ElementRef<typeof Pressable>;

export const AnimatedPressable = forwardRef<PressableRef, AnimatedPressableProps>(
  ({ onPressIn, onPressOut, style, ...props }, ref) => {
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    const animateTo = (toScale: number, toOpacity: number) => {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: toScale,
          speed: 20,
          bounciness: 6,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: toOpacity,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const handlePressIn = (event: GestureResponderEvent) => {
      animateTo(0.97, 0.85);
      onPressIn?.(event);
    };

    const handlePressOut = (event: GestureResponderEvent) => {
      animateTo(1, 1);
      onPressOut?.(event);
    };

    return (
      <Animated.View
        style={[
          { transform: [{ scale }] },
          { opacity },
        ]}
      >
        <Pressable
          ref={ref}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={style}
          {...props}
        />
      </Animated.View>
    );
  }
);

AnimatedPressable.displayName = 'AnimatedPressable';
