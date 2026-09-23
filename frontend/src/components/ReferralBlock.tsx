import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard, Share } from 'react-native';
import { colors } from '../theme/colors';
import { IReferralData } from '../types';

interface Props {
  referralData: IReferralData | null;
  userName: string;
}

export const ReferralBlock: React.FC<Props> = ({ referralData, userName }) => {
  const [copied, setCopied] = useState(false);

  if (!referralData) {
    return null;
  }

  const handleCopy = () => {
    if (referralData.referralLink) {
      Clipboard.setString(referralData.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Compete with me on Feedants! Use my referral code ${referralData.referralCode} to sign up: ${referralData.referralLink}`,
        url: referralData.referralLink,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badgeSpark}>
          <Text style={styles.badgeSparkIcon}>🎁</Text>
          <Text style={styles.badgeSparkText}>CREATOR PERKS</Text>
        </View>
        <Text style={styles.referralsCounter}>
          👥 {referralData.referralsCount} Friend{referralData.referralsCount === 1 ? '' : 's'} Referred
        </Text>
      </View>

      <Text style={styles.title}>Invite Creators, Earn Wildcard Perks</Text>
      <Text style={styles.subtitle}>
        Share your unique referral code with peers. Each confirmed friend registration advances you towards exclusive Feedants merchandise and wildcard bonus judging points!
      </Text>

      {/* Code & Copy Container */}
      <View style={styles.codeContainer}>
        <View style={styles.codeColumn}>
          <Text style={styles.codeLabel}>YOUR UNIQUE CODE</Text>
          <Text style={styles.codeValue}>{referralData.referralCode}</Text>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.copyButton, copied && styles.copyButtonActive]}
            onPress={handleCopy}
            activeOpacity={0.7}
          >
            <Text style={[styles.copyButtonText, copied && styles.copyButtonTextActive]}>
              {copied ? 'Copied! ✓' : 'Copy Link'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.7}>
            <Text style={styles.shareButtonText}>Share ↗</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bonus Perk Info */}
      <View style={styles.perkNotice}>
        <Text style={styles.perkNoticeText}>💡 {referralData.bonusPerk}</Text>
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
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeSpark: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  badgeSparkIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  badgeSparkText: {
    color: colors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  referralsCounter: {
    color: colors.emeraldLight,
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  codeContainer: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  codeColumn: {
    flex: 1,
  },
  codeLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  codeValue: {
    color: colors.goldLight,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  copyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  copyButtonActive: {
    backgroundColor: colors.emerald,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  copyButtonTextActive: {
    color: '#FFFFFF',
  },
  shareButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shareButtonText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  perkNotice: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  perkNoticeText: {
    color: colors.goldLight,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
});
