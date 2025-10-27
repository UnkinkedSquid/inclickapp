import { ReactNode } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

type GlassCardProps = {
  children: ReactNode;
  containerStyle?: ViewProps['style'];
  contentStyle?: ViewProps['style'];
} & Omit<ViewProps, 'style'>;

export function GlassCard({ children, containerStyle, contentStyle, ...rest }: GlassCardProps) {
  return (
    <View style={[styles.wrapper, containerStyle]} {...rest}>
      <View style={[styles.inner, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.75)',
    padding: 1,
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    overflow: 'hidden',
  },
  inner: {
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 24,
  },
});
