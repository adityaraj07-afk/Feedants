import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { ITabsContent } from '../types';

interface Props {
  tabsContent: ITabsContent;
}

type TabKey = 'about' | 'judging' | 'rules';

export const TabbedContent: React.FC<Props> = ({ tabsContent }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('about');

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'about', label: 'About', icon: '📖' },
    { key: 'judging', label: 'Judging Criteria', icon: '⚖️' },
    { key: 'rules', label: 'Rules & Eligibility', icon: '📜' },
  ];

  return (
    <View style={styles.card}>
      {/* Tab Switcher Headers */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Content Panels */}
      <View style={styles.contentBody}>
        {/* Tab 1: About */}
        {activeTab === 'about' && (
          <View style={styles.aboutPanel}>
            <Text style={styles.aboutText}>{tabsContent.about}</Text>
          </View>
        )}

        {/* Tab 2: Judging Parameters */}
        {activeTab === 'judging' && (
          <View style={styles.judgingPanel}>
            <Text style={styles.panelSubtitle}>
              Total Score: 100 Points. Evaluated objectively by Elena Rostova.
            </Text>
            {tabsContent.judgingParameters.map((param, index) => (
              <View key={index} style={styles.paramCard}>
                <View style={styles.paramHeaderRow}>
                  <Text style={styles.paramName}>{param.parameter}</Text>
                  <View style={styles.weightageBadge}>
                    <Text style={styles.weightageText}>{param.weightage}% WEIGHT</Text>
                  </View>
                </View>

                {/* Weightage Bar */}
                <View style={styles.weightageBarTrack}>
                  <View style={[styles.weightageBarFill, { width: `${param.weightage}%` }]} />
                </View>

                <Text style={styles.paramDesc}>{param.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tab 3: Rules & Eligibility */}
        {activeTab === 'rules' && (
          <View style={styles.rulesPanel}>
            <Text style={styles.panelSubtitle}>
              Please review all participation requirements carefully:
            </Text>
            {tabsContent.rulesAndEligibility.map((rule, idx) => (
              <View key={idx} style={styles.ruleItemRow}>
                <View style={styles.ruleNumberCircle}>
                  <Text style={styles.ruleNumberText}>{idx + 1}</Text>
                </View>
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    position: 'relative',
  },
  tabButtonActive: {
    backgroundColor: colors.surface,
  },
  tabIcon: {
    fontSize: 13,
  },
  tabLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: colors.primaryLight,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: 2.5,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  contentBody: {
    padding: 16,
  },
  aboutPanel: {},
  aboutText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  judgingPanel: {
    gap: 12,
  },
  panelSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  paramCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paramHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  paramName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  weightageBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  weightageText: {
    color: colors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
  },
  weightageBarTrack: {
    height: 5,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  weightageBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  paramDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  rulesPanel: {
    gap: 10,
  },
  ruleItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  ruleNumberCircle: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  ruleNumberText: {
    color: colors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
  },
  ruleText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
});
