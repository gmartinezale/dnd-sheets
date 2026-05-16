import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { useThemeColors } from '@/shared/theme/useThemeColors';
import { AppScreen } from '@/shared/components/AppScreen';
import { Spacing, Radius } from '@/shared/theme/spacing';
import { FontSize, FontWeight, TextStyles } from '@/shared/theme/typography';
import { Ionicons } from '@expo/vector-icons';

const APP_VERSION = '1.0.0';

export default function SettingsScreen() {
  const colors = useThemeColors();
  const colorScheme = useColorScheme();

  return (
    <AppScreen>
      <View style={styles.header}>
        <Text style={[TextStyles.headingLarge, { color: colors['text.primary'] }]}>Settings</Text>
      </View>

      <Section title="Appearance" colors={colors}>
        <SettingRow
          icon="moon"
          label="Color Scheme"
          value={colorScheme === 'dark' ? 'Dark' : 'Light'}
          colors={colors}
        />
      </Section>

      <Section title="About" colors={colors}>
        <SettingRow icon="scroll" label="App" value="DnD Character Sheet" colors={colors} />
        <SettingRow icon="code-slash" label="Version" value={APP_VERSION} colors={colors} />
        <SettingRow icon="library" label="Rules Source" value="SRD 5.1 (CC BY 4.0)" colors={colors} />
        <SettingRow icon="link" label="Data API" value="dnd5eapi.co" colors={colors} />
      </Section>
    </AppScreen>
  );
}

function Section({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors['accent.primary'] }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors['background.secondary'], borderColor: colors['border.default'] }]}>
        {children}
      </View>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: string;
  label: string;
  value: string;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={[styles.row, { borderBottomColor: colors['border.default'] }]}>
      <Ionicons name={icon as 'moon'} size={18} color={colors['text.secondary']} style={{ marginRight: Spacing[3] }} />
      <Text style={[styles.rowLabel, { color: colors['text.primary'] }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors['text.muted'] }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Spacing[6],
    paddingBottom: Spacing[4],
  },
  section: {
    marginBottom: Spacing[6],
    gap: Spacing[2],
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing[1],
  },
  sectionCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 52,
  },
  rowLabel: {
    flex: 1,
    fontSize: FontSize.base,
  },
  rowValue: {
    fontSize: FontSize.base,
  },
});
