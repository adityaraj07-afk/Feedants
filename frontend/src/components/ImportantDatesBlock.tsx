import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { ITimeline, LifecyclePhase } from '../types';

interface Props {
  timeline: ITimeline;
  currentPhase: LifecyclePhase;
}

export const ImportantDatesBlock: React.FC<Props> = ({ timeline, currentPhase }) => {
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const milestones = [
    {
      step: 1,
      title: 'Register By',
      date: formatDate(timeline.registrationEndDate),
      icon: '📝',
      isActive: currentPhase === 'registration_open' || currentPhase === 'registration_full',
      isPassed:
        currentPhase === 'registration_closed' ||
        currentPhase === 'submission_open' ||
        currentPhase === 'submission_closed' ||
        currentPhase === 'results_declared',
    },
    {
      step: 2,
      title: 'Submissions Open',
      date: formatDate(timeline.submissionStartDate),
      icon: '🚀',
      isActive: currentPhase === 'submission_open',
      isPassed: currentPhase === 'submission_closed' || currentPhase === 'results_declared',
    },
    {
      step: 3,
      title: 'Submissions Close',
      date: formatDate(timeline.submissionEndDate),
      icon: '⏰',
      isActive: currentPhase === 'submission_closed',
      isPassed: currentPhase === 'results_declared',
    },
    {
      step: 4,
      title: 'Results Declared',
      date: formatDate(timeline.resultDate),
      icon: '🏆',
      isActive: currentPhase === 'results_declared',
      isPassed: false,
    },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.titleIcon}>📅</Text>
        <Text style={styles.title}>Important Competition Dates</Text>
      </View>

      <View style={styles.timelineGrid}>
        {milestones.map((m, idx) => (
          <View
            key={m.step}
            style={[
              styles.milestoneBox,
              m.isActive && styles.milestoneBoxActive,
              m.isPassed && styles.milestoneBoxPassed,
            ]}
          >
            <View style={styles.milestoneHeader}>
              <Text style={styles.milestoneIcon}>{m.icon}</Text>
              {m.isActive ? (
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>ACTIVE</Text>
                </View>
              ) : m.isPassed ? (
                <Text style={styles.passedCheck}>✓</Text>
              ) : (
                <Text style={styles.stepNumber}>#{m.step}</Text>
              )}
            </View>

            <Text style={[styles.milestoneTitle, m.isActive && styles.milestoneTitleActive]}>
              {m.title}
            </Text>
            <Text style={[styles.milestoneDate, m.isActive && styles.milestoneDateActive]}>
              {m.date}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  titleIcon: {
    fontSize: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  timelineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  milestoneBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    width: '48%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  milestoneBoxActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  milestoneBoxPassed: {
    opacity: 0.7,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneIcon: {
    fontSize: 16,
  },
  activePill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  passedCheck: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: '900',
  },
  stepNumber: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  milestoneTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  milestoneTitleActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  milestoneDate: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  milestoneDateActive: {
    color: '#FFFFFF',
  },
});
