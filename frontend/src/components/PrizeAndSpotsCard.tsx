import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  prizePool?: {
    total: number;
    currency: string;
  };
  totalPrize?: number;
  currency?: string;
  entryFee: {
    amount: number;
    currency: string;
    isFree: boolean;
  };
  capacity: {
    maxSpots: number;
    filledSpots: number;
  };
  spotsLeft: number;
  isSpotsFull?: boolean;
}

export const PrizeAndSpotsCard: React.FC<Props> = ({
  prizePool,
  totalPrize,
  currency,
  entryFee,
  capacity,
  spotsLeft,
  isSpotsFull,
}) => {
  const finalTotal = prizePool?.total ?? totalPrize ?? 0;
  const finalCurrency = prizePool?.currency ?? currency ?? 'INR';
  const { maxSpots, filledSpots } = capacity;
  const progressPercent = Math.min(100, Math.max(0, Math.round((filledSpots / (maxSpots || 1)) * 100)));

  // Currency symbol formatting
  const symbol = finalCurrency === 'INR' || finalCurrency === '₹' ? '₹' : finalCurrency === 'USD' ? '$' : finalCurrency;
  const formattedPrize = `${symbol}${finalTotal.toLocaleString()}`;

  const isLowSpots = spotsLeft > 0 && spotsLeft <= 3;

  return (
    <View style={styles.card}>
      {/* Top Details: Prize Pool & Entry Fee */}
      <View style={styles.topRow}>
        <View style={styles.prizeColumn}>
          <Text style={styles.label}>TOTAL PRIZE POOL</Text>
          <View style={styles.prizeValueRow}>
            <Text style={styles.prizeAmount}>{formattedPrize}</Text>
            <View style={styles.guaranteedBadge}>
              <Text style={styles.guaranteedText}>Guaranteed</Text>
            </View>
          </View>
        </View>

        <View style={styles.feeColumn}>
          <Text style={styles.label}>ENTRY FEE</Text>
          <View style={[styles.feePill, entryFee.isFree ? styles.feeFree : styles.feePaid]}>
            <Text style={[styles.feeText, entryFee.isFree ? styles.feeTextFree : styles.feeTextPaid]}>
              {entryFee.isFree ? '100% FREE' : `${symbol}${entryFee.amount}`}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Spots Left Section */}
      <View style={styles.spotsSection}>
        <View style={styles.spotsHeaderRow}>
          <View style={styles.spotsLabelGroup}>
            <Text style={styles.spotsIcon}>👥</Text>
            <Text style={styles.spotsTitle}>Available Spots</Text>
          </View>
          <View style={styles.spotsCountBadge}>
            <Text style={[styles.spotsCountText, isSpotsFull ? styles.spotsCountFull : isLowSpots ? styles.spotsCountLow : null]}>
              {isSpotsFull ? 'All Spots Booked' : `${filledSpots}/${maxSpots} booked`}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressPercent}%` },
              isSpotsFull
                ? styles.fillFull
                : isLowSpots
                ? styles.fillWarning
                : styles.fillNormal,
            ]}
          />
        </View>

        {/* Dynamic Spots Status Footer */}
        <View style={styles.spotsFooterRow}>
          {isSpotsFull ? (
            <Text style={styles.spotsAlertFull}>🔴 Competition capacity reached (Registration Closed)</Text>
          ) : isLowSpots ? (
            <Text style={styles.spotsAlertLow}>🔥 Fast filling! Only {spotsLeft} spot{spotsLeft === 1 ? '' : 's'} remaining</Text>
          ) : (
            <Text style={styles.spotsAlertNormal}>✨ {spotsLeft} spots still available to claim</Text>
          )}
          <Text style={styles.percentText}>{progressPercent}% filled</Text>
        </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  prizeColumn: {
    flex: 1,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  prizeValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prizeAmount: {
    color: colors.goldLight,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  guaranteedBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  guaranteedText: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '700',
  },
  feeColumn: {
    alignItems: 'flex-end',
  },
  feePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 2,
  },
  feeFree: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  feePaid: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  feeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  feeTextFree: {
    color: colors.emeraldLight,
  },
  feeTextPaid: {
    color: colors.primaryLight,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  spotsSection: {},
  spotsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spotsLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  spotsIcon: {
    fontSize: 14,
  },
  spotsTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  spotsCountBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  spotsCountText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  spotsCountLow: {
    color: colors.goldLight,
  },
  spotsCountFull: {
    color: colors.roseLight,
  },
  progressBarTrack: {
    height: 9,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  fillNormal: {
    backgroundColor: colors.primary,
  },
  fillWarning: {
    backgroundColor: colors.gold,
  },
  fillFull: {
    backgroundColor: colors.rose,
  },
  spotsFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spotsAlertNormal: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  spotsAlertLow: {
    color: colors.goldLight,
    fontSize: 11,
    fontWeight: '600',
  },
  spotsAlertFull: {
    color: colors.roseLight,
    fontSize: 11,
    fontWeight: '600',
  },
  percentText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
});
