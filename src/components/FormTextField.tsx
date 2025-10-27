import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

type FormTextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  helperText?: string;
  rightElement?: React.ReactNode;
};

export const FormTextField = forwardRef<TextInput, FormTextFieldProps>(
  ({ label, error, helperText, rightElement, ...props }, ref) => {
    const hasError = Boolean(error);

    return (
      <View style={styles.container}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {rightElement}
        </View>
        <TextInput
          ref={ref}
          style={[
            styles.input,
            hasError ? styles.inputError : styles.inputNormal,
            props.editable === false && styles.inputDisabled,
          ]}
          placeholderTextColor="rgba(99,102,125,0.5)"
          {...props}
        />
        {hasError ? (
          <Text style={styles.error}>{error}</Text>
        ) : helperText ? (
          <Text style={styles.helper}>{helperText}</Text>
        ) : null}
      </View>
    );
  }
);

FormTextField.displayName = 'FormTextField';

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  input: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    shadowColor: '#1E293B',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  inputNormal: {
    borderColor: 'rgba(148, 163, 184, 0.35)',
  },
  inputError: {
    borderColor: '#FB7185',
    backgroundColor: 'rgba(254, 226, 226, 0.45)',
  },
  inputDisabled: {
    opacity: 0.6,
  },
  error: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F43F5E',
  },
  helper: {
    fontSize: 12,
    color: '#64748B',
  },
});
