import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedPressable } from './AnimatedPressable';

type ChipProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  onPress?: () => void;
};

export function Chip({ label, selected = false, disabled = false, icon, onPress }: ChipProps) {
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.container,
        selected ? styles.containerSelected : styles.containerDefault,
        disabled && styles.containerDisabled,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={[styles.label, selected ? styles.labelSelected : styles.labelDefault]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  containerDefault: {
    borderColor: 'rgba(148,163,184,0.25)',
    backgroundColor: 'rgba(226,232,240,0.35)',
  },
  containerSelected: {
    borderColor: 'rgba(37,99,235,0.4)',
    backgroundColor: 'rgba(219,234,254,0.65)',
  },
  containerDisabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  labelDefault: {
    color: '#1F2937',
  },
  labelSelected: {
    color: '#1D4ED8',
  },
});
