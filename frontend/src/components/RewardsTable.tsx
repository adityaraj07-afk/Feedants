import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { IPrizeBreakdown } from '../types';

interface Props {
  breakdown: IPrizeBreakdown[];
  currency: string;
}

export const RewardsTable: React.FC<Props> = ({ breakdown, currency }) => {
  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency;

  const getMedal = (pos: number) => {
    switch (pos) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '🎖️';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.headerIcon}>💎</Text>
        <Text style={styles.title}>Rewards & Prizes Breakdown</Text>
      </View>

      <View style={styles.table}>
        {breakdown.map((row) => (
          <View
            key={row.position}
            style={[styles.tableRow, row.position === 1 && styles.tableRowChampion]}
          >
            {/* Rank badge */}
            <View style={styles.rankCol}>
              <Text style={styles.medalIcon}>{getMedal(row.position)}</Text>
              <View>
                <Text style={styles.rankLabel}>{row.label}</Text>
                <Text style={styles.positionText}>Rank #{row.position}</Text>
              </View>
            </View>

            {/* Prize & Perks */}
            <View style={styles.rewardCol}>
              <Text style={styles.amount}>
                {symbol}
                {row.rewardAmount.toLocaleString()}
              </Text>

              {/* Perks Badges */}
              {row.perks && row.perks.length > 0 && (
                <View style={styles.perksContainer}>
                  {row.perks.map((perk, pIdx) => (
                    <View key={pIdx} style={styles.perkPill}>
                      <Text style={styles.perkText} numberOfLines={1}>
                        + {perk}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
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
  headerIcon: {
    fontSize: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  table: {
    gap: 8,
  },
  tableRow: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tableRowChampion: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  rankCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  medalIcon: {
    fontSize: 20,
  },
  rankLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  positionText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  rewardCol: {
    alignItems: 'flex-end',
    maxWidth: '52%',
  },
  amount: {
    color: colors.goldLight,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  perksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 4,
  },
  perkPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  perkText: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '600',
  },
});
