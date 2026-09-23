import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { IUser, ICompetition } from '../types';

interface Props {
  users: IUser[];
  activeUser: IUser | null;
  onSelectUser: (user: IUser) => void;
  competitions: ICompetition[];
  activeCompetitionSlug: string;
  onSelectCompetition: (slug: string) => void;
}

export const DemoControlBar: React.FC<Props> = ({
  users,
  activeUser,
  onSelectUser,
  competitions,
  activeCompetitionSlug,
  onSelectCompetition,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.badgeLive}>
          <View style={styles.dot} />
          <Text style={styles.badgeLiveText}>FEEDANTS LIVE SYSTEM</Text>
        </View>
        <Text style={styles.helperText}>Switch User or Phase to test all dynamic states</Text>
      </View>

      {/* User Switcher */}
      <View style={styles.section}>
        <Text style={styles.label}>Active User:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {users.map((u) => {
            const isSelected = activeUser?._id === u._id;
            return (
              <TouchableOpacity
                key={u._id}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => onSelectUser(u)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  👤 {u.name.split(' ')[0]} {isSelected ? '✓' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Lifecycle Phase / Competition Switcher */}
      <View style={styles.section}>
        <Text style={styles.label}>Lifecycle Test:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {competitions.map((c) => {
            const isSelected = activeCompetitionSlug === c.slug;
            return (
              <TouchableOpacity
                key={c._id}
                style={[styles.phaseChip, isSelected && styles.phaseChipActive]}
                onPress={() => onSelectCompetition(c.slug)}
                activeOpacity={0.7}
              >
                <Text style={[styles.phaseChipText, isSelected && styles.phaseChipTextActive]}>
                  {c.currentPhase === 'registration_open' && '🟢 Reg Open'}
                  {c.currentPhase === 'registration_full' && '🔴 Reg Full'}
                  {c.currentPhase === 'submission_open' && '🚀 Sub Open'}
                  {c.currentPhase === 'submission_closed' && '⏳ In Review'}
                  {c.currentPhase === 'results_declared' && '🏆 Results Out'}
                  {c.currentPhase === 'upcoming' && '🗓️ Upcoming'}
                  {' ' + c.title.split(' ')[1]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F1523',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeLive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.emerald,
    marginRight: 6,
  },
  badgeLiveText: {
    color: colors.primaryLight,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  helperText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    width: 86,
  },
  chipsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  phaseChip: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  phaseChipActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderColor: colors.primary,
  },
  phaseChipText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  phaseChipTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
});
