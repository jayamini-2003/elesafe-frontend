import { Picker } from '@react-native-picker/picker';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from '../context/LocaleContext';
import { theme } from '../constants/theme';
import { fontFamily, fontSize, spacing } from '../utils/responsive';

export const PICKER_COLORS = {
  bg: '#FFFFFF',
  text: '#1A1A1A',
  border: '#D1D5DB',
  borderActive: theme.colors.primary,
};

type PickerItem = { label: string; value: string };

type AppPickerProps = {
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: PickerItem[];
  placeholder?: string;
  filled?: boolean;
};

/** Shared picker — white background, black text, works in Expo Go and APK builds */
export function AppPicker({
  selectedValue,
  onValueChange,
  items,
  placeholder,
  filled = false,
}: AppPickerProps) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t('common.select');

  return (
    <View style={[styles.box, filled && styles.boxFilled]}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={styles.picker}
        dropdownIconColor={PICKER_COLORS.borderActive}
        mode={Platform.OS === 'android' ? 'dropdown' : undefined}
        itemStyle={
          Platform.OS === 'ios'
            ? { color: PICKER_COLORS.text, fontSize: fontSize.base }
            : undefined
        }
      >
        <Picker.Item
          label={resolvedPlaceholder}
          value=""
          color={PICKER_COLORS.text}
          style={styles.pickerItem}
          {...(Platform.OS === 'android' ? { fontFamily: fontFamily.regular } : {})}
        />

        {items.map((item) => (
          <Picker.Item
            key={item.value || item.label}
            label={item.label}
            value={item.value}
            color={PICKER_COLORS.text}
            style={styles.pickerItem}
            {...(Platform.OS === 'android' ? { fontFamily: fontFamily.regular } : {})}
          />
        ))}
      </Picker>
    </View>
  );
}

type LabeledPickerProps = AppPickerProps & { label: string };

export function LabeledPicker({ label, ...props }: LabeledPickerProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.labeledWrap}>
      <Text style={styles.labeledLabel}>{label}</Text>
      <AppPicker {...props} placeholder={t('common.selectLabel', { label })} />
    </View>
  );
}

const styles = StyleSheet.create({
  labeledWrap: { marginBottom: spacing.sm },
  labeledLabel: {
    color: theme.colors.textMuted,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semiBold,
    letterSpacing: 0.8,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  box: {
    backgroundColor: PICKER_COLORS.bg,
    borderWidth: 1.5,
    borderColor: PICKER_COLORS.border,
    borderRadius: theme.radius.md,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
  },
  boxFilled: {
    borderColor: PICKER_COLORS.borderActive,
  },
  picker: {
    color: PICKER_COLORS.text,
    backgroundColor: PICKER_COLORS.bg,
    width: '100%',
    fontSize: fontSize.base,
    ...(Platform.OS === 'android' ? { height: 50 } : { height: 48 }),
  },
  pickerItem: {
    backgroundColor: '#FFFFFF',
    color: '#1A1A1A',
    fontSize: fontSize.base,
  },
});
