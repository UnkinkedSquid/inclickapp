import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

type StepperProps = {
  totalSteps: number;
  currentStep: number;
};

export function Stepper({ totalSteps, currentStep }: StepperProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index <= currentStep;
        const isCompleted = index < currentStep;

        return (
          <Fragment key={index}>
            <View
              accessibilityRole="progressbar"
              accessibilityState={{ selected: isActive }}
              style={{
                height: 12,
                width: 12,
                borderRadius: 6,
                backgroundColor: isCompleted
                  ? '#3C6DFC'
                  : isActive
                  ? '#6B8CFF'
                  : 'rgba(148,163,184,0.55)',
                transform: [{ scale: isActive ? 1 : 0.9 }],
                opacity: isActive ? 1 : 0.35,
              }}
            />
            {index < totalSteps - 1 ? (
              <View
                style={[styles.connector, isCompleted ? styles.connectorActive : styles.connectorDefault]}
              />
            ) : null}
          </Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connector: {
    flex: 1,
    height: 2,
    borderRadius: 999,
    marginHorizontal: 8,
  },
  connectorDefault: {
    backgroundColor: 'rgba(148,163,184,0.35)',
  },
  connectorActive: {
    backgroundColor: '#3C6DFC',
  },
});
