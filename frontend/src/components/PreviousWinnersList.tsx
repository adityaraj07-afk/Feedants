import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { colors } from '../theme/colors';
import { IWinner } from '../types';

interface Props {
  winners: IWinner[];
}

export const PreviousWinnersList: React.FC<Props> = ({ winners }) => {
  if (!winners || winners.length === 0) {
    return null;
  }

  const getRankBadgeStyle = (pos: number) => {
    switch (pos) {
      case 1:
        return { bg: 'rgba(245, 158, 11, 0.2)', border: colors.gold, color: colors.goldLight, label: '🥇 1st Place' };
      case 2:
        return { bg: 'rgba(148, 163, 184, 0.2)', border: '#CBD5E1', color: '#F1F5F9', label: '🥈 2nd Place' };
      case 3:
        return { bg: 'rgba(205, 127, 50, 0.2)', border: '#D97706', color: '#FDE68A', label: '🥉 3rd Place' };
      default:
        return { bg: 'rgba(99, 102, 241, 0.2)', border: colors.primary, color: colors.primaryLight, label: `#${pos}` };
    }
  };

  const handleOpenDemo = (url: string) => {
    if (url) {
      Linking.openURL(url).catch((err) => console.warn('Could not open winner media link:', err));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.headerIcon}>👑</Text>
          <Text style={styles.title}>Hall of Fame: Previous Winners</Text>
        </View>
        <Text style={styles.editionTag}>{winners[0]?.edition || 'Past Season'}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {winners.map((winner) => {
          const badge = getRankBadgeStyle(winner.position);
          return (
            <View key={winner._id} style={styles.winnerCard}>
              {/* Rank Pill */}
              <View style={[styles.rankPill, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                <Text style={[styles.rankText, { color: badge.color }]}>{badge.label}</Text>
              </View>

              {/* Avatar & User */}
              <View style={styles.userRow}>
                <Image source={{ uri: winner.userAvatarUrl }} style={styles.avatar} />
                <View style={styles.userMeta}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {winner.userName}
                  </Text>
                  <Text style={styles.userHandle}>{winner.userHandle}</Text>
                </View>
              </View>

              {/* Winning Project */}
              <View style={styles.projectSection}>
                <Text style={styles.projectLabel}>WINNING ROUTINE:</Text>
                <Text style={styles.projectTitle} numberOfLines={1}>
                  "{winner.winningProjectTitle}"
                </Text>
              </View>

              {/* Prize Won Pill */}
              <View style={styles.prizeWonRow}>
                <Text style={styles.prizeWonLabel}>Awarded:</Text>
                <Text style={styles.prizeWonValue}>{winner.prizeWon}</Text>
              </View>

              {/* Demo Link Button */}
              {winner.projectMediaUrl && (
                <TouchableOpacity
                  style={styles.demoButton}
                  onPress={() => handleOpenDemo(winner.projectMediaUrl)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.demoButtonText}>Watch Winning Clip ↗</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerIcon: {
    fontSize: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  editionTag: {
    color: colors.goldLight,
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
    gap: 12,
  },
  winnerCard: {
    backgroundColor: colors.surface,
    width: 240,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rankPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 10,
  },
  rankText: {
    fontSize: 11,
    fontWeight: '800',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  userMeta: {
    flex: 1,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  userHandle: {
    color: colors.textMuted,
    fontSize: 11,
  },
  projectSection: {
    backgroundColor: colors.surfaceElevated,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  projectLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  projectTitle: {
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
  prizeWonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  prizeWonLabel: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  prizeWonValue: {
    color: colors.goldLight,
    fontSize: 12,
    fontWeight: '800',
  },
  demoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  demoButtonText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
});
